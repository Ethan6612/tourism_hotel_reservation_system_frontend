<template>
  <div class="comment-manage">
    <el-tabs v-model="activeTab" class="comment-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="全部评价" name="all" />
      <el-tab-pane name="appeal">
        <template #label>
          申诉审核
          <el-badge v-if="appealCount > 0" :value="appealCount" class="tab-badge" />
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- ========== 全部评价：左右分栏 ========== -->
    <div v-if="activeTab === 'all'" class="comment-layout">
      <div class="left-panel">
        <div class="panel-header">
          <el-input v-model="hotelSearch" placeholder="搜索酒店" clearable prefix-icon="Search" @input="filterHotels" />
        </div>
        <div class="hotel-list" v-loading="hotelLoading">
          <div
            v-for="hotel in filteredHotels"
            :key="hotel.hotelId"
            :class="['hotel-item', { active: currentHotelId === hotel.hotelId }]"
            @click="selectHotel(hotel)"
          >
            <div class="hotel-item-main">
              <span class="hotel-name">{{ hotel.hotelName }}</span>
              <div class="hotel-meta">
                <el-rate :model-value="Number(hotel.averageScore || 0)" disabled size="small" text-color="#ff9900" />
                <span class="hotel-score-text">{{ formatScore(hotel.averageScore) }}</span>
              </div>
            </div>
            <div class="hotel-item-extra">
              <span class="comment-count">{{ hotel.totalComments }} 条</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
          <el-empty v-if="filteredHotels.length === 0 && !hotelLoading" description="暂无酒店数据" :image-size="80" />
        </div>
      </div>

      <div class="right-panel">
        <div class="comment-toolbar" v-if="currentHotelId">
          <div class="toolbar-left">
            <span class="current-hotel-name">{{ currentHotelName }}</span>
            <el-tag type="info" size="small">共 {{ total }} 条</el-tag>
          </div>
          <div class="toolbar-right">
            <el-input v-model="searchKeyword" placeholder="搜索内容..." clearable prefix-icon="Search" size="default" style="width:200px" @keyup.enter="loadComments" />
            <el-select v-model="scoreFilter" placeholder="评分" clearable size="default" style="width:100px" @change="loadComments">
              <el-option label="5星" :value="5" /><el-option label="4星" :value="4" /><el-option label="3星" :value="3" /><el-option label="2星" :value="2" /><el-option label="1星" :value="1" />
            </el-select>
            <el-select v-model="statusFilter" placeholder="状态" clearable size="default" style="width:100px" @change="loadComments">
              <el-option label="待审核" value="0" /><el-option label="已发布" value="1" /><el-option label="已拒绝" value="2" />
            </el-select>
          </div>
        </div>

        <div class="comment-list" v-loading="commentLoading">
          <template v-if="currentHotelId && commentList.length > 0">
            <div v-for="item in commentList" :key="item.id" class="comment-card">
              <div class="card-left">
                <div class="user-avatar">{{ getInitial(item.userName || '用户') }}</div>
              </div>
              <div class="card-body">
                <div class="card-header">
                  <div class="user-info">
                    <span class="user-name">{{ item.isAnonymous === '1' ? '匿名用户' : (item.userName || '用户') }}</span>
                    <el-rate :model-value="item.score" disabled size="small" text-color="#ff9900" />
                    <span class="comment-time">{{ item.createTime }}</span>
                  </div>
                  <div class="card-tags">
                    <el-tag v-if="item.status === '0'" type="warning" size="small">待审核</el-tag>
                    <el-tag v-else-if="item.status === '2'" type="danger" size="small">已拒绝</el-tag>
                    <el-tag v-if="item.appealStatus === '1'" type="danger" size="small" effect="dark">申诉中</el-tag>
                  </div>
                </div>
                <p class="card-content" :class="{ collapsed: !item.expanded }">{{ item.content }}</p>
                <a v-if="item.content && item.content.length > 120" class="expand-btn" @click="item.expanded = !item.expanded">{{ item.expanded ? '收起' : '展开全文' }}</a>
                <div class="card-images" v-if="parseImages(item.images).length > 0">
                  <el-image v-for="(img, idx) in parseImages(item.images).slice(0, 6)" :key="idx" :src="img" style="width:80px;height:80px;border-radius:6px;margin-right:8px;cursor:pointer" fit="cover" :preview-src-list="parseImages(item.images)" :initial-index="idx" />
                </div>
                <div v-if="item.replyContent" class="reply-box">
                  <div class="reply-header"><span class="reply-icon">💬 商家回复</span><span class="reply-time">{{ item.replyTime }}</span></div>
                  <p class="reply-content">{{ item.replyContent }}</p>
                </div>
                <div v-if="item.appealReason" class="appeal-box">
                  <div class="appeal-header"><span class="appeal-icon">⚠️ 商家申诉</span><span class="appeal-time">{{ item.appealTime }}</span></div>
                  <p class="appeal-reason">理由：{{ item.appealReason }}</p>
                </div>
              </div>
              <div class="card-actions">
                <el-tooltip content="详情"><el-button link type="primary" icon="View" @click="handleView(item)" /></el-tooltip>
                <el-tooltip v-if="!item.replyContent" content="回复"><el-button link type="primary" icon="ChatDotRound" @click="handleReply(item)" /></el-tooltip>
                <el-tooltip v-if="item.status === '0'" content="通过"><el-button link type="success" icon="Select" @click="handleAuditPass(item)" /></el-tooltip>
                <el-tooltip v-if="item.status === '0'" content="拒绝"><el-button link type="danger" icon="CloseBold" @click="handleAuditReject(item)" /></el-tooltip>
                <el-tooltip content="删除"><el-button link type="danger" icon="Delete" @click="handleDelete(item)" /></el-tooltip>
              </div>
            </div>
            <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="loadComments" />
          </template>
          <div v-if="!currentHotelId" class="empty-prompt"><span class="prompt-icon">👈</span><p>请从左侧选择一个酒店查看评价</p></div>
          <el-empty v-if="currentHotelId && commentList.length === 0 && !commentLoading" description="该酒店暂无评价" :image-size="120" />
        </div>
      </div>
    </div>

    <!-- ========== 申诉审核 ========== -->
    <div v-if="activeTab === 'appeal'" class="appeal-panel">
      <el-form :model="appealParams" :inline="true" class="appeal-search">
        <el-form-item label="酒店"><el-input v-model="appealParams.hotelName" placeholder="酒店名称" clearable @keyup.enter="loadAppeals" /></el-form-item>
        <el-form-item><el-button type="primary" icon="Search" @click="loadAppeals">搜索</el-button><el-button icon="Refresh" @click="resetAppealSearch">重置</el-button></el-form-item>
      </el-form>
      <el-table v-loading="appealLoading" :data="appealList" stripe>
        <el-table-column label="ID" prop="id" width="80" align="center" />
        <el-table-column label="酒店" prop="hotelName" min-width="150" show-overflow-tooltip />
        <el-table-column label="用户" width="100" align="center"><template #default="{ row }">{{ row.isAnonymous === '1' ? '匿名' : (row.userName || '用户') }}</template></el-table-column>
        <el-table-column label="评分" width="140" align="center"><template #default="{ row }"><el-rate :model-value="row.score" disabled size="small" text-color="#ff9900" /></template></el-table-column>
        <el-table-column label="评价内容" prop="content" min-width="180" show-overflow-tooltip />
        <el-table-column label="申诉理由" prop="appealReason" min-width="160" show-overflow-tooltip><template #default="{ row }"><span style="color:#ea580c">{{ row.appealReason }}</span></template></el-table-column>
        <el-table-column label="申诉时间" prop="appealTime" width="170" align="center" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" icon="View" @click="handleView(row)">详情</el-button>
            <el-button link type="success" icon="Select" @click="handleAppealApprove(row)">通过</el-button>
            <el-button link type="danger" icon="CloseBold" @click="handleAppealReject(row)">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="appealTotal > 0" :total="appealTotal" v-model:page="appealParams.pageNum" v-model:limit="appealParams.pageSize" @pagination="loadAppeals" />
      <el-empty v-if="appealList.length === 0 && !appealLoading" description="暂无申诉待审核" :image-size="120" />
    </div>

    <!-- 详情对话框 -->
    <el-dialog title="评价详情" v-model="viewOpen" width="680px" append-to-body>
      <div class="detail-wrap">
        <div class="detail-section"><h4>基本信息</h4><p>用户：{{ viewForm.userName || '用户' }} {{ viewForm.isAnonymous === '1' ? '(匿名)' : '' }}</p><p>酒店：{{ viewForm.hotelName || viewForm.hotelId }}</p><p>评分：<el-rate :model-value="viewForm.score" disabled show-score text-color="#ff9900" size="small" /></p></div>
        <div class="detail-section"><h4>评价内容</h4><p class="detail-content">{{ viewForm.content }}</p><div v-if="parseImages(viewForm.images).length > 0" style="margin-top:10px"><el-image v-for="(img, idx) in parseImages(viewForm.images)" :key="idx" :src="img" style="width:120px;height:90px;border-radius:6px;margin-right:8px" fit="cover" :preview-src-list="parseImages(viewForm.images)" /></div></div>
        <div class="detail-section" v-if="viewForm.replyContent"><h4>商家回复</h4><p>{{ viewForm.replyContent }}</p><p class="detail-time">{{ viewForm.replyTime }}</p></div>
        <div class="detail-section appeal-detail" v-if="viewForm.appealReason"><h4>申诉信息</h4><p>理由：{{ viewForm.appealReason }}</p><p class="detail-time">时间：{{ viewForm.appealTime }}</p></div>
      </div>
    </el-dialog>

    <!-- 回复对话框 -->
    <el-dialog title="回复评价" v-model="replyOpen" width="550px" append-to-body>
      <el-form ref="replyRef" :model="replyForm" :rules="replyRules" label-width="80px">
        <el-form-item label="评价人">{{ currentComment.userName || '用户' }}</el-form-item>
        <el-form-item label="评价内容"><el-input :model-value="currentComment.content" type="textarea" :rows="2" disabled /></el-form-item>
        <el-form-item label="回复内容" prop="replyContent"><el-input v-model="replyForm.replyContent" type="textarea" :rows="4" placeholder="请输入回复内容" maxlength="500" show-word-limit /></el-form-item>
      </el-form>
      <template #footer><el-button @click="replyOpen = false">取 消</el-button><el-button type="primary" @click="submitReply">确认回复</el-button></template>
    </el-dialog>

    <!-- 申诉审核对话框 -->
    <el-dialog title="申诉审核处理" v-model="appealAuditOpen" width="550px" append-to-body>
      <div class="appeal-audit-info"><p><strong>评价内容：</strong>{{ currentAppeal.content }}</p><p><strong>申诉理由：</strong>{{ currentAppeal.appealReason }}</p><p><strong>申诉时间：</strong>{{ currentAppeal.appealTime }}</p></div>
      <el-form label-width="80px" style="margin-top:20px"><el-form-item label="审核备注"><el-input v-model="appealAuditRemark" type="textarea" :rows="3" placeholder="可选，填写审核意见" maxlength="200" show-word-limit /></el-form-item></el-form>
      <template #footer><el-button @click="appealAuditOpen = false">取 消</el-button><el-button type="danger" @click="confirmAppealAudit('reject')">驳回申诉（撤销评价）</el-button><el-button type="success" @click="confirmAppealAudit('approve')">通过申诉（保留评价）</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup name="Comment">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import { listComment, getComment, replyComment, delComment, listCommentGroupByHotel, listCommentByHotel, auditComment, auditAppeal } from '@/api/biz/comment'

