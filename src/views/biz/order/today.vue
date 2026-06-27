<template>
  <div class="app-container">
    <h3>📋 今日订单 ({{ today }})</h3>
    <el-table v-loading="loading" :data="orderList" style="margin-top:16px">
      <el-table-column label="订单号" prop="orderNo" width="200" />
      <el-table-column label="用户" prop="userName" width="100" />
      <el-table-column label="酒店" prop="hotelName" min-width="160" />
      <el-table-column label="房型" prop="roomType" width="120" />
      <el-table-column label="金额" width="100">
        <template #default="{ row }">¥{{ row.totalPrice }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="typeMap[row.status]||'info'">{{ row.statusName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="170" />
    </el-table>
    <el-empty v-if="!loading && orderList.length === 0" description="今日暂无订单" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import useUserStore from '@/store/modules/user'
import { listOrder } from '@/api/biz/order'
import { listMerchantOrder } from '@/api/biz/merchantOrder'

const userStore = useUserStore()
const loading = ref(true)
const orderList = ref([])
const today = new Date().toISOString().split('T')[0]
const typeMap = { '0': 'info', '1': 'primary', '2': '', '3': 'success', '4': 'danger', '5': '', '6': 'danger', '7': 'warning' }

onMounted(async () => {
  const roles = userStore.roles || []
  const isAdmin = roles.some(r => r === 'admin' || r === 'ROLE_ADMIN')
  const api = isAdmin ? listOrder : listMerchantOrder
  try {
    const res = await api({ pageNum: 1, pageSize: 200, beginTime: today, endTime: today + ' 23:59:59' })
    orderList.value = res.rows || res.data?.rows || []
  } finally {
    loading.value = false
  }
})
</script>
