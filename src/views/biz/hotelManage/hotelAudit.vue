<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="酒店名称" prop="hotelName">
        <el-input v-model="queryParams.hotelName" placeholder="请输入酒店名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="审核状态" prop="auditStatus">
        <el-select v-model="queryParams.auditStatus" placeholder="请选择审核状态" clearable>
          <el-option label="待审核" value="0" />
          <el-option label="审核通过" value="1" />
          <el-option label="审核驳回" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Warning" @click="showPendingCount">
          待审核提醒
          <el-badge v-if="pendingCount > 0" :value="pendingCount" class="audit-badge" />
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="auditList">
      <el-table-column label="审核ID" align="center" prop="id" width="80" />
      <el-table-column label="酒店ID" align="center" prop="hotelId" width="80" />
      <el-table-column label="酒店名称" align="center" prop="hotelName" :show-overflow-tooltip="true" min-width="150" />
      <el-table-column label="酒店地址" align="center" prop="hotelAddress" :show-overflow-tooltip="true" min-width="160" />
      <el-table-column label="酒店星级" align="center" prop="hotelStar" width="100">
        <template #default="scope">
          <el-rate :model-value="scope.row.hotelStar || 0" disabled size="small" />
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" prop="auditStatus" width="100">
        <template #default="scope">
          <el-tag :type="getAuditStatusType(scope.row.auditStatus)">
            {{ scope.row.auditStatusName || getAuditStatusLabel(scope.row.auditStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核意见" align="center" prop="auditOpinion" :show-overflow-tooltip="true" min-width="160" />
      <el-table-column label="审核人" align="center" prop="auditorName" width="100" />
      <el-table-column label="提交时间" align="center" prop="submitTime" width="160" />
      <el-table-column label="审核时间" align="center" prop="auditTime" width="160" />
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)">详情</el-button>
          <el-button v-if="scope.row.auditStatus === '0'" link type="success" icon="Check" @click="handleAudit(scope.row, '1')">通过</el-button>
          <el-button v-if="scope.row.auditStatus === '0'" link type="danger" icon="Close" @click="handleAudit(scope.row, '2')">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 详情对话框 -->
    <el-dialog title="审核详情" v-model="viewOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="审核ID">{{ viewForm.id }}</el-descriptions-item>
        <el-descriptions-item label="酒店ID">{{ viewForm.hotelId }}</el-descriptions-item>
        <el-descriptions-item label="酒店名称">{{ viewForm.hotelName }}</el-descriptions-item>
        <el-descriptions-item label="酒店星级">
          <el-rate :model-value="viewForm.hotelStar || 0" disabled size="small" />
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getAuditStatusType(viewForm.auditStatus)">{{ viewForm.auditStatusName || getAuditStatusLabel(viewForm.auditStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核人">{{ viewForm.auditorName || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="酒店地址" :span="2">{{ viewForm.hotelAddress }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">{{ viewForm.auditOpinion || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ viewForm.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ viewForm.auditTime || '暂无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 审核操作对话框 -->
    <el-dialog :title="auditTitle" v-model="auditOpen" width="500px" append-to-body>
      <el-form ref="auditRef" :model="auditForm" :rules="auditRules" label-width="80px">
        <el-form-item label="酒店名称">
          <el-input :model-value="currentAudit.hotelName" disabled />
        </el-form-item>
        <el-form-item label="酒店地址">
          <el-input :model-value="currentAudit.hotelAddress" disabled />
        </el-form-item>
        <el-form-item label="审核意见" prop="auditOpinion">
          <el-input v-model="auditForm.auditOpinion" type="textarea" :rows="3" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAudit">确 定</el-button>
          <el-button @click="auditOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AdminHotelAudit">
import { ref, getCurrentInstance } from 'vue'
import { listHotelAudit, getHotelAudit, approveHotelAudit, rejectHotelAudit, getPendingCount } from '@/api/biz/hotelAudit'

const { proxy } = getCurrentInstance()

const auditList = ref([])
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const pendingCount = ref(0)
const viewOpen = ref(false)
const auditOpen = ref(false)
const auditTitle = ref('')
const viewForm = ref({})
const currentAudit = ref({})

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  hotelName: undefined,
  auditStatus: undefined
})

const auditForm = ref({
  hotelId: undefined,
  auditStatus: undefined,
  auditOpinion: ''
})

const auditRules = {
  auditOpinion: [{ required: true, message: '审核意见不能为空', trigger: 'blur' }]
}

/** 查询审核列表 */
async function getList() {
  loading.value = true
  try {
    const res = await listHotelAudit(queryParams.value)
    const page = res.data || {}
    auditList.value = page.rows || []
    total.value = page.total || 0
  } catch (err) {
    console.error('[hotelAudit] getList 失败:', err)
    proxy.$modal.msgError('查询审核列表失败')
    auditList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

/** 查询待审核数量 */
async function loadPendingCount() {
  try {
    const res = await getPendingCount()
    pendingCount.value = res.data || 0
  } catch (err) {
    console.error('[hotelAudit] loadPendingCount 失败:', err)
    pendingCount.value = 0
  }
}

function getAuditStatusType(status) {
  const map = { '0': 'warning', '1': 'success', '2': 'danger' }
  return map[status] || 'info'
}

function getAuditStatusLabel(status) {
  const map = { '0': '待审核', '1': '审核通过', '2': '审核驳回' }
  return map[status] || '未知'
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

function handleView(row) {
  getHotelAudit(row.id).then(res => {
    viewForm.value = res.data || row
    viewOpen.value = true
  })
}

function handleAudit(row, status) {
  currentAudit.value = row
  auditForm.value = {
    hotelId: row.hotelId,
    auditStatus: status,
    auditOpinion: ''
  }
  auditTitle.value = status === '1' ? '审核通过' : '审核驳回'
  auditOpen.value = true
}

function submitAudit() {
  proxy.$refs['auditRef'].validate(valid => {
    if (valid) {
      const { hotelId, auditStatus, auditOpinion } = auditForm.value
      const action = auditStatus === '1'
        ? approveHotelAudit(hotelId, auditOpinion)
        : rejectHotelAudit(hotelId, auditOpinion)

      action.then(() => {
        proxy.$modal.msgSuccess(auditStatus === '1' ? '审核通过成功' : '审核驳回成功')
        auditOpen.value = false
        getList()
        loadPendingCount()
      })
    }
  })
}

function showPendingCount() {
  if (pendingCount.value === 0) {
    proxy.$modal.alert('暂无待审核的酒店申请', '审核提醒', { type: 'success' })
  } else {
    proxy.$modal.alert(`当前有 <b>${pendingCount.value}</b> 条待审核申请，请及时处理。`, '审核提醒', {
      dangerouslyUseHTMLString: true,
      type: 'warning'
    })
  }
}

getList()
loadPendingCount()
</script>

<style scoped lang="scss">
.audit-badge {
  margin-left: 4px;
}
</style>