// 标签
const activeTab = ref('all')
const appealCount = ref(0)
function handleTabChange(tab) { if (tab === 'appeal') loadAppeals(); else if (tab === 'all' && currentHotelId.value) loadComments() }

// 酒店列表
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
function selectHotel(hotel) { currentHotelId.value = hotel.hotelId; currentHotelName.value = hotel.hotelName; queryParams.value.pageNum = 1; loadComments() }

// 评价列表
const commentLoading = ref(false)
const commentList = ref([])
const total = ref(0)
const searchKeyword = ref('')
const scoreFilter = ref(null)
const statusFilter = ref(null)
const queryParams = ref({ pageNum: 1, pageSize: 10 })

async function loadComments(paginationParams) {
  if (!currentHotelId.value) return
  if (paginationParams) { queryParams.value.pageNum = paginationParams.page; queryParams.value.pageSize = paginationParams.limit }
  commentLoading.value = true
  try {
    const params = { pageNum: queryParams.value.pageNum, pageSize: queryParams.value.pageSize, score: scoreFilter.value || undefined, status: statusFilter.value || undefined, keyword: searchKeyword.value || undefined }
    const res = await listCommentByHotel(currentHotelId.value, params)
    const rows = res.data?.rows || res.data?.list || res.rows || []
    commentList.value = rows.map(item => ({ ...item, expanded: false }))
    total.value = res.data?.total || res.total || 0
  } finally { commentLoading.value = false }
}

