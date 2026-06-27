<template>
  <div class="app-container dashboard">
    <!-- ==================== 管理员仪表盘 ==================== -->
    <template v-if="isAdmin">
      <el-row :gutter="20" class="dashboard-stats">
        <el-col :xs="12" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon merchant-icon">
                <el-icon :size="36"><OfficeBuilding /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.merchantCount }}</div>
                <div class="stat-label">商户总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon pending-icon">
                <el-icon :size="36"><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.pendingAuditCount }}</div>
                <div class="stat-label">待审核商户</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="12" :md="6">
          <el-card class="stat-card clickable" shadow="hover" @click="goToOrders">
            <div class="stat-content">
              <div class="stat-icon order-icon">
                <el-icon :size="36"><Tickets /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.todayOrderCount }}</div>
                <div class="stat-label">今日订单</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon revenue-icon">
                <el-icon :size="36"><Money /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ formatAmount(statistics.totalRevenue) }}</div>
                <div class="stat-label">平台总收入</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="dashboard-charts">
        <el-col :xs="24" :sm="24" :md="12" :lg="8">
          <el-card class="chart-card">
            <template #header><div class="card-header"><span>商户状态分布</span></div></template>
            <div ref="adminChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="8">
          <el-card class="chart-card">
            <template #header><div class="card-header"><span>商户列表</span></div></template>
            <div class="rank-list">
              <div v-if="merchantRankList.length === 0" class="empty-tip">暂无商户数据</div>
              <div v-for="(m, index) in merchantRankList" :key="m.id" class="rank-item">
                <span :class="['rank-number', { top: index < 3 }]">{{ index + 1 }}</span>
                <span class="rank-title">{{ m.merchantName }}</span>
                <el-tag :type="getStatusTag(m).type" size="small">{{ getStatusTag(m).label }}</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="8">
          <el-card class="chart-card">
            <template #header><div class="card-header"><span>最近订单</span></div></template>
            <el-table :data="recentOrders" style="width: 100%" max-height="280" size="small">
              <el-table-column prop="orderNo" label="订单号" width="130" />
              <el-table-column prop="hotelName" label="酒店" />
              <el-table-column prop="roomType" label="房型" width="100" />
              <el-table-column prop="createTime" label="时间" width="120">
                <template #default="scope"><span>{{ parseTime(scope.row.createTime) }}</span></template>
              </el-table-column>
            </el-table>
            <div v-if="recentOrders.length === 0" class="empty-tip">暂无最近订单</div>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <!-- ==================== 商户仪表盘 ==================== -->
    <template v-else>
      <!-- 商户状态异常提示 -->
      <el-alert v-if="!merchantReady" :title="merchantStatusMsg" type="warning" show-icon :closable="false" class="mb20" />

      <el-row :gutter="20" class="dashboard-stats">
        <el-col :xs="12" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon hotel-icon">
                <el-icon :size="36"><OfficeBuilding /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.hotelCount }}</div>
                <div class="stat-label">旗下酒店</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon room-icon">
                <el-icon :size="36"><Grid /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.roomCount }}</div>
                <div class="stat-label">房型总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="12" :md="6">
          <el-card class="stat-card clickable" shadow="hover" @click="goToOrders">
            <div class="stat-content">
              <div class="stat-icon order-icon">
                <el-icon :size="36"><Tickets /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.todayOrderCount }}</div>
                <div class="stat-label">今日订单</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon revenue-icon">
                <el-icon :size="36"><Money /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ formatAmount(statistics.monthRevenue) }}</div>
                <div class="stat-label">本月收入</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="dashboard-charts">
        <el-col :xs="24" :sm="24" :md="12" :lg="8">
          <el-card class="chart-card">
            <template #header><div class="card-header"><span>房型分布统计</span></div></template>
            <div v-if="!merchantReady" class="empty-tip">{{ merchantStatusMsg }}</div>
            <div v-else ref="merchantChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="8">
          <el-card class="chart-card">
            <template #header><div class="card-header"><span>酒店评分排名</span></div></template>
            <div class="rank-list">
              <div v-if="!merchantReady" class="empty-tip">{{ merchantStatusMsg }}</div>
              <div v-else-if="hotelRankList.length === 0" class="empty-tip">暂无数据</div>
              <div v-for="(hotel, index) in hotelRankList" :key="index" class="rank-item">
                <span :class="['rank-number', { top: index < 3 }]">{{ index + 1 }}</span>
                <span class="rank-title">{{ hotel.hotelName || hotel.name }}</span>
                <span class="rank-count">⭐ {{ hotel.averageScore || '--' }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="8">
          <el-card class="chart-card">
            <template #header><div class="card-header"><span>最近订单</span></div></template>
            <el-table :data="recentOrders" style="width: 100%" max-height="280" size="small">
              <el-table-column prop="orderNo" label="订单号" width="130" />
              <el-table-column prop="hotelName" label="酒店" />
              <el-table-column prop="roomType" label="房型" width="100" />
              <el-table-column prop="createTime" label="时间" width="120">
                <template #default="scope"><span>{{ parseTime(scope.row.createTime) }}</span></template>
              </el-table-column>
            </el-table>
            <div v-if="recentOrders.length === 0" class="empty-tip">暂无最近订单</div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup name="Index">
import { ref, computed, onMounted, nextTick } from 'vue'
import { OfficeBuilding, User, Grid, Tickets, Money } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import { listMerchant, getMyMerchant } from '@/api/biz/merchant'
import { listOrder } from '@/api/biz/order'
import { getMerchantDashboard } from '@/api/biz/statistics'
import { getMerchantCommentStatistics } from '@/api/biz/comment'
import { listRoom } from '@/api/biz/room'

const router = useRouter()
const userStore = useUserStore()

// 角色判断
const isAdmin = computed(() => {
  const roles = userStore.roles || []
  return roles.some(r => r === 'admin' || r === 'ROLE_ADMIN')
})

// 商户数据是否已就绪（审核通过）
const merchantReady = ref(false)
const merchantStatusMsg = ref('')

const adminChartRef = ref(null)
const merchantChartRef = ref(null)

// ---------- 通用数据 ----------
const statistics = ref({
  // admin
  merchantCount: 0,
  pendingAuditCount: 0,
  totalRevenue: 0,
  // merchant
  hotelCount: 0,
  roomCount: 0,
  todayOrderCount: 0,
  monthRevenue: 0
})

const recentOrders = ref([])
const merchantRankList = ref([])
const hotelRankList = ref([])

function goToOrders() { router.push('/today-orders') }
function formatAmount(val) {
  if (val == null || val === 0) return '0'
  const num = Number(val)
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toLocaleString()
}

function extractList(res) {
  const list = res.data?.list || res.data?.rows || res.rows || res.data || []
  return Array.isArray(list) ? list : []
}

// ==================== 管理员数据加载 ====================
async function loadAdminMerchantStats() {
  try {
    const res = await listMerchant({ pageNum: 1, pageSize: 1000 })
    const list = extractList(res)
    merchantRankList.value = list.slice(0, 10)
    statistics.value.merchantCount = list.length
    statistics.value.pendingAuditCount = list.filter(m => m.auditStatus === '0').length
    return list
  } catch {
    merchantRankList.value = []
    return []
  }
}

async function loadAdminRevenue() {
  try {
    const res = await listOrder({ pageNum: 1, pageSize: 1000 })
    const list = extractList(res)
    statistics.value.totalRevenue = list.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0)
    // 统计今日订单数
    const today = new Date().toISOString().split('T')[0]
    statistics.value.todayOrderCount = list.filter(o => {
      const createDate = (o.createTime || '').toString().split(' ')[0]
      return createDate === today
    }).length
  } catch { /* ignore */ }
}

