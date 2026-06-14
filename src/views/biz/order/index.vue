<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="酒店ID" prop="hotelId">
        <el-input v-model="queryParams.hotelId" placeholder="请输入酒店ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="待支付" value="0" />
          <el-option label="已支付" value="1" />
          <el-option label="已取消" value="2" />
          <el-option label="已完成" value="3" />
          <el-option label="退款中" value="4" />
          <el-option label="已退款" value="5" />
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

    <!-- 操作栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" @click="handleBatchDelete" v-hasPermi="['order:remove']" :disabled="!ids.length">
          批量删除
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 订单列表表格 -->
    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="70" />
      <el-table-column label="订单号" align="center" prop="orderNo" width="180" :show-overflow-tooltip="true" />
      <el-table-column label="用户" align="center" prop="userName" width="100" />
      <el-table-column label="酒店" align="center" prop="hotelName" :show-overflow-tooltip="true" min-width="150" />
      <el-table-column label="房型" align="center" prop="roomType" width="120" />
      <el-table-column label="入住日期" align="center" prop="startDate" width="110" />
      <el-table-column label="离店日期" align="center" prop="endDate" width="110" />
      <el-table-column label="金额" align="center" prop="totalPrice" width="100">
        <template #default="scope">
          ¥{{ scope.row.totalPrice }}
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.statusName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="支付方式" align="center" prop="payTypeName" width="100" />
      <el-table-column label="交易号" align="center" prop="transactionId" width="180" :show-overflow-tooltip="true" />
      <el-table-column label="支付时间" align="center" prop="payTime" width="160" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
      <el-table-column label="操作" align="center" fixed="right" width="260">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)">详情</el-button>
          <el-button link type="warning" icon="Close" @click="handleCancel(scope.row)"
            v-if="scope.row.status === '0'" v-hasPermi="['order:cancel']">取消</el-button>
          <el-button link type="success" icon="Check" @click="handleComplete(scope.row)"
            v-if="scope.row.status === '1'" v-hasPermi="['order:complete']">完成</el-button>
          <el-button link type="warning" icon="Money" @click="handleRefund(scope.row)"
            v-if="scope.row.status === '1' || scope.row.status === '3'" v-hasPermi="['order:refund']">退款</el-button>
          <el-button link type="success" icon="CircleCheck" @click="handleConfirmRefund(scope.row)"
            v-if="scope.row.status === '4'" v-hasPermi="['order:refund']">审核通过</el-button>
          <el-button link type="danger" icon="CircleClose" @click="handleRejectRefund(scope.row)"
            v-if="scope.row.status === '4'" v-hasPermi="['order:refund']">驳回退款</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['order:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 订单详情对话框 -->
    <el-dialog :title="'订单详情 - ' + currentOrder.orderNo" v-model="detailOpen" width="700px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusType(currentOrder.status)">{{ currentOrder.statusName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentOrder.userName }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentOrder.userId }}</el-descriptions-item>
        <el-descriptions-item label="酒店">{{ currentOrder.hotelName }}</el-descriptions-item>
        <el-descriptions-item label="酒店ID">{{ currentOrder.hotelId }}</el-descriptions-item>
        <el-descriptions-item label="房型">{{ currentOrder.roomType }}</el-descriptions-item>
        <el-descriptions-item label="房型ID">{{ currentOrder.roomId }}</el-descriptions-item>
        <el-descriptions-item label="入住日期">{{ currentOrder.startDate }}</el-descriptions-item>
        <el-descriptions-item label="离店日期">{{ currentOrder.endDate }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ currentOrder.totalPrice }}</el-descriptions-item>
        <el-descriptions-item label="支付金额">¥{{ currentOrder.payAmount || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ currentOrder.payTypeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="交易号">{{ currentOrder.transactionId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ currentOrder.payTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentOrder.updateTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="Order">
import { listOrder, getOrder, cancelOrder, completeOrder, refundOrder, confirmRefund, rejectRefund, delOrder, batchDelOrder } from '@/api/biz/order'
import { getCurrentInstance, ref, reactive, toRefs } from 'vue'

const { proxy } = getCurrentInstance()

const orderList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const total = ref(0)
const dateRange = ref([])
const detailOpen = ref(false)
const currentOrder = ref({})

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: null,
    userId: null,
    hotelId: null,
    status: null,
    beginTime: null,
    endTime: null
  }
})

const { queryParams } = toRefs(data)

/** 查询订单列表 */
function getList() {
  loading.value = true
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.value.beginTime = dateRange.value[0]
    queryParams.value.endTime = dateRange.value[1]
  } else {
    queryParams.value.beginTime = null
    queryParams.value.endTime = null
  }
  listOrder(queryParams.value).then(response => {
    orderList.value = response.rows || response.data?.rows || []
    total.value = response.total || response.data?.total || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryRef')
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
}

/** 查看详情 */
function handleDetail(row) {
  getOrder(row.id).then(response => {
    currentOrder.value = response.data || response
    detailOpen.value = true
  })
}

/** 取消订单 */
function handleCancel(row) {
  proxy.$prompt('请输入取消原因', '取消订单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputPlaceholder: '取消原因（可选）'
  }).then(({ value }) => {
    cancelOrder(row.id, value || '').then(() => {
      proxy.$modal.msgSuccess('取消成功')
      getList()
    })
  }).catch(() => {})
}

/** 完成订单 */
function handleComplete(row) {
  proxy.$confirm('确认将该订单标记为已完成？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    completeOrder(row.id).then(() => {
      proxy.$modal.msgSuccess('操作成功')
      getList()
    })
  }).catch(() => {})
}

/** 申请退款 */
function handleRefund(row) {
  proxy.$prompt('请输入退款原因', '申请退款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputPlaceholder: '退款原因'
  }).then(({ value }) => {
    refundOrder(row.id, value || '').then(() => {
      proxy.$modal.msgSuccess('退款申请已提交')
      getList()
    })
  }).catch(() => {})
}

/** 驳回退款 */
function handleRejectRefund(row) {
  proxy.$prompt('请输入驳回原因', '驳回退款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputPlaceholder: '驳回原因'
  }).then(({ value }) => {
    rejectRefund(row.id, value || '').then(() => {
      proxy.$modal.msgSuccess('退款已驳回')
      getList()
    })
  }).catch(() => {})
}

/** 确认退款 */
function handleConfirmRefund(row) {
  proxy.$confirm('确认退款？此操作将标记订单为已退款并释放库存。', '确认退款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    confirmRefund(row.id).then(() => {
      proxy.$modal.msgSuccess('退款已完成')
      getList()
    })
  }).catch(() => {})
}

/** 删除订单 */
function handleDelete(row) {
  proxy.$confirm('确认删除订单 "' + row.orderNo + '" ？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delOrder(row.id).then(() => {
      proxy.$modal.msgSuccess('删除成功')
      getList()
    })
  }).catch(() => {})
}

/** 批量删除 */
function handleBatchDelete() {
  if (!ids.value.length) {
    proxy.$modal.msgWarning('请选择要删除的订单')
    return
  }
  proxy.$confirm('确认删除所选订单？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    batchDelOrder(ids.value).then(() => {
      proxy.$modal.msgSuccess('批量删除成功')
      getList()
    })
  }).catch(() => {})
}

/** 状态标签类型 */
function getStatusType(status) {
  switch (status) {
    case '0': return 'info'
    case '1': return 'primary'
    case '2': return 'warning'
    case '3': return 'success'
    case '4': return 'danger'
    case '5': return ''
    case '6': return 'danger'
    default: return 'info'
  }
}

getList()
</script>