// 申诉列表
const appealLoading = ref(false)
const appealList = ref([])
const appealTotal = ref(0)
const appealParams = ref({ pageNum: 1, pageSize: 10, hotelName: '' })

async function loadAppeals(paginationParams) {
  if (paginationParams) { appealParams.value.pageNum = paginationParams.page; appealParams.value.pageSize = paginationParams.limit }
  appealLoading.value = true
  try {
    const params = { pageNum: appealParams.value.pageNum, pageSize: appealParams.value.pageSize, appealStatus: '1', hotelName: appealParams.value.hotelName || undefined }
    const res = await listComment(params)
    appealList.value = res.data?.rows || res.data?.list || res.rows || []
    appealTotal.value = res.data?.total || res.total || 0
    appealCount.value = appealTotal.value
  } finally { appealLoading.value = false }
}
function resetAppealSearch() { appealParams.value = { pageNum: 1, pageSize: 10, hotelName: '' }; loadAppeals() }

// 详情
const viewOpen = ref(false)
const viewForm = ref({})
async function handleView(row) {
  try { const res = await getComment(row.id); viewForm.value = res.data || res } catch { viewForm.value = row }
  viewOpen.value = true
}

// 回复
const replyOpen = ref(false)
const replyRef = ref(null)
const currentComment = ref({})
const replyForm = ref({ replyContent: '' })
const replyRules = { replyContent: [{ required: true, message: '回复内容不能为空', trigger: 'blur' }] }
function handleReply(row) { currentComment.value = row; replyForm.value.replyContent = ''; replyOpen.value = true }
async function submitReply() {
  try { await replyRef.value.validate(); await replyComment(currentComment.value.id, replyForm.value.replyContent); ElMessage.success('回复成功'); replyOpen.value = false; loadComments() } catch { /* ignore */ }
}

