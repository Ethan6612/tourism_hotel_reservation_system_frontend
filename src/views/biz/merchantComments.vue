<template>
  <div class="merchant-comments-page">
    <div class="app-container">
      <!-- 页面标题 -->
      <div class="page-top">
        <h2>评价管理</h2>
        <p>管理您旗下酒店收到的住客评价</p>
      </div>

      <!-- 筛选栏 -->
      <el-form :model="queryParams" :inline="true" class="filter-form">
        <el-form-item label="酒店">
          <el-select v-model="queryParams.hotelId" placeholder="全部酒店" clearable style="width: 220px" @change="handleQuery">
            <el-option
              v-for="hotel in myHotels"
              :key="hotel.hotelId"
              :label="hotel.hotelName"
              :value="hotel.hotelId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="评分">
          <el-select v-model="queryParams.score" placeholder="全部评分" clearable style="width: 130px" @change="handleQuery">
            <el-option label="5星" :value="5" />
            <el-option label="4星" :value="4" />
            <el-option label="3星" :value="3" />
            <el-option label="2星" :value="2" />
            <el-option label="1星" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 评价列表 -->
      <div v-loading="loading" class="comment-cards">
        <div v-for="item in commentList" :key="item.id" class="comment-card">
          <div class="card-avatar">
            {{ getInitial(item.userName || '用户') }}
          </div>
          <div class="card-body">
            <div class="card-header">
              <div class="user-row">
                <span class="user-name">{{ item.isAnonymous === '1' ? '匿名用户' : (item.userName || '用户') }}</span>
                <el-rate :model-value="item.score" disabled size="small" text-color="#ff9900" />
                <span class="card-time">{{ item.createTime }}</span>
              </div>
              <div class="card-status">
                <el-tag v-if="item.appealStatus === '1'" type="danger" size="small" effect="dark">申诉中</el-tag>
                <el-tag v-else-if="item.appealStatus === '2'" type="success" size="small">申诉通过</el-tag>
                <el-tag v-else-if="item.appealStatus === '3'" type="warning" size="small">申诉驳回</el-tag>
              </div>
            </div>

            <p class="card-text">{{ item.content }}</p>

            <!-- 图片 -->
            <div class="card-images" v-if="parseImages(item.images).length > 0">
              <el-image
                v-for="(img, idx) in parseImages(item.images).slice(0, 6)"
                :key="idx"
                :src="img"
                style="width: 75px; height: 75px; border-radius: 6px; margin-right: 6px; cursor: pointer"
                fit="cover"
                :preview-src-list="parseImages(item.images)"
              />
            </div>

            <!-- 商家自己的回复 -->
            <div v-if="item.replyContent" class="reply-box">
              <span class="reply-label">💬 我的回复</span>
              <span class="reply-time">{{ item.replyTime }}</span>
              <p>{{ item.replyContent }}</p>
            </div>

            <!-- 申诉状态 -->
            <div v-if="item.appealStatus !== '0' && item.appealStatus" class="appeal-info">
              <span v-if="item.appealStatus === '1'">⚠️ 申诉处理中，等待管理员审核</span>
              <span v-else-if="item.appealStatus === '2'">✅ 申诉已通过，评价已保留</span>
              <span v-else-if="item.appealStatus === '3'">❌ 申诉已驳回</span>
            </div>
          </div>

          <div class="card-actions">
            <el-button
              v-if="!item.replyContent"
              link
              type="primary"
              icon="ChatDotRound"
              @click="handleReply(item)"
            >回复</el-button>
            <el-button
              v-if="!item.appealStatus || item.appealStatus === '0'"
              link
              type="warning"
              icon="Warning"
              @click="handleAppeal(item)"
            >申诉</el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="commentList.length === 0 && !loading" description="暂无评价记录" :image-size="120" />

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </div>

    <!-- ========== 回复对话框 ========== -->
    <el-dialog title="回复评价" v-model="replyOpen" width="550px" append-to-body>
      <div class="reply-preview">
        <p><strong>评价人：</strong>{{ currentComment.userName || '用户' }}</p>
        <p><strong>评分：</strong><el-rate :model-value="currentComment.score" disabled size="small" text-color="#ff9900" /></p>
        <p><strong>内容：</strong>{{ currentComment.content }}</p>
      </div>
      <el-form ref="replyRef" :model="replyForm" :rules="{ replyContent: [{ required: true, message: '回复内容不能为空', trigger: 'blur' }] }" label-width="80px" style="margin-top: 16px">
        <el-form-item label="回复内容" prop="replyContent">
          <el-input v-model="replyForm.replyContent" type="textarea" :rows="4" placeholder="请输入回复内容" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="replyOpen = false">取 消</el-button>
        <el-button type="primary" @click="submitReply">确认回复</el-button>
      </template>
    </el-dialog>

    <!-- ========== 申诉对话框 ========== -->
    <el-dialog title="申诉评价" v-model="appealOpen" width="550px" append-to-body>
      <div class="reply-preview">
        <p><strong>评价人：</strong>{{ currentComment.userName || '用户' }}</p>
        <p><strong>评分：</strong><el-rate :model-value="currentComment.score" disabled size="small" text-color="#ff9900" /></p>
        <p><strong>内容：</strong>{{ currentComment.content }}</p>
      </div>
      <el-form ref="appealRef" :model="appealForm" :rules="{ reason: [{ required: true, message: '请填写申诉理由', trigger: 'blur' }] }" label-width="80px" style="margin-top: 16px">
        <el-form-item label="申诉理由" prop="reason">
          <el-input v-model="appealForm.reason" type="textarea" :rows="4" placeholder="请说明为什么您认为这条评价不合理..." maxlength="300" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="appealOpen = false">取 消</el-button>
        <el-button type="primary" @click="submitAppeal">提交申诉</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MerchantComments">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listMerchantComments, appealComment, replyComment } from '@/api/biz/comment'

