<template>
  <div class="appeal-manage">
    <div class="appeal-layout">
      <div class="left-panel">
        <div class="panel-header">
          <el-input v-model="hotelSearch" placeholder="搜索酒店" clearable prefix-icon="Search" @input="filterHotels" />
        </div>
        <div class="hotel-list" v-loading="hotelLoading">
          <div v-for="hotel in filteredHotels" :key="hotel.hotelId" :class="['hotel-item', { active: currentHotelId === hotel.hotelId }]" @click="selectHotel(hotel)">
            <div class="hotel-item-main">
              <span class="hotel-name">{{ hotel.hotelName }}</span>
              <div class="hotel-meta">
                <span class="appeal-badge">{{ hotel.appealCount }} 条申诉</span>
              </div>
            </div>
            <div class="hotel-item-extra">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
          <el-empty v-if="filteredHotels.length === 0 && !hotelLoading" description="暂无申诉数据" :image-size="80" />
        </div>
      </div>
      <div class="right-panel">
        <div class="comment-toolbar" v-if="currentHotelId">
          <div class="toolbar-left">
            <span class="current-hotel-name">{{ currentHotelName }}</span>
            <el-tag type="danger" size="small">共 {{ total }} 条申诉</el-tag>
          </div>
        </div>
        <div class="comment-list" v-loading="commentLoading">
          <template v-if="currentHotelId && commentList.length > 0">
            <div v-for="item in commentList" :key="item.id" class="comment-card">
              <div class="card-left"><div class="user-avatar">{{ getInitial(item.userName || '用户') }}</div></div>
              <div class="card-body">
                <div class="card-header">
                  <div class="user-info">
                    <span class="user-name">{{ item.isAnonymous === '1' ? '匿名用户' : (item.userName || '用户') }}</span>
                    <el-rate :model-value="item.score" disabled size="small" text-color="#ff9900" />
                    <span class="comment-time">{{ item.createTime }}</span>
                  </div>
                  <div class="card-tags">
                    <el-tag v-if="item.appealStatus === '1'" type="danger" size="small" effect="dark">申诉待处理</el-tag>
                  </div>
                </div>
                <p class="card-content" :class="{ collapsed: !item.expanded }">{{ item.content }}</p>
                <a v-if="item.content && item.content.length > 120" class="expand-btn" @click="item.expanded = !item.expanded">{{ item.expanded ? '收起' : '展开全文' }}</a>
                <div class="appeal-reason-box">
                  <div class="appeal-reason-header">
                    <span class="appeal-icon">⚠️ 商家申诉</span>
                    <span class="appeal-time">{{ item.appealTime }}</span>
                  </div>
                  <p class="appeal-reason-text">{{ item.appealReason }}</p>
                </div>
                <div v-if="item.replyContent" class="reply-box">
                  <div class="reply-header"><span class="reply-icon">💬 商家回复</span><span class="reply-time">{{ item.replyTime }}</span></div>
                  <p class="reply-content">{{ item.replyContent }}</p>
                </div>
              </div>
              <div class="card-actions">
                <el-tooltip content="详情"><el-button link type="primary" icon="View" @click="handleView(item)" /></el-tooltip>
                <el-tooltip content="同意商家申诉，下架评价"><el-button link type="danger" icon="CircleClose" @click="handleAppealApprove(item)" >下架</el-button></el-tooltip>
                <el-tooltip content="驳回商家申诉，保留评价"><el-button link type="success" icon="CircleCheck" @click="handleAppealReject(item)" >保留</el-button></el-tooltip>
              </div>
            </div>
            <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="loadComments" />
          </template>
          <div v-if="!currentHotelId" class="empty-prompt"><span class="prompt-icon">👈</span><p>请从左侧选择一个酒店查看申诉</p></div>
          <el-empty v-if="currentHotelId && commentList.length === 0 && !commentLoading" description="该酒店暂无申诉" :image-size="120" />
        </div>
      </div>
    </div>

    <el-dialog title="评价详情" v-model="viewOpen" width="680px" append-to-body>
      <div class="detail-wrap">
        <div class="detail-section"><h4>基本信息</h4><p>用户：{{ viewForm.userName || '用户' }} {{ viewForm.isAnonymous === '1' ? '(匿名)' : '' }}</p><p>酒店：{{ viewForm.hotelName || viewForm.hotelId }}</p><p>评分：<el-rate :model-value="viewForm.score" disabled show-score text-color="#ff9900" size="small" /></p></div>
        <div class="detail-section"><h4>评价内容</h4><p class="detail-content">{{ viewForm.content }}</p></div>
        <div class="detail-section appeal-section"><h4>⚠️ 申诉信息</h4><p>理由：{{ viewForm.appealReason }}</p><p class="detail-time">时间：{{ viewForm.appealTime }}</p></div>
        <div class="detail-section" v-if="viewForm.replyContent"><h4>商家回复</h4><p>{{ viewForm.replyContent }}</p></div>
      </div>
    </el-dialog>

    <el-dialog :title="auditTitle" v-model="auditOpen" width="500px" append-to-body>
      <div class="audit-info">
        <p><strong>申诉理由：</strong>{{ currentAppeal.appealReason }}</p>
        <p style="margin-top:10px;color:#666;font-size:13px">操作：<strong :style="{color: auditAction==='approve'?'#ef4444':'#22c55e'}">{{ auditAction==='approve' ? '下架该评价' : '保留该评价' }}</strong></p>
      </div>
      <el-form label-width="80px" style="margin-top:20px"><el-form-item label="审核备注"><el-input v-model="auditRemark" type="textarea" :rows="3" placeholder="可选" maxlength="200" show-word-limit /></el-form-item></el-form>
      <template #footer>
        <el-button @click="auditOpen = false">取 消</el-button>
        <el-button :type="auditAction==='approve'?'danger':'success'" :loading="auditLoading" @click="confirmAudit">{{ auditAction==='approve' ? '确认下架' : '确认保留' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Appeal">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import { getComment, listCommentGroupByHotel, listCommentByHotel, auditAppeal } from '@/api/biz/comment'

const hotelSearch = ref('')
const hotelLoading = ref(false)
const allHotels = ref([])
const currentHotelId = ref(null)
const currentHotelName = ref('')
const filteredHotels = computed(() => {
  if (!hotelSearch.value) return allHotels.value
  const kw = hotelSearch.value.toLowerCase()
  return allHotels.value.filter(h => h.hotelName && h.hotelName.toLowerCase().includes(kw))
})
function filterHotels() {}

const commentLoading = ref(false)
const commentList = ref([])
const total = ref(0)
const queryParams = ref({ pageNum: 1, pageSize: 10 })

const viewOpen = ref(false)
const viewForm = ref({})
const auditOpen = ref(false)
const auditAction = ref('') // 'approve' 或 'reject'
const auditTitle = ref('')
const currentAppeal = ref({})
const auditRemark = ref('')
const auditLoading = ref(false)

function selectHotel(hotel) { currentHotelId.value = hotel.hotelId; currentHotelName.value = hotel.hotelName; queryParams.value.pageNum = 1; loadComments() }

async function loadComments(paginationParams) {
  if (!currentHotelId.value) return
  if (paginationParams) { queryParams.value.pageNum = paginationParams.page; queryParams.value.pageSize = paginationParams.limit }
  commentLoading.value = true
  try {
    const params = { pageNum: queryParams.value.pageNum, pageSize: queryParams.value.pageSize, appealStatus: '1' }
    const res = await listCommentByHotel(currentHotelId.value, params)
    const rows = res.data?.rows || res.data?.list || res.rows || []
    commentList.value = rows.map(item => ({ ...item, expanded: false }))
    total.value = res.data?.total || res.total || 0
  } finally { commentLoading.value = false }
}

async function handleView(row) {
  try { const res = await getComment(row.id); viewForm.value = res.data || res } catch { viewForm.value = row }
  viewOpen.value = true
}

function handleAppealApprove(row) {
  currentAppeal.value = row
  auditAction.value = 'approve'
  auditTitle.value = '申诉审核 - 下架评价'
  auditRemark.value = ''
  auditOpen.value = true
}

function handleAppealReject(row) {
  currentAppeal.value = row
  auditAction.value = 'reject'
  auditTitle.value = '申诉审核 - 保留评价'
  auditRemark.value = ''
  auditOpen.value = true
}

async function confirmAudit() {
  const action = auditAction.value
  const st = action === 'approve' ? '2' : '3'
  auditLoading.value = true
  try {
    await auditAppeal(currentAppeal.value.id, st, auditRemark.value || undefined)
    ElMessage.success(action === 'approve' ? '评价已下架' : '评价已保留')
    auditOpen.value = false
    loadComments()
    loadHotelList()
  } catch { /* cancel */ }
  finally { auditLoading.value = false }
}

async function loadHotelList() {
  hotelLoading.value = true
  try {
    // 直接查询有申诉的评价，以此获取酒店列表
    const allHotelsMap = new Map()
    const res = await listCommentGroupByHotel({})
    const hotels = res.data || res.rows || []
    for (const h of hotels) {
      const cres = await listCommentByHotel(h.hotelId, { pageNum: 1, pageSize: 1, appealStatus: '1' })
      const count = cres.data?.total || cres.total || 0
      if (count > 0) {
        allHotelsMap.set(h.hotelId, { ...h, appealCount: count })
      }
    }
    allHotels.value = Array.from(allHotelsMap.values())
    if (allHotels.value.length > 0 && !currentHotelId.value) selectHotel(allHotels.value[0])
  } catch {
    allHotels.value = []
  } finally { hotelLoading.value = false }
}

function getInitial(n) { return (n || '用').charAt(0) }
function parseImages(images) { if (!images) return []; if (Array.isArray(images)) return images; try { const arr = JSON.parse(images); return Array.isArray(arr) ? arr : [] } catch { return images ? [images] : [] } }

loadHotelList()
</script>

<style scoped>
.appeal-manage { display: flex; flex-direction: column; height: calc(100vh - 100px); padding: 0; }
.appeal-layout { display: flex; gap: 0; flex: 1; min-height: 0; border: 1px solid #ebeef5; border-radius: 8px; overflow: hidden; background: #fff; }
.left-panel { width: 270px; min-width: 270px; border-right: 1px solid #ebeef5; display: flex; flex-direction: column; background: #fafbfc; }
.panel-header { padding: 14px; border-bottom: 1px solid #ebeef5; }
.hotel-list { flex: 1; overflow-y: auto; }
.hotel-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; cursor: pointer; border-bottom: 1px solid #f0f0f0; transition: all 0.2s; }
.hotel-item:hover { background: #fef2f2; }
.hotel-item.active { background: #fef2f2; border-left: 3px solid #ef4444; }
.hotel-item-main { flex: 1; min-width: 0; }
.hotel-name { font-size: 14px; font-weight: 600; color: #333; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 6px; }
.appeal-badge { font-size: 12px; color: #ef4444; font-weight: 600; background: #fef2f2; padding: 2px 8px; border-radius: 8px; }
.hotel-item-extra { flex-shrink: 0; }
.right-panel { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.comment-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #ebeef5; background: #fafbfc; }
.toolbar-left { display: flex; align-items: center; gap: 10px; }
.current-hotel-name { font-size: 16px; font-weight: 700; color: #333; }
.comment-list { flex: 1; overflow-y: auto; padding: 16px 20px; }
.comment-card { display: flex; padding: 18px; background: #fff; border: 1px solid #fecaca; border-radius: 10px; margin-bottom: 14px; transition: all 0.2s; }
.comment-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.card-left { flex-shrink: 0; margin-right: 14px; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 600; }
.card-body { flex: 1; min-width: 0; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px; }
.user-info { display: flex; align-items: center; gap: 10px; }
.user-name { font-size: 14px; font-weight: 600; color: #333; }
.comment-time { font-size: 12px; color: #bbb; margin-left: 8px; }
.card-tags { display: flex; gap: 6px; }
.card-content { font-size: 14px; color: #555; line-height: 1.7; margin: 0; }
.card-content.collapsed { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.expand-btn { color: #409eff; font-size: 13px; cursor: pointer; margin-top: 4px; display: inline-block; }
.appeal-reason-box { margin-top: 12px; padding: 12px 16px; background: #fef2f2; border-radius: 8px; border-left: 3px solid #ef4444; }
.appeal-reason-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
.appeal-icon { font-size: 13px; font-weight: 600; color: #dc2626; }
.appeal-time { font-size: 12px; color: #999; }
.appeal-reason-text { font-size: 13px; color: #555; margin: 0; line-height: 1.6; }
.reply-box { margin-top: 10px; padding: 10px 14px; background: #f0fdf4; border-radius: 8px; }
.reply-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
.reply-icon { font-size: 12px; font-weight: 600; color: #16a34a; }
.reply-time { font-size: 11px; color: #999; }
.reply-content { font-size: 13px; color: #555; margin: 0; line-height: 1.6; }
.card-actions { display: flex; flex-direction: column; gap: 4px; align-items: center; flex-shrink: 0; margin-left: 12px; }
.empty-prompt { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #999; }
.prompt-icon { font-size: 48px; margin-bottom: 16px; }
.empty-prompt p { font-size: 14px; }
.detail-wrap { max-height: 500px; overflow-y: auto; }
.detail-section { margin-bottom: 20px; }
.detail-section h4 { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; }
.detail-section p { font-size: 14px; color: #555; line-height: 1.6; }
.detail-content { white-space: pre-wrap; }
.detail-time { font-size: 12px; color: #999; margin-top: 4px; }
.appeal-section { background: #fef2f2; padding: 12px 16px; border-radius: 8px; }
.audit-info p { font-size: 14px; color: #555; line-height: 1.6; }
</style>
