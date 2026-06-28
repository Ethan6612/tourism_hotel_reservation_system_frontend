<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="所属酒店" prop="hotelId">
        <el-select v-model="queryParams.hotelId" placeholder="请选择酒店" clearable filterable style="width: 200px">
          <el-option v-for="h in hotelOptions" :key="h.id" :label="h.name" :value="h.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="预警阈值" prop="threshold">
        <el-input-number v-model="queryParams.threshold" :min="1" :max="999" :step="1" style="width: 140px" />
        <span style="margin-left: 6px; color: #909399; font-size: 12px">库存 ≤ 该值时预警</span>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Warning" @click="handleQuery">刷新预警</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 概览提示 -->
    <el-alert
      v-if="queried"
      :title="lowStockList.length === 0 ? '暂无低库存房型，库存充足！' : `共有 ${lowStockList.length} 个房型库存不足`"
      :type="lowStockList.length === 0 ? 'success' : 'warning'"
      show-icon
      :closable="false"
      class="mb8"
    />

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="lowStockList" stripe>
      <el-table-column label="所属酒店" prop="hotelName" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="房型" prop="roomType" min-width="140" :show-overflow-tooltip="true" />
      <el-table-column label="面积" prop="area" width="80" align="center" />
      <el-table-column label="床型" prop="bedType" width="100" align="center" />
      <el-table-column label="价格" prop="price" width="100" align="center">
        <template #default="scope">
          <span style="color: #e6a23c; font-weight: 600">¥{{ scope.row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当前库存" prop="stock" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.stock === 0 ? 'danger' : 'warning'" effect="dark">
            {{ scope.row.stock }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleStock(scope.row)">调整库存</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空数据提示 -->
    <el-empty v-if="!loading && lowStockList.length === 0 && queried" description="暂无低库存房型" :image-size="100" />

    <!-- 库存调整对话框 -->
    <el-dialog title="调整库存" v-model="stockOpen" width="420px" append-to-body>
      <el-form :model="stockForm" label-width="100px">
        <el-form-item label="房型">
          <span>{{ stockForm.roomType }}</span>
        </el-form-item>
        <el-form-item label="所属酒店">
          <span>{{ stockForm.hotelName }}</span>
        </el-form-item>
        <el-form-item label="当前库存">
          <el-tag :type="stockForm.currentStock === 0 ? 'danger' : 'warning'" effect="dark">
            {{ stockForm.currentStock }}
          </el-tag>
        </el-form-item>
        <el-form-item label="调整为" prop="newStock">
          <el-input-number v-model="stockForm.newStock" :min="0" :max="9999" :step="1" style="width: 180px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockOpen = false">取 消</el-button>
        <el-button type="primary" @click="submitStock">确认调整</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="StockAlert">
import { ref, getCurrentInstance } from 'vue'
import { getLowStockRooms, updateRoomStock } from '@/api/biz/adminRoom'
import { listHotel } from '@/api/biz/adminHotel'

const { proxy } = getCurrentInstance()

const loading = ref(false)
const showSearch = ref(true)
const queried = ref(false)
const lowStockList = ref([])
const hotelOptions = ref([])

const queryParams = ref({
  hotelId: undefined,
  threshold: 5
})

const stockOpen = ref(false)
const stockForm = ref({
  id: undefined,
  roomType: '',
  hotelName: '',
  currentStock: 0,
  newStock: 0
})

function loadHotelOptions() {
  listHotel({ pageNum: 1, pageSize: 999 }).then(res => {
    const page = res.data || res
    const list = page.rows || page.list || []
    hotelOptions.value = list.map(h => ({ id: h.id, name: h.name }))
  }).catch(() => {})
}

function getList() {
  loading.value = true
  queried.value = true
  const params = {}
  if (queryParams.value.hotelId) {
    params.hotelId = queryParams.value.hotelId
  }
  getLowStockRooms(queryParams.value.threshold, queryParams.value.hotelId).then(response => {
    lowStockList.value = response.data || response || []
  }).catch(() => {
    proxy.$modal.msgError('获取库存预警数据失败')
  }).finally(() => {
    loading.value = false
  })
}

function handleQuery() {
  getList()
}

function resetQuery() {
  queryParams.value.hotelId = undefined
  queryParams.value.threshold = 5
  getList()
}

function handleStock(row) {
  stockForm.value = {
    id: row.id,
    roomType: row.roomType,
    hotelName: row.hotelName || '',
    currentStock: row.stock,
    newStock: row.stock
  }
  stockOpen.value = true
}

function submitStock() {
  updateRoomStock(stockForm.value.id, stockForm.value.newStock).then(() => {
    proxy.$modal.msgSuccess('库存调整成功')
    stockOpen.value = false
    getList()
  }).catch(() => {
    proxy.$modal.msgError('库存调整失败')
  })
}

loadHotelOptions()
getList()
</script>

<style scoped lang="scss">
.mb8 {
  margin-bottom: 8px;
}
</style>
