<template>
  <div class="my-comments-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>我的评价</h1>
        <p>管理您发表的入住评价</p>
      </div>

      <!-- 统计概览 -->
      <div class="comment-stats" v-if="stats.total > 0">
        <div class="stat-item">
          <span class="stat-num">{{ stats.total }}</span>
          <span class="stat-label">全部评价</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">{{ stats.avgScore }}</span>
          <span class="stat-label">平均评分</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">{{ stats.likedCount }}</span>
          <span class="stat-label">获赞总数</span>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-input v-model="searchHotel" placeholder="搜索酒店名称" clearable prefix-icon="Search" style="width: 240px" @input="filterList" />
        <el-select v-model="scoreFilter" placeholder="评分筛选" clearable style="width: 130px" @change="filterList">
          <el-option label="5星" :value="5" />
          <el-option label="4星" :value="4" />
          <el-option label="3星" :value="3" />
          <el-option label="2星" :value="2" />
          <el-option label="1星" :value="1" />
        </el-select>
      </div>

      <!-- 评价卡片列表 -->
      <div v-if="filteredComments.length > 0" class="comment-cards">
        <div v-for="item in filteredComments" :key="item.id" class="comment-card">
          <div class="card-image">
            <img :src="item.hotelImage || defaultImg" alt="酒店" />
          </div>
          <div class="card-body">
            <div class="card-top">
              <div class="card-info">
                <h3>{{ item.hotelName || '酒店' }}</h3>
                <el-rate :model-value="item.score" disabled size="small" text-color="#ff9900" />
                <span class="card-date">{{ item.createTime }}</span>
              </div>
              <div class="card-status">
                <el-tag v-if="item.status === '0'" type="warning" size="small">待审核</el-tag>
                <el-tag v-else-if="item.status === '2'" type="danger" size="small">审核未通过</el-tag>
                <el-tag v-else type="success" size="small">已发布</el-tag>
              </div>
            </div>

            <p class="card-text" :class="{ collapsed: !item.expanded }">{{ item.content }}</p>
            <a
              v-if="item.content && item.content.length > 100"
              class="expand-link"
              @click="item.expanded = !item.expanded"
            >{{ item.expanded ? '收起' : '展开' }}</a>

            <div class="card-images" v-if="parseImages(item.images).length > 0">
              <el-image
                v-for="(img, idx) in parseImages(item.images).slice(0, 4)"
                :key="idx"
                :src="img"
                style="width: 70px; height: 70px; border-radius: 6px; margin-right: 6px; cursor: pointer"
                fit="cover"
                :preview-src-list="parseImages(item.images)"
              />
            </div>

            <!-- 商家回复 -->
            <div v-if="item.replyContent" class="reply-box">
              <span class="reply-label">💬 商家回复：</span>{{ item.replyContent }}
            </div>

            <div class="card-footer">
              <span class="footer-like" :class="{ liked: item._liked }" @click="handleLike(item)">
                <svg class="like-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m7-2V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14Z"/>
                </svg>
                <span>{{ item.likeCount || 0 }}</span>
              </span>
              <span class="likes-detail" @click="handleShowLikes(item)" v-if="(item.likeCount || 0) > 0">
                谁赞过
              </span>
              <div class="footer-actions">
                <el-button link type="primary" size="small" @click="handleView(item)">详情</el-button>
                <el-button link type="primary" size="small" @click="handleEdit(item)" v-if="item.status === '1'">修改</el-button>
                <el-button link type="warning" size="small" @click="handleAppend(item)" v-if="item.status === '1'">追加</el-button>
                <el-button link type="danger" size="small" @click="handleDelete(item)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-else description="还没有评价，去预订酒店体验吧！" :image-size="160">
        <el-button type="primary" @click="goHome">去看看酒店</el-button>
      </el-empty>
    </div>

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

    <!-- ========== 查看详情对话框 ========== -->
    <el-dialog title="评价详情" v-model="viewOpen" width="600px" append-to-body>
      <div class="detail-section" v-if="viewForm.id">
        <p><strong>酒店：</strong>{{ viewForm.hotelName || '-' }}</p>
        <p><strong>评分：</strong><el-rate :model-value="viewForm.score" disabled show-score text-color="#ff9900" size="small" /></p>
        <p><strong>内容：</strong></p>
        <p class="detail-text">{{ viewForm.content }}</p>
        <div v-if="parseImages(viewForm.images).length > 0" style="margin: 10px 0">
          <el-image
            v-for="(img, idx) in parseImages(viewForm.images)"
            :key="idx"
            :src="img"
            style="width: 140px; height: 100px; border-radius: 6px; margin-right: 8px"
            fit="cover"
            :preview-src-list="parseImages(viewForm.images)"
          />
        </div>
        <p><strong>发表时间：</strong>{{ viewForm.createTime }}</p>
        <div v-if="viewForm.replyContent" class="reply-box">
          <strong>商家回复：</strong>{{ viewForm.replyContent }}
          <p style="font-size:12px;color:#999;margin-top:4px">{{ viewForm.replyTime }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="MyComments">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listMyComments, deleteMyComment, myCommentStatistics, likeComment, getCommentLikes } from '@/api/biz/comment'