function initAdminMerchantChart(merchants) {
  if (!adminChartRef.value) return
  const chart = echarts.init(adminChartRef.value)
  const statusMap = {}
  merchants.forEach(m => {
    const key = getMerchantStatusLabel(m)
    statusMap[key] = (statusMap[key] || 0) + 1
  })
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left', top: 'middle' },
    series: [{
      name: '商户状态', type: 'pie', radius: '60%', center: ['60%', '50%'],
      data: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  })
  window.addEventListener('resize', () => chart.resize())
}

function getMerchantStatusLabel(m) {
  if (m.status === '4') return '已冻结'
  if (m.status === '3') return '已注销'
  if (m.auditStatus === '0') return '待审核'
  if (m.auditStatus === '2') return '审核拒绝'
  if (m.status === '0') return '营业中'
  if (m.status === '1') return '未激活'
  return '其他'
}

function getStatusTag(m) {
  if (m.status === '4') return { type: 'danger', label: '已冻结' }
  if (m.status === '3') return { type: 'info', label: '已注销' }
  if (m.auditStatus === '0') return { type: 'warning', label: '待审核' }
  if (m.auditStatus === '2') return { type: 'danger', label: '审核拒绝' }
  if (m.status === '0') return { type: 'success', label: '营业中' }
  return { type: 'info', label: '未知' }
}

// ==================== 商户数据加载 ====================
async function loadMerchantDashboardData() {
  try {
    const res = await getMerchantDashboard()
    if (res.data) {
      const d = res.data
      statistics.value.hotelCount = d.hotelCount ?? 0
      statistics.value.roomCount = d.roomCount ?? 0
      statistics.value.todayOrderCount = d.todayOrderCount ?? 0
      statistics.value.monthRevenue = d.monthRevenue ?? 0
    }
  } catch { /* ignore */ }
}

