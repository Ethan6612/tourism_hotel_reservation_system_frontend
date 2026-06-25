<template>
  <div class="write-comment-page">
    <div class="container">
      <!-- 返回按钮 -->
      <div class="back-row">
        <el-button link @click="goBack"><el-icon><ArrowLeft /></el-icon>返回</el-button>
      </div>

      <!-- 页面标题 -->
      <div class="page-header">
        <h1 v-if="mode === 'write'">写评价</h1>
        <h1 v-else-if="mode === 'edit'">修改评价</h1>
        <h1 v-else>追加评价</h1>
        <p v-if="mode === 'write'">分享您的入住体验，帮助其他旅客做出更好的选择</p>
        <p v-else-if="mode === 'edit'">修改您之前的评价内容</p>
        <p v-else>对之前的评价进行补充说明</p>
      </div>

      <!-- 订单/酒店信息卡片 -->
      <div class="info-card" v-if="orderInfo.hotelName">
        <div class="info-img">
          <img :src="orderInfo.hotelImage || defaultImg" alt="酒店" />
        </div>
        <div class="info-body">
          <h3>{{ orderInfo.hotelName }}</h3>
          <p>{{ orderInfo.roomType || '' }}</p>
          <p>入住：{{ orderInfo.checkInDate }} → 退房：{{ orderInfo.checkOutDate }}</p>
        </div>
      </div>

      <!-- 现有评价（追加/修改模式下显示） -->
      <div class="existing-comment" v-if="existingComment.content && (mode === 'edit' || mode === 'append')">
        <h4 v-if="mode === 'edit'">当前评价内容</h4>
        <h4 v-else>原评价内容</h4>
        <div class="existing-body">
          <el-rate :model-value="existingComment.score" disabled size="small" text-color="#ff9900" />
          <p>{{ existingComment.content }}</p>
          <span class="existing-time">{{ existingComment.createTime }}</span>
        </div>
      </div>

      <!-- 表单 -->
      <div class="form-card">
        <!-- 评分（写/修改模式显示） -->
        <div class="form-section" v-if="mode !== 'append'">
          <label class="form-label">整体评分 <span class="required">*</span></label>
          <div class="score-input">
            <el-rate v-model="form.score" :max="5" show-score text-color="#ff9900" size="large" />
            <span class="score-hint">{{ scoreHint }}</span>
          </div>
        </div>

        <!-- 评价内容 -->
        <div class="form-section">
          <label class="form-label">
            {{ mode === 'append' ? '追加内容' : '评价内容' }}
            <span class="required" v-if="mode !== 'append'">*</span>
          </label>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            :placeholder="mode === 'append' ? '补充您的住宿体验...' : '分享您的入住体验：房间如何？服务怎么样？有什么推荐的吗？'"
            maxlength="2000"
            show-word-limit
          />
        </div>

        <!-- 图片上传（写/修改模式显示） -->
        <div class="form-section" v-if="mode !== 'append'">
          <label class="form-label">上传图片 <span class="optional">（选填，最多6张）</span></label>
          <div class="image-upload-area">
            <div
              v-for="(img, idx) in form.images"
              :key="idx"
              class="upload-item"
            >
              <el-image :src="img" style="width:100px;height:100px;border-radius:8px" fit="cover" />
              <span class="remove-img" @click="removeImage(idx)">✕</span>
            </div>
            <div
              v-if="form.images.length < 6"
              class="upload-trigger"
              @click="triggerUpload"
            >
              <span class="upload-icon">+</span>
              <span class="upload-text">添加图片</span>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              style="display:none"
              @change="handleFileChange"
            />
          </div>
        </div>

        <!-- 匿名评价（写/修改模式显示） -->
        <div class="form-section" v-if="mode !== 'append'">
          <label class="form-label">匿名评价</label>
          <el-switch v-model="form.isAnonymous" active-text="匿名" inactive-text="公开" />
        </div>

        <!-- 提交 -->
        <div class="form-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ mode === 'write' ? '发布评价' : mode === 'edit' ? '保存修改' : '提交追加' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="WriteComment">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { submitComment, getComment, updateMyComment, appendComment } from '@/api/biz/comment'
import { getOrderDetail } from '@/api/front/userHome'

const router = useRouter()
const route = useRoute()

const mode = computed(() => {
  const name = route.name
  if (name === 'EditComment') return 'edit'
  if (name === 'AppendComment') return 'append'
  return 'write'
})

const commentId = computed(() => route.params.id)
const defaultImg = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop'

const form = ref({
  score: 5,
  content: '',
  images: [],
  isAnonymous: false
})

const submitting = ref(false)
const fileInput = ref(null)

const orderInfo = ref({
  hotelId: undefined,
  hotelName: '',
  hotelImage: '',
  roomType: '',
  checkInDate: '',
  checkOutDate: ''
})

const existingComment = ref({
  score: 0,
  content: '',
  createTime: ''
})

const scoreHint = computed(() => {
  const s = form.value.score
  const hints = { 1: '非常差', 2: '较差', 3: '一般', 4: '满意', 5: '非常棒' }
  return hints[s] || ''
})

function goBack() { router.back() }

function triggerUpload() {
  fileInput.value?.click()
}

