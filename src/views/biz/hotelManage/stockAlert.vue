<template>
  <div class="app-container stock-alert-page">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-item">
            <div class="stat-icon total"><el-icon :size="32"><Box /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">预警总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-item">
            <div class="stat-icon warning"><el-icon :size="32"><Warning /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.warning }}</div>
              <div class="stat-label">库存预警（5-10）</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-item">
            <div class="stat-icon danger"><el-icon :size="32"><CircleClose /></el-icon></div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.danger }}</div>
              <div class="stat-label">库存紧急（≤5）</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="选择酒店">
          <el-select v-model="queryParams.hotelId" placeholder="请选择酒店" clearable filterable @change="handleFilter" style="width: 200px">
            <el-option v-for="h in hotelOptions" :key="h.id" :label="h.name" :value="h.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警等级">
          <el-select v-model="queryParams.level" placeholder="全部" clearable @change="handleFilter" style="width: 120px">
            <el-option label="紧急（≤5）" value="danger" />
            <el-option label="预警（5-10）" value="warning" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Refresh" @click="loadData">刷新</el-button>
          <el-button icon="Back" @click="goBack">返回房源管理</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 预警列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">🚨 库存预警列表</span>
          <el-tag type="danger" effect="dark" v-if="total > 0">共 {{ total }} 条预警</el-tag>
        </div>
      </template>
      <el-table v-loading="loading" :data="roomList" border stripe>
        <el-table-column label="ID" align="center" prop="id" width="60" />
        <el-table-column label="所属酒店" prop="hotelName" min-width="160" show-overflow-tooltip />
        <el-table-column label="房型名称" prop="roomType" min-width="120" />
        <el-table-column label="床型" prop="bedType" width="90" align="center" />
        <el-table-column label="可住人数" width="90" align="center">
          <template #default="scope">
            {{ scope.row.guestNum || '-' }}人
          </template>
        </el-table-column>
        <el-table-column label="价格" width="100" align="center">
          <template #default="scope">
            <span class="price-text">¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="当前库存" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.stock <= 5 ? 'danger' : 'warning'" effect="dark">
              {{ scope.row.stock }} 间
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预警等级" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.stock <= 5 ? 'danger' : 'warning'">
              {{ scope.row.stock <= 5 ? '紧急' : '预警' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="房型状态" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '0' ? 'success' : 'info'">
              {{ scope.row.status === '0' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="Box" @click="handleStock(scope.row)">补货</el-button>
            <el-button link type="warning" icon="Money" @click="handlePrice(scope.row)">调价</el-button>
            <el-button
                v-if="scope.row.status === '0'"
                link type="danger" icon="VideoPause"
                @click="handleStatusChange(scope.row, '1')"
            >下架</el-button>
            <el-button
                v-else
                link type="success" icon="VideoPlay"
                @click="handleStatusChange(scope.row, '0')"
            >上架</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!loading && roomList.length === 0" class="empty-tip">
        <el-empty description="暂无库存预警，库存充足！" />
      </div>

      <!-- 分页 -->
      <pagination v-show="total > 0" :total="total" v-model:page="pageNum" v-model:limit="pageSize" @pagination="handlePageChange" />
    </el-card>

    <!-- 调整库存对话框 -->
    <el-dialog title="补货" v-model="stockOpen" width="400px" append-to-body>
      <el-form ref="stockRef" :model="stockForm" :rules="stockRules" label-width="80px">
        <el-form-item label="房型">
          <span>{{ currentRoom.roomType }}</span>
        </el-form-item>
        <el-form-item label="所属酒店">
          <span>{{ currentRoom.hotelName }}</span>
        </el-form-item>
        <el-form-item label="当前库存">
          <el-tag :type="currentRoom.stock <= 5 ? 'danger' : 'warning'" effect="dark">
            {{ currentRoom.stock }} 间
          </el-tag>
        </el-form-item>
        <el-form-item label="补货数量" prop="stock">
          <el-input-number v-model="stockForm.stock" :min="1" :max="999" :step="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockOpen = false">取消</el-button>
        <el-button type="primary" @click="submitStock">确认补货</el-button>
      </template>
    </el-dialog>

    <!-- 调整价格对话框 -->
    <el-dialog title="调整价格" v-model="priceOpen" width="400px" append-to-body>
      <el-form ref="priceRef" :model="priceForm" :rules="priceRules" label-width="80px">
        <el-form-item label="房型">
          <span>{{ currentRoom.roomType }}</span>
        </el-form-item>
        <el-form-item label="当前价格">
          <span class="price-text">¥{{ currentRoom.price }}</span>
        </el-form-item>
        <el-form-item label="新价格" prop="price">
          <el-input-number v-model="priceForm.price" :min="0" :precision="2" :step="10" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="priceOpen = false">取消</el-button>
        <el-button type="primary" @click="submitPrice">确认调整</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="StockAlert">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { Box, Warning, CircleClose } from '@element-plus/icons-vue'
import { listRoom, getLowStockRooms, updateRoomStock, updateRoomPrice, updateRoomStatus } from '@/api/biz/adminRoom'
import { listHotel } from '@/api/biz/adminHotel'
import Pagination from '@/components/Pagination/index.vue'

const { proxy } = getCurrentInstance()
const router = useRouter()

// 酒店选项
const hotelOptions = ref([])

// 查询参数
const queryParams = ref({
  hotelId: undefined,
  level: undefined
})

// 分页参数
const pageNum = ref(1)
const pageSize = ref(50)

// 房间列表（所有低库存房型）
const allLowStockList = ref([])
// 当前页显示的列表
const roomList = ref([])
const loading = ref(false)
const total = ref(0)

// 统计数据
const stats = ref({
  total: 0,
  warning: 0,
  danger: 0
})

// 对话框状态
const stockOpen = ref(false)
const priceOpen = ref(false)
const currentRoom = ref({})
const stockForm = ref({ stock: 10 })
const priceForm = ref({ price: 0 })

const stockRules = {
  stock: [{ required: true, message: '补货数量不能为空', trigger: 'blur' }]
}

const priceRules = {
  price: [{ required: true, message: '价格不能为空', trigger: 'blur' }]
}

// 返回房源管理
function goBack() {
  router.push('/biz/hotelManage/roomManage')
}

// 加载酒店选项
async function loadHotelOptions() {
  try {
    const res = await listHotel({ pageNum: 1, pageSize: 100 })
    const data = res.data || res
    hotelOptions.value = (data.rows || data.list || []).map(h => ({ id: h.id, name: h.name }))
  } catch {
    hotelOptions.value = []
  }
}

// 加载数据（使用专用API获取低库存房型）
async function loadData() {
  loading.value = true
  try {
    // 使用专用API获取库存<=10的房型
    const res = await getLowStockRooms(10)
    const data = res.data || res || []
    allLowStockList.value = Array.isArray(data) ? data : []

    // 更新统计
    stats.value = {
      total: allLowStockList.value.length,
      warning: allLowStockList.value.filter(r => r.stock > 5).length,
      danger: allLowStockList.value.filter(r => r.stock <= 5).length
    }

    // 应用筛选和分页
    applyFilterAndPaginate()
  } catch {
    allLowStockList.value = []
    roomList.value = []
    stats.value = { total: 0, warning: 0, danger: 0 }
  } finally {
    loading.value = false
  }
}

// 应用筛选和分页
function applyFilterAndPaginate() {
  let filtered = [...allLowStockList.value]

  // 按预警等级筛选
  if (queryParams.value.level === 'danger') {
    filtered = filtered.filter(r => r.stock <= 5)
  } else if (queryParams.value.level === 'warning') {
    filtered = filtered.filter(r => r.stock > 5)
  }

  // 按酒店筛选
  if (queryParams.value.hotelId) {
    filtered = filtered.filter(r => r.hotelId === queryParams.value.hotelId)
  }

  // 更新总数
  total.value = filtered.length

  // 分页
  const start = (pageNum.value - 1) * pageSize.value
  const end = start + pageSize.value
  roomList.value = filtered.slice(start, end)
}

// 筛选变化
function handleFilter() {
  pageNum.value = 1
  applyFilterAndPaginate()
}

// 分页变化
function handlePageChange() {
  applyFilterAndPaginate()
}

// 补货
function handleStock(row) {
  currentRoom.value = row
  stockForm.value.stock = 10
  stockOpen.value = true
}

// 提交补货
function submitStock() {
  proxy.$refs['stockRef'].validate(valid => {
    if (valid) {
      const newStock = currentRoom.value.stock + stockForm.value.stock
      updateRoomStock(currentRoom.value.id, newStock).then(() => {
        proxy.$modal.msgSuccess('补货成功')
        stockOpen.value = false
        loadData()
      })
    }
  })
}

// 调价
function handlePrice(row) {
  currentRoom.value = row
  priceForm.value.price = row.price
  priceOpen.value = true
}

// 提交调价
function submitPrice() {
  proxy.$refs['priceRef'].validate(valid => {
    if (valid) {
      updateRoomPrice(currentRoom.value.id, priceForm.value.price).then(() => {
        proxy.$modal.msgSuccess('价格调整成功')
        priceOpen.value = false
        loadData()
      })
    }
  })
}

// 上下架
function handleStatusChange(row, status) {
  const label = status === '0' ? '上架' : '下架'
  proxy.$modal.confirm(`确认${label}房型"${row.roomType}"？`).then(() => {
    return updateRoomStatus(row.id, status)
  }).then(() => {
    proxy.$modal.msgSuccess(`${label}成功`)
    loadData()
  }).catch(() => {})
}

// 初始化
onMounted(async () => {
  await loadHotelOptions()
  await loadData()
})
</script>

<style scoped lang="scss">
.stock-alert-page {
  .stats-row {
    margin-bottom: 16px;

    .stat-card {
      .stat-item {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;

          &.total { background: linear-gradient(135deg, #667eea, #764ba2); }
          &.warning { background: linear-gradient(135deg, #f6d365, #fda085); }
          &.danger { background: linear-gradient(135deg, #f5576c, #ff6b6b); }
        }

        .stat-content {
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
          }

          .stat-label {
            font-size: 13px;
            color: #909399;
            margin-top: 2px;
          }
        }
      }
    }
  }

  .filter-card {
    margin-bottom: 16px;
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }

  .price-text {
    color: #e6a23c;
    font-weight: 600;
    font-size: 14px;
  }

  .empty-tip {
    padding: 40px 0;
  }
}
</style>
