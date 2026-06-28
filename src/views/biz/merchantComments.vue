<template>
  <div class="merchant-comments-page">
    <div class="page-top">
      <h2>评价管理</h2>
      <p>管理您旗下酒店收到的住客评价</p>
    </div>
    <div class="comment-layout">
      <!-- 左侧：酒店列表 -->
      <div class="left-panel">
        <div class="panel-header">
          <div class="panel-row">
            <span class="panel-title">酒店列表</span>
            <el-select v-model="sortOrder" size="small" style="width:100px" @change="sortHotels">
              <el-option label="评分 ↓" value="desc" />
              <el-option label="评分 ↑" value="asc" />
            </el-select>
          </div>
        </div>
        <div class="hotel-list" v-loading="loading">
          <div v-for="hotel in sortedHotels" :key="hotel.hotelId" :class="['hotel-item', { active: currentHotelId === hotel.hotelId }]" @click="selectHotel(hotel)">
            <div class="hotel-item-main">
              <span class="hotel-name">{{ hotel.hotelName }}</span>
              <div class="hotel-meta">
                <el-rate :model-value="Number(hotel.avgScore || 0)" disabled size="small" text-color="#ff9900" />
                <span class="hotel-score-text">{{ formatScore(hotel.avgScore) }}</span>
              </div>
            </div>
            <div class="hotel-item-extra">
              <span class="comment-count">{{ hotel.totalComments || 0 }} 条</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
          <el-empty v-if="sortedHotels.length === 0 && !loading" description="暂无酒店数据" :image-size="80" />
        </div>
      </div>
      <!-- 右侧：评价列表 -->
      <div class="right-panel">
        <div class="comment-toolbar" v-if="currentHotelId">
          <div class="toolbar-left">
            <span class="current-hotel-name">{{ currentHotelName }}</span>
            <el-tag type="info" size="small">共 {{ total }} 条</el-tag>
          </div>
          <div class="toolbar-right">
            <el-input v-model="queryParams.keyword" placeholder="搜索内容..." clearable prefix-icon="Search" style="width:180px" @keyup.enter="loadComments" @clear="loadComments" />
            <el-select v-model="queryParams.score" placeholder="评分" clearable style="width:90px" @change="loadComments">
              <el-option label="5星" :value="5" /><el-option label="4星" :value="4" /><el-option label="3星" :value="3" /><el-option label="2星" :value="2" /><el-option label="1星" :value="1" />
            </el-select>
            <el-select v-model="queryParams.roomType" placeholder="房型" clearable style="width:130px" @change="loadComments">
              <el-option v-for="rt in roomTypes" :key="rt" :label="rt" :value="rt" />
            </el-select>
          </div>
        </div>
        <div class="comment-list" v-loading="commentLoading">
          <template v-if="currentHotelId && commentList.length > 0">
            <div v-for="item in commentList" :key="item.id" class="comment-card">
              <div class="card-left"><div class="user-avatar">{{ getInitial(item.userName || '用户') }}</div></div>
              <div class="card-body">
                <div class="card-header">
                  <div class="user-info">
                    <span class="user-name">{{ item.userName || '用户' }}</span>
                    <el-rate :model-value="item.score" disabled size="small" text-color="#ff9900" />
                    <span class="comment-time">{{ item.createTime }}</span>
                  </div>
                  <div class="card-tags">
                    <el-tag v-if="item.appealStatus === '1'" type="danger" size="small">申诉中</el-tag>
                    <el-tag v-else-if="item.status === '2'" type="info" size="small">已下架</el-tag>
                  </div>
                </div>
                <div class="room-info" v-if="item.roomType"><span class="room-tag">🛏️ {{ item.roomType }}</span></div>
                <p class="card-content" :class="{ collapsed: !item.expanded }">{{ item.content }}</p>
                <a v-if="item.content && item.content.length > 120" class="expand-btn" @click="item.expanded = !item.expanded">{{ item.expanded ? '收起' : '展开全文' }}</a>
                <div class="likes-bar">
                  <span class="likes-count" @click="showLikes(item)" v-if="(item.likeCount || 0) > 0">👍 {{ item.likeCount }} 人赞过</span>
                  <span class="likes-count muted" v-else>👍 {{ item.likeCount || 0 }}</span>
                </div>
                <div class="card-images" v-if="parseImages(item.images).length > 0">
                  <el-image v-for="(img, idx) in parseImages(item.images).slice(0, 6)" :key="idx" :src="img" style="width:75px;height:75px;border-radius:6px;margin-right:6px;cursor:pointer" fit="cover" :preview-src-list="parseImages(item.images)" />
                </div>
                <div v-if="item.replyContent" class="reply-box">
                  <div class="reply-header-row"><span class="reply-label">💬 我的回复</span><span class="reply-time">{{ item.replyTime }}</span></div>
                  <div v-if="getReplies(item.replyContent).length <= 1"><p>{{ getReplies(item.replyContent)[0]?.text || item.replyContent }}</p></div>
                  <div v-else>
                    <div class="reply-latest"><span class="reply-tag">最新回复</span><p>{{ getReplies(item.replyContent)[0]?.text }}</p></div>
                    <div v-if="item._showAllReplies" class="reply-history">
                      <div v-for="(r, ri) in getReplies(item.replyContent).slice(1)" :key="ri" class="reply-history-item"><span class="reply-history-time">{{ r.time }}</span><p>{{ r.text }}</p></div>
                    </div>
                    <el-button link type="primary" size="small" @click="item._showAllReplies = !item._showAllReplies">{{ item._showAllReplies ? '收起' : '查看历史回复 (' + (getReplies(item.replyContent).length - 1) + '条)' }}</el-button>
                  </div>
                </div>
                <div v-if="item.appealStatus === '1'" class="appeal-info">⚠️ 申诉处理中</div>
              </div>
              <div class="card-actions">
                <el-button link type="primary" icon="ChatDotRound" @click="handleReply(item)">{{ item.replyContent ? '再次回复' : '回复' }}</el-button>
                <el-button v-if="!item.appealStatus || item.appealStatus === '0'" link type="warning" icon="Warning" @click="handleAppeal(item)">申诉</el-button>
              </div>
            </div>
            <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="loadComments" />
          </template>
          <div v-if="!currentHotelId" class="empty-prompt"><span class="prompt-icon">👈</span><p>请从左侧选择一个酒店</p></div>
          <el-empty v-if="currentHotelId && commentList.length === 0 && !commentLoading" description="该酒店暂无评价" :image-size="120" />
        </div>
      </div>
    </div>
    <el-dialog title="回复评价" v-model="replyOpen" width="550px" append-to-body>
      <el-form ref="replyRef" :model="replyForm" :rules="{ replyContent: [{ required: true, message: '回复不能为空', trigger: 'blur' }] }" label-width="80px">
        <el-form-item label="评价内容"><el-input :model-value="currentComment.content" type="textarea" :rows="2" disabled /></el-form-item>
        <el-form-item label="回复内容" prop="replyContent"><el-input v-model="replyForm.replyContent" type="textarea" :rows="4" maxlength="500" show-word-limit /></el-form-item>
      </el-form>
      <template #footer><el-button @click="replyOpen = false">取消</el-button><el-button type="primary" @click="submitReply">确认回复</el-button></template>
    </el-dialog>
    <el-dialog title="申诉评价" v-model="appealOpen" width="550px" append-to-body>
      <el-form ref="appealRef" :model="appealForm" :rules="{ reason: [{ required: true, message: '请填写申诉理由', trigger: 'blur' }] }" label-width="80px">
        <el-form-item label="申诉理由" prop="reason"><el-input v-model="appealForm.reason" type="textarea" :rows="4" maxlength="300" show-word-limit /></el-form-item>
      </el-form>
      <template #footer><el-button @click="appealOpen = false">取消</el-button><el-button type="primary" @click="submitAppeal">提交申诉</el-button></template>
    </el-dialog>
    <el-dialog title="👍 点赞详情" v-model="likesOpen" width="420px" append-to-body>
      <div v-if="likesList.length > 0" class="likes-list">
        <div v-for="u in likesList" :key="u.id" class="likes-user"><span class="likes-avatar">{{ getInitial(u.userName) }}</span><span class="likes-name">{{ u.userName }}</span><span class="likes-time">{{ u.createTime }}</span></div>
      </div>
      <el-empty v-else description="暂无点赞" :image-size="80" />
    </el-dialog>
  </div>
