<template>
  <div class="merchant-comments-page">
    <div class="app-container">
      <!-- 页面标题 -->
      <div class="page-top">
        <h2>评价管理</h2>
        <p>管理您旗下酒店收到的住客评价</p>
      </div>

      <!-- 酒店信息 + 筛选 -->
      <div class="hotel-info-bar">
        <div class="hotel-tag">
          <span class="hotel-tag-icon">🏨</span>
          <span class="hotel-tag-name">{{ myHotelName || '加载中...' }}</span>
        </div>
      </div>
      <div class="filter-bar">
        <el-input v-model="queryParams.keyword" placeholder="搜索评价内容..." clearable prefix-icon="Search" style="width: 220px" @keyup.enter="handleQuery" @clear="handleQuery" />
        <el-select v-model="queryParams.score" placeholder="全部评分" clearable style="width: 110px" @change="handleQuery">
          <el-option label="5星" :value="5" /><el-option label="4星" :value="4" /><el-option label="3星" :value="3" /><el-option label="2星" :value="2" /><el-option label="1星" :value="1" />
        </el-select>
        <el-select v-model="queryParams.roomType" placeholder="全部房型" clearable style="width: 150px" @change="handleQuery">
          <el-option v-for="rt in roomTypes" :key="rt" :label="rt" :value="rt" />
        </el-select>
        <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </div>

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

            <!-- 房型信息 -->
            <div class="room-info" v-if="item.roomType">
              <span class="room-tag">🛏️ {{ item.roomType }}</span>
            </div>

            <p class="card-text">{{ item.content }}</p>

            <!-- 点赞数 -->
            <div class="likes-bar">
              <span class="likes-count" @click="showLikes(item)" v-if="(item.likeCount || 0) > 0">
                <svg class="like-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m7-2V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14Z"/></svg>
                {{ item.likeCount }} 人赞过
              </span>
              <span class="likes-count muted" v-else>
                <svg class="like-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m7-2V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14Z"/></svg>
                {{ item.likeCount || 0 }}
              </span>
            </div>

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

            <!-- 商家回复 -->
            <div v-if="item.replyContent" class="reply-box">
              <div class="reply-header-row">
                <span class="reply-label">💬 我的回复</span>
                <span class="reply-time">{{ item.replyTime }}</span>
              </div>
              <div v-if="getReplies(item.replyContent).length <= 1" class="reply-body">
                <p>{{ getReplies(item.replyContent)[0]?.text || item.replyContent }}</p>
              </div>
              <div v-else class="reply-body">
                <div class="reply-latest">
                  <span class="reply-tag">最新回复</span>
                  <p>{{ getReplies(item.replyContent)[0]?.text }}</p>
                </div>
                <div v-if="item._showAllReplies" class="reply-history">
                  <div v-for="(r, ri) in getReplies(item.replyContent).slice(1)" :key="ri" class="reply-history-item">
                    <span class="reply-history-time">{{ r.time }}</span>
                    <p>{{ r.text }}</p>
                  </div>
                </div>
                <el-button link type="primary" size="small" @click="item._showAllReplies = !item._showAllReplies">
                  {{ item._showAllReplies ? '收起历史回复' : '查看历史回复 (' + (getReplies(item.replyContent).length - 1) + '条)' }}
                </el-button>
              </div>
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
              link
              type="primary"
              icon="ChatDotRound"
              @click="handleReply(item)"
            >{{ item.replyContent ? '再次回复' : '回复' }}</el-button>
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

    <!-- ========== 点赞列表对话框 ========== -->
    <el-dialog title="👍 点赞详情" v-model="likesOpen" width="420px" append-to-body>
      <div v-if="likesList.length > 0" class="likes-list">
        <div v-for="u in likesList" :key="u.id" class="likes-user">
          <span class="likes-avatar">{{ getInitial(u.userName || '用户') }}</span>
          <span class="likes-name">{{ u.userName || '用户' }}</span>
          <span class="likes-time">{{ u.createTime }}</span>
        </div>
      </div>
      <el-empty v-else description="暂无点赞" :image-size="80" />
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
import { listMerchantComments, appealComment, merchantReplyComment, getCommentLikes } from '@/api/biz/comment'

const loading = ref(false)
const commentList = ref([])
const total = ref(0)
const myHotelName = ref('')
const roomTypes = ref([])

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  score: undefined,
  keyword: '',
  roomType: ''
})

// 回复
const replyOpen = ref(false)
const replyRef = ref(null)
const currentComment = ref({})
const replyForm = ref({ replyContent: '' })

