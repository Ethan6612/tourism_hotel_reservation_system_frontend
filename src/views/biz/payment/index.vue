<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="订单ID" prop="orderId">
        <el-input v-model="queryParams.orderId" placeholder="请输入订单ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="支付状态" prop="payStatus">
        <el-select v-model="queryParams.payStatus" placeholder="请选择状态" clearable>
          <el-option label="待支付" value="0" />
          <el-option label="已支付" value="1" />
          <el-option label="支付失败" value="2" />
          <el-option label="退款中" value="3" />
          <el-option label="已退款" value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="支付方式" prop="payType">
        <el-select v-model="queryParams.payType" placeholder="请选择方式" clearable>
          <el-option label="微信" value="1" />
          <el-option label="支付宝" value="2" />
          <el-option label="银行卡" value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 支付记录列表 -->
    <el-table v-loading="loading" :data="paymentList">
      <el-table-column label="ID" align="center" prop="id" width="70" />
      <el-table-column label="订单号" align="center" prop="orderNo" width="180" :show-overflow-tooltip="true" />
      <el-table-column label="用户" align="center" prop="userName" width="100" />
      <el-table-column label="酒店" align="center" prop="hotelName" :show-overflow-tooltip="true" min-width="150" />
      <el-table-column label="支付金额" align="center" prop="payAmount" width="120">
        <template #default="scope">
          ¥{{ scope.row.payAmount }}
        </template>
      </el-table-column>
      <el-table-column label="支付方式" align="center" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.payType === '1' ? 'success' : scope.row.payType === '2' ? 'primary' : 'warning'">
            {{ scope.row.payTypeName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="支付状态" align="center" width="100">
        <template #default="scope">
          <el-tag :type="getPayStatusType(scope.row.payStatus)">{{ scope.row.payStatusName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="交易号" align="center" prop="transactionId" width="200" :show-overflow-tooltip="true" />
      <el-table-column label="支付时间" align="center" prop="payTime" width="160" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
      <el-table-column label="操作" align="center" fixed="right" width="100">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)">详情</el-button>
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

    <!-- 支付详情对话框 -->
    <el-dialog :title="'支付详情 - ' + currentPayment.transactionId" v-model="detailOpen" width="600px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="支付ID">{{ currentPayment.id }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ currentPayment.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单ID">{{ currentPayment.orderId }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ currentPayment.userName }}</el-descriptions-item>
        <el-descriptions-item label="酒店">{{ currentPayment.hotelName }}</el-descriptions-item>
        <el-descriptions-item label="支付金额">¥{{ currentPayment.payAmount }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">
          <el-tag>{{ currentPayment.payTypeName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <el-tag :type="getPayStatusType(currentPayment.payStatus)">{{ currentPayment.payStatusName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="交易号">{{ currentPayment.transactionId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ currentPayment.payTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentPayment.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="Payment">
import { listPayment, getPayment } from '@/api/biz/payment'
import { getCurrentInstance, ref, reactive, toRefs } from 'vue'

const { proxy } = getCurrentInstance()

const paymentList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const dateRange = ref([])
const detailOpen = ref(false)
const currentPayment = ref({})

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: null,
    payStatus: null,
    payType: null,
    beginTime: null,
    endTime: null
  }
})

const { queryParams } = toRefs(data)

function getList() {
  loading.value = true
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.value.beginTime = dateRange.value[0]
    queryParams.value.endTime = dateRange.value[1]
  } else {
    queryParams.value.beginTime = null
    queryParams.value.endTime = null
  }
  listPayment(queryParams.value).then(response => {
    paymentList.value = response.rows || response.data?.rows || []
    total.value = response.total || response.data?.total || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryRef')
  handleQuery()
}

function handleDetail(row) {
  getPayment(row.id).then(response => {
    currentPayment.value = response.data || response
    detailOpen.value = true
  })
}

function getPayStatusType(status) {
  switch (status) {
    case '0': return 'info'
    case '1': return 'success'
    case '2': return 'danger'
    case '3': return 'warning'
    case '4': return ''
    default: return 'info'
  }
}

getList()
</script>