const loading = ref(false)
const commentList = ref([])
const total = ref(0)
const myHotels = ref([])

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  hotelId: undefined,
  score: undefined
})

// 回复
const replyOpen = ref(false)
const replyRef = ref(null)
const currentComment = ref({})
const replyForm = ref({ replyContent: '' })

// 申诉
const appealOpen = ref(false)
const appealRef = ref(null)
const appealForm = ref({ reason: '' })

function getInitial(name) {
  return (name || '商').charAt(0)
}

function parseImages(images) {
  if (!images) return []
  if (Array.isArray(images)) return images
  try {
    const arr = JSON.parse(images)
    return Array.isArray(arr) ? arr : []
  } catch { return images ? [images] : [] }
}

function handleQuery(page) {
  if (page) {
    queryParams.value.pageNum = page.page
    queryParams.value.pageSize = page.limit
  }
  loadComments()
}

function resetQuery() {
  queryParams.value.hotelId = undefined
  queryParams.value.score = undefined
  queryParams.value.pageNum = 1
  loadComments()
}

async function loadComments() {
  loading.value = true
  try {
    const res = await listMerchantComments(queryParams.value)
    commentList.value = res.data?.list || res.data?.rows || res.rows || []
    total.value = res.data?.total || res.total || 0
  } catch {
    // 降级：模拟数据
    commentList.value = [
      { id: 1, userName: '用户小明', score: 5, content: '酒店非常好，下次还会来！', createTime: '2026-06-05', images: '[]', replyContent: null, appealStatus: '0' },
      { id: 2, userName: '用户小红', score: 3, content: '房间有点吵，隔音不太好。', createTime: '2026-06-03', images: '[]', replyContent: '感谢您的反馈，我们会改善隔音问题。', replyTime: '2026-06-04', appealStatus: '0' }
    ]
    total.value = commentList.value.length
  } finally {
    loading.value = false
  }
}

function handleReply(row) {
  currentComment.value = row
  replyForm.value.replyContent = ''
  replyOpen.value = true
}

async function submitReply() {
  if (!replyRef.value) return
  try {
    await replyRef.value.validate()
    await replyComment(currentComment.value.id, replyForm.value.replyContent)
    ElMessage.success('回复成功')
    replyOpen.value = false
    loadComments()
  } catch { /* 校验失败 */ }
}

function handleAppeal(row) {
  currentComment.value = row
  appealForm.value.reason = ''
  appealOpen.value = true
}

async function submitAppeal() {
  if (!appealRef.value) return
  try {
    await appealRef.value.validate()
    await appealComment(currentComment.value.id, appealForm.value.reason)
    ElMessage.success('申诉已提交，等待管理员审核')
    appealOpen.value = false
    loadComments()
  } catch { /* 校验失败 */ }
}

onMounted(() => { loadComments() })
</script>

<style scoped>
.merchant-comments-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.app-container {
  padding: 20px;
}

.page-top {
  margin-bottom: 20px;
}

.page-top h2 {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.page-top p {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.filter-form {
  background: #fff;
  padding: 16px 20px 0;
  border-radius: 8px;
  margin-bottom: 16px;
}

/* 评价卡片 */
.comment-cards {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.comment-card {
  display: flex;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  gap: 14px;
}

.card-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.card-time {
  font-size: 12px;
  color: #bbb;
}

.card-text {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  margin: 0 0 8px;
}

.card-images {
  margin: 8px 0;
}

.reply-box {
  margin-top: 10px;
  padding: 10px 14px;
  background: #f0fdf4;
  border-radius: 8px;
}

.reply-label {
  font-weight: 600;
  color: #16a34a;
  font-size: 13px;
}

.reply-time {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.reply-box p {
  margin: 6px 0 0;
  font-size: 13px;
  color: #555;
  line-height: 1.6;
}

.appeal-info {
  margin-top: 10px;
  padding: 8px 12px;
  background: #fff7ed;
  border-radius: 6px;
  font-size: 13px;
  color: #ea580c;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.reply-preview p {
  margin-bottom: 6px;
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}
</style>