// 审核
async function handleAuditPass(row) { try { await ElMessageBox.confirm('确认审核通过这条评价？', '审核通过', { type: 'success' }); await auditComment(row.id, '1'); ElMessage.success('审核通过'); loadComments() } catch { /* cancel */ } }
async function handleAuditReject(row) { try { await ElMessageBox.confirm('确认拒绝这条评价？', '审核拒绝', { type: 'warning' }); await auditComment(row.id, '2'); ElMessage.success('已拒绝'); loadComments() } catch { /* cancel */ } }

// 申诉审核
const appealAuditOpen = ref(false)
const currentAppeal = ref({})
const appealAuditRemark = ref('')
function handleAppealApprove(row) { currentAppeal.value = row; currentAppeal.value._action = 'approve'; appealAuditRemark.value = ''; appealAuditOpen.value = true }
function handleAppealReject(row) { currentAppeal.value = row; currentAppeal.value._action = 'reject'; appealAuditRemark.value = ''; appealAuditOpen.value = true }
async function confirmAppealAudit(action) {
  const st = action === 'approve' ? '2' : '3'
  const txt = action === 'approve' ? '通过申诉（保留评价）' : '驳回申诉（撤销评价）'
  try { await ElMessageBox.confirm('确认' + txt + '？', '申诉审核确认', { type: action === 'reject' ? 'warning' : 'success' }); await auditAppeal(currentAppeal.value.id, st, appealAuditRemark.value || undefined); ElMessage.success('处理完成'); appealAuditOpen.value = false; loadAppeals(); loadHotelList() } catch { /* cancel */ }
}

// 删除
async function handleDelete(row) { try { await ElMessageBox.confirm('确认删除评价编号"' + row.id + '"？', '删除确认', { type: 'warning' }); await delComment(row.id); ElMessage.success('删除成功'); activeTab.value === 'all' ? (loadComments(), loadHotelList()) : loadAppeals() } catch { /* cancel */ } }

// 加载酒店列表
async function loadHotelList() {
  hotelLoading.value = true
  try {
    const res = await listCommentGroupByHotel({})
    allHotels.value = res.data || res.rows || []
    if (allHotels.value.length > 0 && !currentHotelId.value) selectHotel(allHotels.value[0])
  } catch {
    allHotels.value = [
      { hotelId: 1, hotelName: '北京王府井希尔顿酒店', averageScore: 4.8, totalComments: 12 },
      { hotelId: 2, hotelName: '上海外滩华尔道夫酒店', averageScore: 4.5, totalComments: 8 },
      { hotelId: 3, hotelName: '广州塔丽思卡尔顿酒店', averageScore: 4.7, totalComments: 10 },
      { hotelId: 4, hotelName: '深圳福田香格里拉大酒店', averageScore: 4.3, totalComments: 6 },
      { hotelId: 5, hotelName: '杭州西湖国宾馆', averageScore: 4.6, totalComments: 9 },
      { hotelId: 6, hotelName: '成都太古里尼依格罗酒店', averageScore: 4.7, totalComments: 7 }
    ]
    if (!currentHotelId.value && allHotels.value.length > 0) selectHotel(allHotels.value[0])
  } finally { hotelLoading.value = false }
}