</template>

<script setup name="MerchantComments">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import { listMerchantComments, appealComment, merchantReplyComment, getCommentLikes } from '@/api/biz/comment'

const loading = ref(false)
const commentLoading = ref(false)
const allHotels = ref([])
const sortOrder = ref('desc')
const currentHotelId = ref(null)
const currentHotelName = ref('')
const commentList = ref([])
const total = ref(0)
const roomTypes = ref([])
const queryParams = ref({ pageNum: 1, pageSize: 10, score: undefined, keyword: '', roomType: '' })

const replyOpen = ref(false); const replyRef = ref(null); const currentComment = ref({}); const replyForm = ref({ replyContent: '' })
const appealOpen = ref(false); const appealRef = ref(null); const appealForm = ref({ reason: '' })
const likesOpen = ref(false); const likesList = ref([])

const sortedHotels = computed(() => {
  const list = [...allHotels.value]
  if (sortOrder.value === 'asc') list.sort((a, b) => (a.avgScore || 0) - (b.avgScore || 0))
  else list.sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0))
  return list
})

function getInitial(n) { return (n || '用').charAt(0) }
function formatScore(s) { const n = Number(s); return isNaN(n) ? '-' : n.toFixed(1) }

function getReplies(c) { if (!c) return []; const p = c.split(/【(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})】/g); const r = []; for (let i = 1; i < p.length; i += 2) r.push({ time: p[i], text: (p[i + 1] || '').trim() }); if (r.length === 0 && c.trim()) r.push({ time: '', text: c.trim() }); return r.reverse() }
function parseImages(images) { if (!images) return []; if (Array.isArray(images)) return images; try { const arr = JSON.parse(images); return Array.isArray(arr) ? arr : [] } catch { return images ? [images] : [] } }