const router = useRouter()

const allComments = ref([])
const searchHotel = ref('')
const scoreFilter = ref(null)
const defaultImg = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop'

const stats = ref({ total: 0, avgScore: 0, likedCount: 0 })

const viewOpen = ref(false)
const viewForm = ref({})
const likesOpen = ref(false)
const likesList = ref([])

const filteredComments = computed(() => {
  let list = allComments.value
  if (searchHotel.value) {
    const kw = searchHotel.value.toLowerCase()
    list = list.filter(c => c.hotelName && c.hotelName.toLowerCase().includes(kw))
  }
  if (scoreFilter.value) {
    list = list.filter(c => c.score === scoreFilter.value)
  }
  return list
})

function filterList() { /* computed 自动处理 */ }

function goHome() { router.push('/home') }

function handleView(item) {
  viewForm.value = item
  viewOpen.value = true
}

function handleEdit(item) {
  router.push({ path: '/user/comment/edit/' + item.id, query: { orderId: item.orderId } })
}

function handleAppend(item) {
  router.push({ path: '/user/comment/append/' + item.id })
}

async function handleDelete(item) {
  try {
    await ElMessageBox.confirm('确认删除这条评价吗？删除后不可恢复。', '删除确认', { type: 'warning' })
    await deleteMyComment(item.id)
    ElMessage.success('评价已删除')
    loadData()
  } catch { /* 取消 */ }
}

function getInitial(name) {
  return (name || '用').charAt(0)
}

async function handleLike(item) {
  try {
    const res = await likeComment(item.id)
    if (res.msg && res.msg.includes('取消')) {
      item._liked = false
      item.likeCount = Math.max(0, (item.likeCount || 0) - 1)
    } else {
      item._liked = true
      item.likeCount = (item.likeCount || 0) + 1
    }
  } catch { /* 错误已处理 */ }
}

async function handleShowLikes(item) {
  try {
    const res = await getCommentLikes(item.id)
    likesList.value = res.data || []
    likesOpen.value = true
  } catch { likesList.value = [] }
}

function parseImages(images) {
  if (!images) return []
  if (Array.isArray(images)) return images
  try {
    const arr = JSON.parse(images)
    return Array.isArray(arr) ? arr : []
  } catch {
    return images ? [images] : []
  }
}

async function loadData() {
  try {
    const [commentRes, statsRes] = await Promise.allSettled([
      listMyComments({ pageNum: 1, pageSize: 50 }),
      myCommentStatistics()
    ])
    if (commentRes.status === 'fulfilled') {
      const data = commentRes.value
      allComments.value = (data.rows || data.data?.rows || []).map(c => ({ ...c, expanded: false }))
    }
    if (statsRes.status === 'fulfilled') {
      const s = statsRes.value
      stats.value = {
        total: s.data?.total || s.total || allComments.value.length,
        avgScore: s.data?.avgScore || s.avgScore || 0,
        likedCount: s.data?.likedCount || s.likedCount || 0
      }
    }
  } catch {
    // 降级：空列表
  }
}

onMounted(() => { loadData() })
</script>

<style scoped>
.my-comments-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 6px;
}

.page-header p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 统计 */
.comment-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.stat-item {
  background: #fff;
  border-radius: 10px;
  padding: 20px 28px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  flex: 1;
}

.stat-num {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #ff6b6b;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 6px;
  display: block;
}

/* 筛选 */
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

/* 评价卡片 */
.comment-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  gap: 16px;
}

.card-image {
  width: 140px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 8px;
}

.card-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.card-date {
  font-size: 12px;
  color: #bbb;
}

.card-text {
  font-size: 14px;
  color: #555;
  line-height: 1.7;
  margin: 0 0 8px;
}

.card-text.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.expand-link {
  color: #409eff;
  font-size: 13px;
  cursor: pointer;
}

.card-images {
  margin: 8px 0;
}

.reply-box {
  margin-top: 10px;
  padding: 10px 14px;
  background: #f0fdf4;
  border-radius: 8px;
  font-size: 13px;
  color: #555;
  line-height: 1.6;
}

.reply-label {
  font-weight: 600;
  color: #16a34a;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.footer-like {
  font-size: 13px;
  color: #999;
}

.footer-actions {
  display: flex;
  gap: 4px;
}

/* 详情 */
.detail-section p {
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.detail-text {
  white-space: pre-wrap;
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
}

/* 点赞 */
.footer-like {
  cursor: pointer;
  font-size: 14px;
  color: #999;
  transition: all 0.2s;
  user-select: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.footer-like:hover {
  color: #e74c3c;
}

.footer-like:hover .like-emoji {
  transform: scale(1.2);
}

.footer-like.liked {
  color: #e74c3c;
  font-weight: 600;
}

.footer-like.liked .like-emoji {
  filter: none;
}

.like-icon {
  display: inline-block;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.likes-detail {
  font-size: 12px;
  color: #409eff;
  cursor: pointer;
  margin-left: 8px;
}

.likes-detail:hover {
  text-decoration: underline;
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