// 工具方法
function getInitial(n) { return (n || '用').charAt(0) }
function formatScore(s) { const n = Number(s); return isNaN(n) ? '-' : n.toFixed(1) }
function parseImages(images) { if (!images) return []; if (Array.isArray(images)) return images; try { const arr = JSON.parse(images); return Array.isArray(arr) ? arr : [] } catch { return images ? [images] : [] } }

loadHotelList()
loadAppeals()
</script>

<style scoped>
.comment-manage { display: flex; flex-direction: column; height: calc(100vh - 100px); padding: 0; }
.comment-tabs { margin-bottom: 12px; padding: 0 4px; }
.comment-tabs :deep(.el-tabs__header) { margin: 0; }
.tab-badge { margin-left: 6px; }
.tab-badge :deep(.el-badge__content) { font-size: 10px; }

.comment-layout { display: flex; gap: 0; flex: 1; min-height: 0; border: 1px solid #ebeef5; border-radius: 8px; overflow: hidden; background: #fff; }

.left-panel { width: 270px; min-width: 270px; border-right: 1px solid #ebeef5; display: flex; flex-direction: column; background: #fafbfc; }
.panel-header { padding: 14px; border-bottom: 1px solid #ebeef5; }
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
.comment-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #ebeef5; background: #fafbfc; flex-wrap: wrap; gap: 10px; }
.toolbar-left { display: flex; align-items: center; gap: 10px; }
.current-hotel-name { font-size: 16px; font-weight: 700; color: #333; }
.toolbar-right { display: flex; align-items: center; gap: 8px; }
.comment-list { flex: 1; overflow-y: auto; padding: 16px 20px; }

.comment-card { display: flex; padding: 18px; background: #fff; border: 1px solid #f0f0f0; border-radius: 10px; margin-bottom: 14px; transition: all 0.2s; }
.comment-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); border-color: #e0e0e0; }
.card-left { flex-shrink: 0; margin-right: 14px; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 600; }
.card-body { flex: 1; min-width: 0; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px; }
.user-info { display: flex; align-items: center; gap: 10px; }
.user-name { font-size: 14px; font-weight: 600; color: #333; }
.comment-time { font-size: 12px; color: #bbb; margin-left: 8px; }
.card-tags { display: flex; gap: 6px; }
.card-content { font-size: 14px; color: #555; line-height: 1.7; margin: 0; }
.card-content.collapsed { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.expand-btn { color: #409eff; font-size: 13px; cursor: pointer; margin-top: 4px; display: inline-block; }
.card-images { margin-top: 10px; }
.card-actions { display: flex; flex-direction: column; gap: 4px; align-items: center; flex-shrink: 0; margin-left: 12px; }

.reply-box { margin-top: 12px; padding: 12px 16px; background: #f0fdf4; border-radius: 8px; border-left: 3px solid #22c55e; }
.reply-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
.reply-icon { font-size: 13px; font-weight: 600; color: #16a34a; }
.reply-time { font-size: 12px; color: #999; }
.reply-content { font-size: 13px; color: #555; margin: 0; line-height: 1.6; }

.appeal-box { margin-top: 12px; padding: 12px 16px; background: #fff7ed; border-radius: 8px; border-left: 3px solid #f97316; }
.appeal-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
.appeal-icon { font-size: 13px; font-weight: 600; color: #ea580c; }
.appeal-time { font-size: 12px; color: #999; }
.appeal-reason { font-size: 13px; color: #555; margin: 0; line-height: 1.6; }

.empty-prompt { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #999; }
.prompt-icon { font-size: 48px; margin-bottom: 16px; }
.empty-prompt p { font-size: 14px; }

.appeal-panel { background: #fff; border-radius: 8px; padding: 20px; border: 1px solid #ebeef5; }
.appeal-search { margin-bottom: 16px; }

.detail-wrap { max-height: 500px; overflow-y: auto; }
.detail-section { margin-bottom: 20px; }
.detail-section h4 { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; }
.detail-section p { font-size: 14px; color: #555; line-height: 1.6; }
.detail-content { white-space: pre-wrap; }
.detail-time { font-size: 12px; color: #999; margin-top: 4px; }
.appeal-detail { background: #fff7ed; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #f97316; }
.appeal-audit-info p { margin-bottom: 8px; font-size: 14px; color: #555; line-height: 1.6; }
</style>