async function loadMerchantHotelRank() {
  try {
    const res = await getMerchantCommentStatistics()
    const data = res.data || res || []
    hotelRankList.value = (Array.isArray(data) ? data : (data.list || data.rows || [])).slice(0, 10)
  } catch {
    hotelRankList.value = []
  }
}

async function loadMerchantRoomTypeData() {
  try {
    const res = await listRoom({ pageNum: 1, pageSize: 100 })
    const rooms = extractList(res)
    const typeMap = {}
    rooms.forEach(r => {
      const type = r.roomType || '其他'
      typeMap[type] = (typeMap[type] || 0) + 1
    })
    return Object.entries(typeMap).map(([name, value]) => ({ name, value }))
  } catch {
    return []
  }
}

function initMerchantRoomChart(data) {
  if (!merchantChartRef.value) return
  const chart = echarts.init(merchantChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { type: 'scroll', orient: 'horizontal', left: 'center', bottom: 0 },
    series: [{
      name: '房型分布', type: 'pie', radius: ['40%', '60%'], center: ['50%', '45%'],
      data: data.length > 0 ? data : [{ value: 0, name: '暂无数据' }],
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  })
  window.addEventListener('resize', () => chart.resize())
}

// ==================== 通用：最近订单 ====================
async function loadRecentOrders() {
  try {
    const res = await listOrder({ pageNum: 1, pageSize: 5 })
    recentOrders.value = extractList(res).slice(0, 5)
  } catch {
    recentOrders.value = []
  }
}

// ==================== 初始化 ====================
onMounted(async () => {
  if (isAdmin.value) {
    // 管理员：加载全平台数据
    await loadRecentOrders()
    const merchants = await loadAdminMerchantStats()
    await loadAdminRevenue()
    nextTick(() => { initAdminMerchantChart(merchants) })
  } else {
    // 商户：先检查审核状态，再加载商户专用数据
    await checkMerchantBeforeLoad()
    if (merchantReady.value) {
      await loadRecentOrders()
      await loadMerchantDashboardData()
      await loadMerchantHotelRank()
      const roomData = await loadMerchantRoomTypeData()
      nextTick(() => { initMerchantRoomChart(roomData) })
    }
  }
})

// 商户身份预检：确认审核通过后再加载数据
async function checkMerchantBeforeLoad() {
  try {
    const res = await getMyMerchant()
    const data = res.data || res
    if (data) {
      const auditStatus = data.auditStatus
      if (auditStatus === '1' || auditStatus === 1) {
        merchantReady.value = true
        return
      }
      if (auditStatus === '0' || auditStatus === 0) {
        merchantStatusMsg.value = '您的商户信息正在审核中，审核通过后可查看仪表盘数据'
      } else if (auditStatus === '2' || auditStatus === 2) {
        merchantStatusMsg.value = '您的商户信息审核未通过，请重新提交'
      } else {
        merchantStatusMsg.value = '商户状态异常，请联系管理员'
      }
    } else {
      merchantStatusMsg.value = '未找到关联的商户信息，请先完成商户注册'
    }
  } catch {
    merchantStatusMsg.value = '获取商户信息失败，请稍后重试'
  }
}
</script>

<style scoped lang="scss">
.dashboard {
  padding: 20px;

  .dashboard-stats {
    margin-bottom: 20px;

    .stat-card {
      transition: all 0.3s;
      &.clickable { cursor: pointer; }
      &:hover { transform: translateY(-5px); }

      .stat-content {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 10px 0;

        .stat-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          &.merchant-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
          &.pending-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #fff; }
          &.hotel-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
          &.room-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #fff; }
          &.order-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: #fff; }
          &.revenue-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #fff; }
        }

        .stat-info {
          text-align: center;
          .stat-value { font-size: 32px; font-weight: bold; color: #303133; margin-bottom: 5px; }
          .stat-label { font-size: 14px; color: #909399; }
        }
      }
    }
  }

  .dashboard-charts {
    margin-bottom: 20px;

    .chart-card {
      height: 100%;
      .chart-container { height: 280px; width: 100%; }

      .rank-list {
        height: 280px;
        overflow-y: auto;

        .rank-item {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
          &:last-child { border-bottom: none; }

          .rank-number {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #e0e0e0;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            margin-right: 12px;
            &.top { background: #f56c6c; }
          }
          .rank-title { flex: 1; color: #303133; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .rank-count { color: #909399; font-size: 12px; margin-left: 10px; }
        }
      }

      .empty-tip {
        height: 280px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #c0c4cc;
        font-size: 14px;
      }
    }
  }
}

:deep(.el-card__header) { padding: 15px 20px; }
</style>