async function handleFileChange(e) {
  const files = e.target.files
  for (const file of files) {
    if (form.value.images.length >= 6) break
    const formData = new FormData()
    formData.append('file', file)
    try {
      const base = import.meta.env.VITE_APP_BASE_API || ''
      const res = await fetch(base + '/api/upload/image', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('上传失败')
      const json = await res.json()
      if (json.code === 200) {
        form.value.images.push(json.data || json.msg)
      } else {
        throw new Error(json.msg || '上传失败')
      }
    } catch {
      // 上传失败时使用本地预览
      const url = URL.createObjectURL(file)
      form.value.images.push(url)
    }
  }
  e.target.value = ''
}

function removeImage(idx) {
  form.value.images.splice(idx, 1)
}

async function handleSubmit() {
  if (mode.value !== 'append' && !form.value.content.trim()) {
    ElMessage.warning('请输入评价内容')
    return
  }
  if (mode.value === 'append' && !form.value.content.trim()) {
    ElMessage.warning('请输入追加内容')
    return
  }

  submitting.value = true
  try {
    if (mode.value === 'write') {
      const data = {
        orderId: route.query.orderId,
        hotelId: route.query.hotelId || orderInfo.value.hotelId,
        roomId: route.query.roomId || undefined,
        score: form.value.score,
        content: form.value.content,
        images: JSON.stringify(form.value.images),
        isAnonymous: form.value.isAnonymous ? '1' : '0'
      }
      await submitComment(data)
      ElMessage.success('评价发布成功！')
    } else if (mode.value === 'edit') {
      const data = {
        id: commentId.value,
        hotelId: route.query.hotelId || orderInfo.value.hotelId,
        score: form.value.score,
        content: form.value.content,
        images: JSON.stringify(form.value.images),
        isAnonymous: form.value.isAnonymous ? '1' : '0'
      }
      await updateMyComment(data)
      ElMessage.success('评价修改成功')
    } else if (mode.value === 'append') {
      await appendComment(commentId.value, form.value.content)
      ElMessage.success('追加评价成功')
    }
    router.back()
  } catch {
    // 错误已在拦截器中处理
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  // 从 query 获取订单信息（写评价模式）
  orderInfo.value = {
    hotelId: route.query.hotelId || undefined,
    hotelName: route.query.hotelName || '',
    hotelImage: route.query.hotelImage || '',
    roomType: route.query.roomType || '',
    checkInDate: route.query.checkInDate || '',
    checkOutDate: route.query.checkOutDate || ''
  }
  // 如果 hotelId 缺失，从订单详情获取
  if (!orderInfo.value.hotelId && route.query.orderId) {
    try {
      const res = await getOrderDetail(route.query.orderId)
      const data = res.data || res
      orderInfo.value.hotelId = data.hotelId || data.hotel_id
      orderInfo.value.hotelName = data.hotelName || data.hotel_name || orderInfo.value.hotelName
      orderInfo.value.roomType = data.roomType || data.room_type || orderInfo.value.roomType
    } catch { /* 忽略 */ }
  }
  // 编辑/追加模式：加载已有评价
  if (mode.value === 'edit' || mode.value === 'append') {
    try {
      const res = await getComment(commentId.value)
      const data = res.data || res
      existingComment.value = {
        score: data.score,
        content: data.content,
        createTime: data.createTime
      }
      orderInfo.value = {
        hotelName: data.hotelName || '',
        hotelImage: data.hotelImage || '',
        roomType: data.roomType || '',
        checkInDate: data.checkInDate || '',
        checkOutDate: data.checkOutDate || ''
      }
      if (mode.value === 'edit') {
        form.value.score = data.score
        form.value.content = data.content
        form.value.images = parseImages(data.images)
        form.value.isAnonymous = data.isAnonymous === '1'
      }
    } catch {
      ElMessage.error('加载评价信息失败')
    }
  }
})

function parseImages(images) {
  if (!images) return []
  if (Array.isArray(images)) return images
  try {
    const arr = JSON.parse(images)
    return Array.isArray(arr) ? arr : []
  } catch { return images ? [images] : [] }
}
</script>

<style scoped>
.write-comment-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 30px 20px 60px;
}

.back-row {
  margin-bottom: 16px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: #333;
  margin-bottom: 6px;
}

.page-header p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 订单信息卡片 */
.info-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  gap: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.info-img {
  width: 120px;
  height: 84px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.info-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-body h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.info-body p {
  font-size: 13px;
  color: #888;
  margin: 2px 0;
}

/* 现有评价 */
.existing-comment {
  background: #f0f7ff;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  border-left: 3px solid #409eff;
}

.existing-comment h4 {
  font-size: 14px;
  color: #409eff;
  margin: 0 0 10px;
}

.existing-body p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 8px 0;
}

.existing-time {
  font-size: 12px;
  color: #bbb;
}

/* 表单 */
.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.form-section {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.required { color: #ef4444; }
.optional { font-weight: 400; color: #999; font-size: 13px; }

.score-input {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-hint {
  font-size: 15px;
  color: #ff6b6b;
  font-weight: 500;
}

/* 图片上传 */
.image-upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.upload-item {
  position: relative;
}

.remove-img {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
}

.upload-trigger {
  width: 100px;
  height: 100px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-trigger:hover {
  border-color: #409eff;
  background: #f0f5ff;
}

.upload-icon {
  font-size: 28px;
  color: #bbb;
}

.upload-text {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
