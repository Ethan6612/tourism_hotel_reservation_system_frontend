<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="酒店" prop="hotelId">
        <el-select v-model="queryParams.hotelId" placeholder="请选择酒店" clearable>
          <el-option v-for="h in myHotels" :key="h.id" :label="h.name" :value="h.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option label="待支付" value="0" />
          <el-option label="已支付" value="1" />
          <el-option label="已入住" value="7" />
          <el-option label="已完成" value="3" />
          <el-option label="已取消" value="2" />
          <el-option label="退款中" value="4" />
          <el-option label="已退款" value="5" />
          <el-option label="退款驳回" value="6" />
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
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 订单列表表格 -->
    <el-table v-loading="loading" :data="orderList">
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
      <el-table-column label="备注" align="center" prop="remark" width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          {{ scope.row.remark || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="支付方式" align="center" prop="payTypeName" width="100" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
      <el-table-column label="操作" align="center" fixed="right" width="350">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)">详情</el-button>
          <el-button link type="info" icon="Edit" @click="handleRemark(scope.row)">备注</el-button>
          <!-- 已支付 → 可办理入住 -->
          <el-button link type="success" icon="HomeFilled" @click="handleCheckin(scope.row)"
            v-if="scope.row.status === '1'">入住</el-button>
          <!-- 已入住 → 可办理退房 -->
          <el-button link type="success" icon="Check" @click="handleCheckout(scope.row)"
            v-if="scope.row.status === '7'">退房</el-button>
          <!-- 待支付 → 可取消 -->
          <el-button link type="warning" icon="Close" @click="handleCancel(scope.row)"
            v-if="scope.row.status === '0'">取消</el-button>
          <!-- 已支付/已入住 → 可退款 -->
          <el-button link type="warning" icon="Money" @click="handleRefund(scope.row)"
            v-if="scope.row.status === '1' || scope.row.status === '7'">退款</el-button>
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
        <el-descriptions-item label="房型">{{ currentOrder.roomType }}</el-descriptions-item>
        <el-descriptions-item label="入住日期">{{ currentOrder.startDate }}</el-descriptions-item>
        <el-descriptions-item label="离店日期">{{ currentOrder.endDate }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ currentOrder.totalPrice }}</el-descriptions-item>
        <el-descriptions-item label="支付金额">¥{{ currentOrder.payAmount || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ currentOrder.payTypeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="交易号">{{ currentOrder.transactionId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentOrder.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ currentOrder.payTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentOrder.updateTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="MerchantOrder">
import { listMerchantOrder, getMerchantOrder, checkinOrder, checkoutOrder, cancelOrder as cancelMerchantOrder, updateRemark } from '@/api/biz/merchantOrder'
import { listHotel } from '@/api/biz/hotel'
import { refundOrder } from '@/api/biz/order'
import { getCurrentInstance, ref, reactive, toRefs, onMounted } from 'vue'

const { proxy } = getCurrentInstance()

const orderList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const dateRange = ref([])
const detailOpen = ref(false)
const currentOrder = ref({})
const myHotels = ref([])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: null,
    hotelId: null,
    status: null,
    beginTime: null,
    endTime: null
  }
})

const { queryParams } = toRefs(data)

/** 加载当前商户的酒店列表 */
async function loadMyHotels() {
  try {
    const res = await listHotel({ pageNum: 1, pageSize: 999 })
    myHotels.value = res.data?.rows || res.rows || []
  } catch {
    myHotels.value = []
  }
}

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
  listMerchantOrder(queryParams.value).then(response => {
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

/** 查看详情 */
function handleDetail(row) {
  getMerchantOrder(row.id).then(response => {
    currentOrder.value = response.data || response
    detailOpen.value = true
  })
}

/** 修改备注 */
function handleRemark(row) {
  proxy.$prompt('请输入备注信息', '修改备注 - ' + row.orderNo, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: row.remark || '',
    inputPlaceholder: '如：客人要求安静房间、加婴儿床等'
  }).then(({ value }) => {
    updateRemark(row.id, value || '').then(() => {
      proxy.$modal.msgSuccess('备注已更新')
      getList()
    })
  }).catch(() => {})
}

/** 办理入住 */
function handleCheckin(row) {
  proxy.$prompt('请输入入住备注（可选）', '办理入住 - ' + row.orderNo, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '如：客人已到店，安排301房间'
  }).then(({ value }) => {
    checkinOrder(row.id, value || '').then(() => {
      proxy.$modal.msgSuccess('已办理入住')
      getList()
    })
  }).catch(() => {})
}

/** 办理退房 */
function handleCheckout(row) {
  proxy.$confirm('确认办理退房？此操作将完成订单并发放积分。', '办理退房 - ' + row.orderNo, {
    confirmButtonText: '确认退房',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    checkoutOrder(row.id, '').then(() => {
      proxy.$modal.msgSuccess('已办理退房，订单完成')
      getList()
    })
  }).catch(() => {})
}

/** 取消订单 */
function handleCancel(row) {
  proxy.$prompt('请输入取消原因', '取消订单 - ' + row.orderNo, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputPlaceholder: '取消原因（可选）'
  }).then(({ value }) => {
    cancelMerchantOrder(row.id, value || '').then(() => {
      proxy.$modal.msgSuccess('取消成功')
      getList()
    })
  }).catch(() => {})
}

/** 申请退款 */
function handleRefund(row) {
  proxy.$prompt('请输入退款原因', '申请退款 - ' + row.orderNo, {
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

/** 状态标签类型 */
function getStatusType(status) {
  switch (status) {
    case '0': return 'info'
    case '1': return 'primary'
    case '2': return ''
    case '3': return 'success'
    case '4': return 'danger'
    case '5': return ''
    case '6': return 'danger'
    case '7': return 'warning'
    default: return 'info'
  }
}

onMounted(() => {
  loadMyHotels().then(() => {
    getList()
  })
})
</script>

<style scoped lang="scss">
.mb8 {
  margin-bottom: 8px;
}
</style>