function selectHotel(hotel) { currentHotelId.value = hotel.hotelId; currentHotelName.value = hotel.hotelName; queryParams.value.pageNum = 1; loadComments() }

async function loadComments(paginationParams) {
  if (!currentHotelId.value) return
  if (paginationParams) { queryParams.value.pageNum = paginationParams.page; queryParams.value.pageSize = paginationParams.limit }
  commentLoading.value = true
  try {
    const params = { pageNum: queryParams.value.pageNum, pageSize: queryParams.value.pageSize, hotelId: currentHotelId.value, score: queryParams.value.score || undefined, keyword: queryParams.value.keyword || undefined }
    const res = await listMerchantComments(params)
    const list = (res.data?.rows || res.data?.list || res.rows || []).map(i => ({ ...i, _showAllReplies: false }))
    const types = new Set(); list.forEach(i => { if (i.roomType) types.add(i.roomType) })
    roomTypes.value = [...types].sort()
    commentList.value = queryParams.value.roomType ? list.filter(i => i.roomType === queryParams.value.roomType) : list
    total.value = res.data?.total || res.total || 0
  } finally { commentLoading.value = false }
}

async function loadHotels() {
  loading.value = true
  try {
    // 先获取所有评价，从中提取酒店信息
    const res = await listMerchantComments({ pageNum: 1, pageSize: 200 })
    const list = res.data?.rows || res.data?.list || res.rows || []
    const hotelMap = new Map()
    list.forEach(item => {
      if (item.hotelId && item.hotelName) {
        if (!hotelMap.has(item.hotelId)) {
          hotelMap.set(item.hotelId, { hotelId: item.hotelId, hotelName: item.hotelName, totalScores: 0, count: 0, totalComments: 0 })
        }
        const h = hotelMap.get(item.hotelId)
        h.totalScores += (item.score || 0)
        h.count++
        h.totalComments++
      }
    })
    allHotels.value = Array.from(hotelMap.values()).map(h => ({ ...h, avgScore: h.count > 0 ? (h.totalScores / h.count).toFixed(1) : 0 }))
    if (allHotels.value.length > 0 && !currentHotelId.value) selectHotel(allHotels.value[0])
  } catch { allHotels.value = [] } finally { loading.value = false }
}

function sortHotels() { /* computed handles */ }

function handleReply(row) { currentComment.value = row; replyForm.value.replyContent = ''; replyOpen.value = true }
async function submitReply() { try { await replyRef.value.validate(); await merchantReplyComment(currentComment.value.id, replyForm.value.replyContent); ElMessage.success('回复成功'); replyOpen.value = false; loadComments() } catch { /* ignore */ } }
function handleAppeal(row) { currentComment.value = row; appealForm.value.reason = ''; appealOpen.value = true }
async function submitAppeal() { try { await appealRef.value.validate(); await appealComment(currentComment.value.id, appealForm.value.reason); ElMessage.success('申诉已提交'); appealOpen.value = false } catch { /* ignore */ } }
async function showLikes(item) { try { const res = await getCommentLikes(item.id); likesList.value = res.data || []; likesOpen.value = true } catch { likesList.value = [] } }

onMounted(() => { loadHotels() })
</script>

