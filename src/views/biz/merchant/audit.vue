<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商户名称" prop="merchantName">
        <el-input
          v-model="queryParams.merchantName"
          placeholder="请输入商户名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="审核类型" prop="auditType">
        <el-select v-model="queryParams.auditType" placeholder="请选择审核类型" clearable>
          <el-option label="入驻申请" value="1" />
          <el-option label="信息变更" value="2" />
          <el-option label="状态变更" value="3" />
        </el-select>
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="HomeFilled"
          @click="goToFront"
        >返回主页</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="auditList">
      <el-table-column label="审核ID" align="center" prop="id" width="80" />
      <el-table-column label="商户ID" align="center" prop="merchantId" width="80" />
      <el-table-column label="商户名称" align="center" prop="merchantName" :show-overflow-tooltip="true" />
      <el-table-column label="审核类型" align="center" prop="auditType" width="100">
        <template #default="scope">
          <el-tag :type="getAuditTypeTag(scope.row.auditType)">
            {{ getAuditTypeLabel(scope.row.auditType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" prop="auditStatus" width="100">
        <template #default="scope">
          <el-tag :type="getAuditStatusType(scope.row.auditStatus)">
            {{ getAuditStatusLabel(scope.row.auditStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提交材料" align="center" prop="submitMaterial" :show-overflow-tooltip="true" />
      <el-table-column label="审核意见" align="center" prop="auditOpinion" :show-overflow-tooltip="true" />
      <el-table-column label="审核人" align="center" prop="auditorName" width="100" />
      <el-table-column label="提交时间" align="center" prop="submitTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.submitTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核时间" align="center" prop="auditTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.auditTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['merchant:audit:query']">详情</el-button>
          <el-button 
            v-if="scope.row.auditStatus === '0'" 
            link 
            type="primary" 
            icon="Check" 
            @click="handleAudit(scope.row, '1')" 
            v-hasPermi="['merchant:audit:edit']"
          >通过</el-button>
          <el-button 
            v-if="scope.row.auditStatus === '0'" 
            link 
            type="danger" 
            icon="Close" 
            @click="handleAudit(scope.row, '2')" 
            v-hasPermi="['merchant:audit:edit']"
          >驳回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 查看详情对话框 -->
    <el-dialog title="审核详情" v-model="viewOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="审核ID">{{ viewForm.id }}</el-descriptions-item>
        <el-descriptions-item label="商户ID">{{ viewForm.merchantId }}</el-descriptions-item>
        <el-descriptions-item label="商户名称">{{ viewForm.merchantName }}</el-descriptions-item>
        <el-descriptions-item label="审核类型">
          <el-tag :type="getAuditTypeTag(viewForm.auditType)">
            {{ getAuditTypeLabel(viewForm.auditType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getAuditStatusType(viewForm.auditStatus)">
            {{ getAuditStatusLabel(viewForm.auditStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核人">{{ viewForm.auditorName || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="提交材料" :span="2">{{ viewForm.submitMaterial }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">{{ viewForm.auditOpinion || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ parseTime(viewForm.submitTime) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ parseTime(viewForm.auditTime) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(viewForm.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 审核操作对话框 -->
    <el-dialog :title="auditTitle" v-model="auditOpen" width="500px" append-to-body>
      <el-form ref="auditRef" :model="auditForm" :rules="auditRules" label-width="80px">
        <el-form-item label="商户名称">
          <el-input v-model="currentAudit.merchantName" disabled />
        </el-form-item>
        <el-form-item label="审核类型">
          <el-tag :type="getAuditTypeTag(currentAudit.auditType)">
            {{ getAuditTypeLabel(currentAudit.auditType) }}
          </el-tag>
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

<script setup name="MerchantAudit">
import { listMerchantAudit, getMerchantAudit, processMerchantAudit } from "@/api/biz/merchant"
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()
const router = useRouter()

const auditList = ref([])
const viewOpen = ref(false)
const auditOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const auditTitle = ref("")

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  merchantName: undefined,
  auditType: undefined,
  auditStatus: undefined
})

const viewForm = ref({})
const currentAudit = ref({})
const auditForm = ref({
  id: undefined,
  merchantId: undefined,
  auditType: undefined,
  auditStatus: undefined,
  auditOpinion: ''
})

const auditRules = {
  auditOpinion: [{ required: true, message: "审核意见不能为空", trigger: "blur" }]
}

function getAuditTypeTag(type) {
  if (type === '1') return 'primary'
  if (type === '2') return 'warning'
  if (type === '3') return 'info'
  return ''
}

function getAuditTypeLabel(type) {
  if (type === '1') return '入驻申请'
  if (type === '2') return '信息变更'
  if (type === '3') return '状态变更'
  return '未知'
}

function getAuditStatusType(status) {
  if (status === '0') return 'warning'
  if (status === '1') return 'success'
  if (status === '2') return 'danger'
  return 'info'
}

function getAuditStatusLabel(status) {
  if (status === '0') return '待审核'
  if (status === '1') return '审核通过'
  if (status === '2') return '审核驳回'
  return '未知'
}

function goToFront() {
  router.push('/index')
}

/** 查询审核记录列表 */
function getList(paginationParams) {
  if (paginationParams) {
    queryParams.value.pageNum = paginationParams.page
    queryParams.value.pageSize = paginationParams.limit
  }
  
  loading.value = true
  listMerchantAudit(queryParams.value).then(response => {
    auditList.value = response.data.list
    total.value = response.data.total
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList(null)
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 查看详情按钮操作 */
function handleView(row) {
  const id = row.id
  getMerchantAudit(id).then(response => {
    viewForm.value = response.data
    viewOpen.value = true
  })
}

/** 审核操作按钮 */
function handleAudit(row, status) {
  currentAudit.value = row
  auditForm.value = {
    id: row.id,
    merchantId: row.merchantId,
    auditType: row.auditType,
    auditStatus: status,
    auditOpinion: ''
  }
  auditTitle.value = status === '1' ? '审核通过' : '审核驳回'
  auditOpen.value = true
}

/** 提交审核 */
function submitAudit() {
  proxy.$refs["auditRef"].validate(valid => {
    if (valid) {
      processMerchantAudit(auditForm.value).then(response => {
        proxy.$modal.msgSuccess(auditForm.value.auditStatus === '1' ? "审核通过成功" : "审核驳回成功")
        auditOpen.value = false
        getList(null)
      })
    }
  })
}

getList(null)
</script>