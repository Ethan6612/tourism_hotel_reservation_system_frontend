<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单ID" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="支付状态" prop="payStatus">
        <el-select v-model="queryParams.payStatus" placeholder="请选择支付状态" clearable>
          <el-option label="待支付" value="0" />
          <el-option label="已支付" value="1" />
          <el-option label="支付失败" value="2" />
          <el-option label="退款中" value="3" />
          <el-option label="已退款" value="4" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="paymentList">
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="订单ID" align="center" prop="orderId" width="100" />
      <el-table-column label="支付金额" align="center" prop="payAmount" width="120">
        <template #default="scope">
          <span>¥{{ scope.row.payAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付类型" align="center" prop="payType" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.payType === '1'" type="success">微信</el-tag>
          <el-tag v-else-if="scope.row.payType === '2'" type="warning">支付宝</el-tag>
          <el-tag v-else-if="scope.row.payType === '3'" type="primary">银行卡</el-tag>
          <span v-else>{{ scope.row.payType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付状态" align="center" prop="payStatus" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.payStatus === '0'" type="warning">待支付</el-tag>
          <el-tag v-else-if="scope.row.payStatus === '1'" type="success">已支付</el-tag>
          <el-tag v-else-if="scope.row.payStatus === '2'" type="danger">支付失败</el-tag>
          <el-tag v-else-if="scope.row.payStatus === '3'" type="warning">退款中</el-tag>
          <el-tag v-else-if="scope.row.payStatus === '4'" type="info">已退款</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="交易号" align="center" prop="transactionId" :show-overflow-tooltip="true" width="200" />
      <el-table-column label="支付时间" align="center" prop="payTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.payTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['payment:query']">详情</el-button>
          <el-button 
            v-if="scope.row.payStatus === '0'" 
            link 
            type="primary" 
            icon="Check" 
            @click="handleUpdateStatus(scope.row, '1')" 
            v-hasPermi="['payment:edit']"
          >确认支付</el-button>
          <el-button 
            v-if="scope.row.payStatus === '0'" 
            link 
            type="danger" 
            icon="Close" 
            @click="handleUpdateStatus(scope.row, '2')" 
            v-hasPermi="['payment:edit']"
          >支付失败</el-button>
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
    <el-dialog title="支付详情" v-model="viewOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="支付ID">{{ viewForm.id }}</el-descriptions-item>
        <el-descriptions-item label="订单ID">{{ viewForm.orderId }}</el-descriptions-item>
        <el-descriptions-item label="支付金额">¥{{ viewForm.payAmount }}</el-descriptions-item>
        <el-descriptions-item label="支付类型">
          <el-tag v-if="viewForm.payType === '1'" type="success">微信</el-tag>
          <el-tag v-else-if="viewForm.payType === '2'" type="warning">支付宝</el-tag>
          <el-tag v-else-if="viewForm.payType === '3'" type="primary">银行卡</el-tag>
          <span v-else>{{ viewForm.payType }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag v-if="viewForm.payStatus === '0'" type="warning">待支付</el-tag>
          <el-tag v-else-if="viewForm.payStatus === '1'" type="success">已支付</el-tag>
          <el-tag v-else-if="viewForm.payStatus === '2'" type="danger">支付失败</el-tag>
          <el-tag v-else-if="viewForm.payStatus === '3'" type="warning">退款中</el-tag>
          <el-tag v-else-if="viewForm.payStatus === '4'" type="info">已退款</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="交易号" :span="2">{{ viewForm.transactionId || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ parseTime(viewForm.payTime) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(viewForm.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(viewForm.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="Payment">
import { listPayment, getPayment, updatePaymentStatus } from "@/api/biz/payment"

const { proxy } = getCurrentInstance()

const paymentList = ref([])
const viewOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  orderId: undefined,
  payStatus: undefined
})

const viewForm = ref({})

/** 查询支付列表 */
function getList(paginationParams) {
  if (paginationParams) {
    queryParams.value.pageNum = paginationParams.page
    queryParams.value.pageSize = paginationParams.limit
  }
  loading.value = true
  listPayment(queryParams.value).then(response => {
    paymentList.value = response.data.list
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
  getPayment(id).then(response => {
    viewForm.value = response.data
    viewOpen.value = true
  })
}

/** 更新支付状态 */
function handleUpdateStatus(row, status) {
  const statusText = status === '1' ? '确认支付' : '标记为支付失败'
  proxy.$modal.confirm('是否确认' + statusText + '支付记录编号为"' + row.id + '"的数据项？').then(function() {
    return updatePaymentStatus(row.id, status, null)
  }).then(() => {
    getList(null)
    proxy.$modal.msgSuccess(statusText + "成功")
  }).catch(() => {})
}

getList(null)
</script>
