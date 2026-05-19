<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择订单状态" clearable>
          <el-option label="待支付" value="0" />
          <el-option label="已支付" value="1" />
          <el-option label="已取消" value="2" />
          <el-option label="已完成" value="3" />
          <el-option label="退款中" value="4" />
          <el-option label="已退款" value="5" />
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

    <el-table v-loading="loading" :data="orderList">
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="订单号" align="center" prop="orderNo" :show-overflow-tooltip="true" width="200" />
      <el-table-column label="用户ID" align="center" prop="userId" width="100" />
      <el-table-column label="酒店ID" align="center" prop="hotelId" width="100" />
      <el-table-column label="房型ID" align="center" prop="roomId" width="100" />
      <el-table-column label="入住日期" align="center" prop="startDate" width="120" />
      <el-table-column label="离店日期" align="center" prop="endDate" width="120" />
      <el-table-column label="总价" align="center" prop="totalPrice" width="120">
        <template #default="scope">
          <span>¥{{ scope.row.totalPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" type="warning">待支付</el-tag>
          <el-tag v-else-if="scope.row.status === '1'" type="success">已支付</el-tag>
          <el-tag v-else-if="scope.row.status === '2'" type="info">已取消</el-tag>
          <el-tag v-else-if="scope.row.status === '3'" type="primary">已完成</el-tag>
          <el-tag v-else-if="scope.row.status === '4'" type="warning">退款中</el-tag>
          <el-tag v-else-if="scope.row.status === '5'" type="danger">已退款</el-tag>
        </template>
      </el-table-column>
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
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['order:query']">详情</el-button>
          <el-button 
            v-if="scope.row.status === '0'" 
            link 
            type="primary" 
            icon="Check" 
            @click="handleUpdateStatus(scope.row, '1')" 
            v-hasPermi="['order:edit']"
          >确认支付</el-button>
          <el-button 
            v-if="scope.row.status === '0'" 
            link 
            type="danger" 
            icon="Close" 
            @click="handleUpdateStatus(scope.row, '2')" 
            v-hasPermi="['order:edit']"
          >取消订单</el-button>
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
    <el-dialog title="订单详情" v-model="viewOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单ID">{{ viewForm.id }}</el-descriptions-item>
        <el-descriptions-item label="订单号" :span="2">{{ viewForm.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ viewForm.userId }}</el-descriptions-item>
        <el-descriptions-item label="酒店ID">{{ viewForm.hotelId }}</el-descriptions-item>
        <el-descriptions-item label="房型ID">{{ viewForm.roomId }}</el-descriptions-item>
        <el-descriptions-item label="入住日期">{{ viewForm.startDate }}</el-descriptions-item>
        <el-descriptions-item label="离店日期">{{ viewForm.endDate }}</el-descriptions-item>
        <el-descriptions-item label="总价">¥{{ viewForm.totalPrice }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="viewForm.status === '0'" type="warning">待支付</el-tag>
          <el-tag v-else-if="viewForm.status === '1'" type="success">已支付</el-tag>
          <el-tag v-else-if="viewForm.status === '2'" type="info">已取消</el-tag>
          <el-tag v-else-if="viewForm.status === '3'" type="primary">已完成</el-tag>
          <el-tag v-else-if="viewForm.status === '4'" type="warning">退款中</el-tag>
          <el-tag v-else-if="viewForm.status === '5'" type="danger">已退款</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ parseTime(viewForm.payTime) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(viewForm.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(viewForm.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="Order">
import { listOrder, getOrder, updateOrderStatus } from "@/api/biz/order"

const { proxy } = getCurrentInstance()

const orderList = ref([])
const viewOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  status: undefined
})

const viewForm = ref({})

/** 查询订单列表 */
function getList(paginationParams) {
  if (paginationParams) {
    queryParams.value.pageNum = paginationParams.page
    queryParams.value.pageSize = paginationParams.limit
  }
  loading.value = true
  listOrder(queryParams.value).then(response => {
    orderList.value = response.data.list
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
  getOrder(id).then(response => {
    viewForm.value = response.data
    viewOpen.value = true
  })
}

/** 更新订单状态 */
function handleUpdateStatus(row, status) {
  const statusText = status === '1' ? '确认支付' : '取消订单'
  proxy.$modal.confirm('是否确认' + statusText + '订单编号为"' + row.id + '"的数据项？').then(function() {
    return updateOrderStatus(row.id, status)
  }).then(() => {
    getList(null)
    proxy.$modal.msgSuccess(statusText + "成功")
  }).catch(() => {})
}

getList(null)
</script>