// 点赞列表
const likesOpen = ref(false)
const likesList = ref([])

// 申诉
const appealOpen = ref(false)
const appealRef = ref(null)
const appealForm = ref({ reason: '' })

function getInitial(name) {
  return (name || '商').charAt(0)
}

function getReplies(replyContent) {
  if (!replyContent) return []
  // 按 【yyyy-MM-dd HH:mm:ss】 分割多条回复
  const parts = replyContent.split(/【(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})】/g)
  const replies = []
  for (let i = 1; i < parts.length; i += 2) {
    replies.push({ time: parts[i], text: (parts[i + 1] || '').trim() })
  }
  // 没分割成功则当作一条
  if (replies.length === 0 && replyContent.trim()) {
    replies.push({ time: '', text: replyContent.trim() })
  }
  // 最新在前
  return replies.reverse()
}

function parseImages(images) {
  if (!images) return []
  if (Array.isArray(images)) return images
  try {
    const arr = JSON.parse(images)
    return Array.isArray(arr) ? arr : []
  } catch { return images ? [images] : [] }
}

async function showLikes(item) {
  try {
    const res = await getCommentLikes(item.id)
    likesList.value = res.data || []
    likesOpen.value = true
  } catch { likesList.value = [] }
}

function handleQuery(page) {
  if (page) {
    queryParams.value.pageNum = page.page
    queryParams.value.pageSize = page.limit
  }
  loadComments()
}

function resetQuery() {
  queryParams.value.score = undefined
  queryParams.value.keyword = ''
  queryParams.value.roomType = ''
  queryParams.value.pageNum = 1
  loadComments()
}

async function loadComments() {
  loading.value = true
  try {
    const res = await listMerchantComments(queryParams.value)
    const list = (res.data?.list || res.data?.rows || res.rows || []).map(item => ({
      ...item,
      _showAllReplies: false
    }))
    // 收集房型列表（去重）
    const types = new Set()
    list.forEach(item => { if (item.roomType) types.add(item.roomType) })
    roomTypes.value = [...types].sort()
    // 客户端房型筛选
    commentList.value = queryParams.value.roomType
      ? list.filter(item => item.roomType === queryParams.value.roomType)
      : list
    total.value = res.data?.total || res.total || 0
    if (list.length > 0 && list[0].hotelName && !myHotelName.value) {
      myHotelName.value = list[0].hotelName
    }
  } catch {
    commentList.value = []
    total.value = 0
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
    await merchantReplyComment(currentComment.value.id, replyForm.value.replyContent)
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

.hotel-info-bar {
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hotel-tag {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hotel-tag-icon {
  font-size: 24px;
}

.hotel-tag-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 10px;
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

.room-info {
  margin-bottom: 8px;
}

.room-tag {
  display: inline-block;
  padding: 3px 10px;
  background: #f0f5ff;
  border-radius: 10px;
  font-size: 12px;
  color: #409eff;
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

.filter-bar {
  background: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.reply-box {
  margin-top: 10px;
  padding: 10px 14px;
  background: #f0fdf4;
  border-radius: 8px;
}

.reply-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.reply-label {
  font-weight: 600;
  color: #16a34a;
  font-size: 13px;
}

.reply-time {
  font-size: 12px;
  color: #999;
}

.reply-body p {
  margin: 4px 0;
  font-size: 13px;
  color: #555;
  line-height: 1.6;
}

.reply-latest {
  padding: 6px 0;
}

.reply-tag {
  display: inline-block;
  font-size: 10px;
  padding: 1px 6px;
  background: #22c55e;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 4px;
}

.reply-history {
  border-top: 1px dashed #d1d5db;
  margin-top: 6px;
  padding-top: 6px;
}

.reply-history-item {
  margin-bottom: 6px;
  padding-left: 8px;
  border-left: 2px solid #e5e7eb;
}

.reply-history-time {
  font-size: 11px;
  color: #999;
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

/* 点赞 */
.likes-bar {
  margin: 8px 0;
}

.likes-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  padding: 2px 10px;
  background: #fafafa;
  border-radius: 12px;
}

.likes-count:hover {
  color: #e74c3c;
  background: #fef2f2;
}

.likes-count.muted {
  cursor: default;
  color: #ccc;
  background: transparent;
}

.likes-count.muted:hover {
  color: #ccc;
  background: transparent;
}

.like-svg {
  flex-shrink: 0;
}

.likes-list {
  max-height: 350px;
  overflow-y: auto;
}

.likes-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.likes-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.likes-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.likes-time {
  font-size: 12px;
  color: #bbb;
}
</style>