<style scoped>
.merchant-comments-page { min-height: 100vh; background: #f5f7fa; padding: 20px; }
.page-top { margin-bottom: 16px; }
.page-top h2 { font-size: 22px; font-weight: 700; color: #333; margin-bottom: 4px; }
.page-top p { font-size: 13px; color: #999; margin: 0; }
.comment-layout { display: flex; gap: 0; min-height: calc(100vh - 160px); border: 1px solid #ebeef5; border-radius: 8px; overflow: hidden; background: #fff; }
.left-panel { width: 280px; min-width: 280px; border-right: 1px solid #ebeef5; display: flex; flex-direction: column; background: #fafbfc; }
.panel-header { padding: 14px; border-bottom: 1px solid #ebeef5; }
.panel-row { display: flex; align-items: center; justify-content: space-between; }
.panel-title { font-weight: 600; color: #333; font-size: 14px; }
.hotel-list { flex: 1; overflow-y: auto; }
.hotel-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; cursor: pointer; border-bottom: 1px solid #f0f0f0; transition: all 0.2s; }
.hotel-item:hover { background: #f0f5ff; }
.hotel-item.active { background: #e8f0fe; border-left: 3px solid #409eff; }
.hotel-item-main { flex: 1; min-width: 0; }
.hotel-name { font-size: 14px; font-weight: 600; color: #333; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 6px; }
.hotel-meta { display: flex; align-items: center; gap: 6px; }
.hotel-score-text { font-size: 13px; color: #ff6b6b; font-weight: 700; }
.hotel-item-extra { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
.comment-count { font-size: 12px; color: #999; }
.right-panel { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.comment-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #ebeef5; background: #fafbfc; flex-wrap: wrap; gap: 8px; }
.toolbar-left { display: flex; align-items: center; gap: 10px; }
.current-hotel-name { font-size: 16px; font-weight: 700; color: #333; }
.toolbar-right { display: flex; align-items: center; gap: 8px; }
.comment-list { flex: 1; overflow-y: auto; padding: 16px 20px; }
.comment-card { display: flex; padding: 18px; background: #fff; border: 1px solid #f0f0f0; border-radius: 10px; margin-bottom: 14px; }
.comment-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.card-left { flex-shrink: 0; margin-right: 14px; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 600; }
.card-body { flex: 1; min-width: 0; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px; }
.user-info { display: flex; align-items: center; gap: 10px; }
.user-name { font-size: 14px; font-weight: 600; color: #333; }
.comment-time { font-size: 12px; color: #bbb; }
.card-tags { display: flex; gap: 6px; }
.room-info { margin-bottom: 8px; }
.room-tag { display: inline-block; padding: 3px 10px; background: #f0f5ff; border-radius: 10px; font-size: 12px; color: #409eff; }
.card-content { font-size: 14px; color: #555; line-height: 1.7; margin: 0; }
.card-content.collapsed { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.expand-btn { color: #409eff; font-size: 13px; cursor: pointer; }
.likes-bar { margin: 8px 0; }
.likes-count { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: #666; cursor: pointer; padding: 2px 10px; background: #fafafa; border-radius: 12px; transition: all 0.2s; }
.likes-count:hover { color: #e74c3c; background: #fef2f2; }
.likes-count.muted { cursor: default; color: #ccc; background: transparent; }
.card-images { margin: 8px 0; }
.reply-box { margin-top: 10px; padding: 10px 14px; background: #f0fdf4; border-radius: 8px; }
.reply-header-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
.reply-label { font-weight: 600; color: #16a34a; font-size: 13px; }
.reply-time { font-size: 12px; color: #999; }
.reply-box p { margin: 4px 0; font-size: 13px; color: #555; }
.reply-latest { padding: 6px 0; }
.reply-tag { display: inline-block; font-size: 10px; padding: 1px 6px; background: #22c55e; color: #fff; border-radius: 8px; margin-bottom: 4px; }
.reply-history { border-top: 1px dashed #d1d5db; margin-top: 6px; padding-top: 6px; }
.reply-history-item { margin-bottom: 6px; padding-left: 8px; border-left: 2px solid #e5e7eb; }
.reply-history-time { font-size: 11px; color: #999; }
.appeal-info { margin-top: 10px; padding: 8px 12px; background: #fff7ed; border-radius: 6px; font-size: 13px; color: #ea580c; }
.card-actions { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; margin-left: 12px; }
.empty-prompt { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #999; }
.prompt-icon { font-size: 48px; margin-bottom: 16px; }
.likes-list { max-height: 350px; overflow-y: auto; }
.likes-user { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.likes-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; }
.likes-name { flex: 1; font-size: 14px; color: #333; }
.likes-time { font-size: 12px; color: #bbb; }
</style>
