<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="商户名称" prop="merchantName">
        <el-input v-model="queryParams.merchantName" placeholder="请输入商户名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="营业执照号" prop="licenseNo">
        <el-input v-model="queryParams.licenseNo" placeholder="请输入营业执照号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="法人" prop="legalPerson">
        <el-input v-model="queryParams.legalPerson" placeholder="请输入法人姓名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="请输入联系电话" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="商户状态" clearable style="width: 140px">
          <el-option label="正常" value="0" />
          <el-option label="冻结" value="1" />
          <el-option label="注销" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态" prop="auditStatus">
        <el-select v-model="queryParams.auditStatus" placeholder="审核状态" clearable style="width: 140px">
          <el-option label="待审核" value="0" />
          <el-option label="通过" value="1" />
          <el-option label="驳回" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="merchantList" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="ID" prop="id" width="70" align="center" />
      <el-table-column label="商户Logo" align="center" width="90">
        <template #default="scope">
          <el-image
            v-if="scope.row.logoUrl"
            :src="scope.row.logoUrl"
            style="width: 50px; height: 50px; border-radius: 4px;"
            fit="contain"
            :preview-src-list="[scope.row.logoUrl]"
            preview-teleported
          />
          <span v-else style="color: #999; font-size: 12px;">暂无</span>
        </template>
      </el-table-column>
      <el-table-column label="商户名称" prop="merchantName" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="营业执照号" prop="licenseNo" min-width="160" :show-overflow-tooltip="true" />
      <el-table-column label="法人" prop="legalPerson" width="100" />
      <el-table-column label="联系电话" prop="phone" width="130" />
      <el-table-column label="状态" prop="status" width="80" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" type="success">正常</el-tag>
          <el-tag v-else-if="scope.row.status === '1'" type="warning">冻结</el-tag>
          <el-tag v-else-if="scope.row.status === '2'" type="danger">注销</el-tag>
          <el-tag v-else>未知</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" prop="auditStatus" width="90" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.auditStatus === '0'" type="info">待审核</el-tag>
          <el-tag v-else-if="scope.row.auditStatus === '1'" type="success">已通过</el-tag>
          <el-tag v-else-if="scope.row.auditStatus === '2'" type="danger">已驳回</el-tag>
          <el-tag v-else>未知</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="酒店数" prop="hotelCount" width="80" align="center" />
      <el-table-column label="电子邮箱" prop="email" min-width="160" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" prop="createTime" width="110" align="center">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)">详情</el-button>
          <el-button
            v-if="scope.row.status === '1'"
            link type="success"
            icon="CircleCheck"
            @click="handleUnfreeze(scope.row)"
          >解冻</el-button>
          <el-button
            v-if="scope.row.status === '0'"
            link type="warning"
            icon="Remove"
            @click="handleFreeze(scope.row)"
          >冻结</el-button>
          <el-button
            v-if="scope.row.status !== '2'"
            link type="danger"
            icon="Delete"
            @click="handleDeregister(scope.row)"
          >注销</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空数据提示 -->
    <el-empty v-if="!loading && merchantList.length === 0" description="暂无商户数据，请检查搜索条件或稍后再试" :image-size="120" />

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 商户详情弹窗 -->
    <el-dialog :title="'商户详情 - ' + (detail.merchantName || '')" v-model="detailOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="商户Logo" :span="2">
          <el-image
            v-if="detail.logoUrl"
            :src="detail.logoUrl"
            style="width: 120px; height: 120px; border-radius: 8px;"
            fit="contain"
            :preview-src-list="[detail.logoUrl]"
            preview-teleported
          />
          <span v-else>暂无</span>
        </el-descriptions-item>
        <el-descriptions-item label="商户ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="商户名称">{{ detail.merchantName }}</el-descriptions-item>
        <el-descriptions-item label="营业执照号">{{ detail.licenseNo }}</el-descriptions-item>
        <el-descriptions-item label="法人代表">{{ detail.legalPerson }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detail.phone }}</el-descriptions-item>
        <el-descriptions-item label="电子邮箱">{{ detail.email }}</el-descriptions-item>
        <el-descriptions-item label="经营地址" :span="2">{{ detail.address }}</el-descriptions-item>
        <el-descriptions-item label="商户状态">
          <el-tag v-if="detail.status === '0'" type="success">正常</el-tag>
          <el-tag v-else-if="detail.status === '1'" type="warning">冻结</el-tag>
          <el-tag v-else-if="detail.status === '2'" type="danger">注销</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag v-if="detail.auditStatus === '0'" type="info">待审核</el-tag>
          <el-tag v-else-if="detail.auditStatus === '1'" type="success">已通过</el-tag>
          <el-tag v-else-if="detail.auditStatus === '2'" type="danger">已驳回</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="关联酒店数">{{ detail.hotelCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detail.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ parseTime(detail.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="SystemMerchant">
import { ref } from 'vue'
import { listMerchant, getMerchant, freezeMerchant, unfreezeMerchant, deregisterMerchant } from '@/api/biz/merchant'

const { proxy } = getCurrentInstance()

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const merchantList = ref([])
const ids = ref([])
const detailOpen = ref(false)
const detail = ref({})

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  merchantName: '',
  licenseNo: '',
  legalPerson: '',
  phone: '',
  status: '',
  auditStatus: ''
})

function getList(paginationParams) {
  if (paginationParams) {
    queryParams.value.pageNum = paginationParams.page
    queryParams.value.pageSize = paginationParams.limit
  }
  loading.value = true
  listMerchant(queryParams.value).then(response => {
    merchantList.value = response.data.rows || response.data.list || []
    total.value = response.data.total || 0
  }).catch((error) => {
    console.error('商户列表查询失败:', error)
    const msg = error?.response?.data?.msg || error?.message || '查询失败'
    proxy.$modal.msgError('获取商户列表失败：' + msg)
  }).finally(() => {
    loading.value = false
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  queryParams.value.pageNum = 1
  getList()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
}

function handleDetail(row) {
  getMerchant(row.id).then(response => {
    detail.value = response.data || {}
    detailOpen.value = true
  }).catch(() => {
    proxy.$modal.msgError('获取商户详情失败')
  })
}

function handleFreeze(row) {
  proxy.$modal.confirm('确认冻结商户「' + row.merchantName + '」？冻结后商户将无法正常使用系统功能。').then(() => {
    return freezeMerchant(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess('冻结成功')
    getList()
  }).catch(() => {})
}

function handleUnfreeze(row) {
  proxy.$modal.confirm('确认解冻商户「' + row.merchantName + '」？解冻后商户将恢复正常使用。').then(() => {
    return unfreezeMerchant(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess('解冻成功')
    getList()
  }).catch(() => {})
}

function handleDeregister(row) {
  proxy.$modal.confirm(
    '确认注销商户「' + row.merchantName + '」？注销后商户及其关联数据将不可用，且操作不可撤销！',
    '警告',
    { confirmButtonText: '确定注销', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    return deregisterMerchant(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess('注销成功')
    getList()
  }).catch(() => {})
}

getList()
</script>

<style scoped lang="scss">
.mb8 { margin-bottom: 8px; }
</style>
