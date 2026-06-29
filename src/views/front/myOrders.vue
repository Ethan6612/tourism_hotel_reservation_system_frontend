<template>
  <div class="my-orders-page">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <span class="logo-icon">🏨</span>
          <span class="logo-text">ZSC酒店预订</span>
        </div>
        <nav class="nav">
          <a href="/home" class="nav-item">首页</a>
          <a href="/search" class="nav-item">酒店</a>
          <a href="#" class="nav-item" @click.prevent="goToOrders">我的订单</a>
          <a href="#" class="nav-item" @click.prevent="goToReviews">我的评价</a>
        </nav>
        <div class="user-actions">
          <template v-if="isLoggedIn">
            <div class="notification-bell" @click="goToNotifications">
              <span class="bell-icon">🔔</span>
              <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
            </div>
            <el-dropdown ref="userDropdown" @command="handleUserCommand" trigger="hover">
              <span class="user-dropdown">
                <span class="user-avatar">{{ userAvatar }}</span>
                <span class="user-name">{{ userName }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                  <el-dropdown-item command="points">我的积分</el-dropdown-item>
                  <el-dropdown-item command="reviews">我的评价</el-dropdown-item>
                  <el-dropdown-item command="favorites">我的收藏</el-dropdown-item>
                  <el-dropdown-item command="console" v-if="isAdmin || isMerchant" divided>前往控制台</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <button class="action-btn" @click="goToLogin">登录</button>
            <button class="action-btn primary" @click="goToRegister">注册</button>
          </template>
        </div>
      </div>
    </header>

    <!-- 页面主体 -->
    <div class="page-body">
      <div class="container">
        <!-- 页面标题和积分卡片 -->
        <div class="page-header">
          <div class="page-title-row">
            <h1 class="page-title">我的订单</h1>
            <span class="page-subtitle">查看和管理您的所有订单</span>
          </div>
          <div class="points-card" @click="goToPoints">
            <div class="points-icon">🎁</div>
            <div class="points-info">
              <span class="points-label">我的积分</span>
              <span class="points-value">{{ userPoints }}</span>
              <span class="points-tip">1元消费 = 1积分</span>
            </div>
          </div>
        </div>

        <!-- 统计概览 -->
        <div class="stats-row">
          <div :class="['stat-item', { active: activeTab === 'all' }]" @click="switchTab('all')">
            <span class="stat-num">{{ stats.total }}</span>
            <span class="stat-text">全部订单</span>
          </div>
          <div :class="['stat-item', { active: activeTab === 'ongoing' }]" @click="switchTab('ongoing')">
            <span class="stat-num ongoing">{{ stats.ongoing }}</span>
            <span class="stat-text">进行中</span>
          </div>
          <div :class="['stat-item', { active: activeTab === 'completed' }]" @click="switchTab('completed')">
            <span class="stat-num completed">{{ stats.completed }}</span>
            <span class="stat-text">已完成</span>
          </div>
          <div :class="['stat-item', { active: activeTab === 'cancelled' }]" @click="switchTab('cancelled')">
            <span class="stat-num cancelled">{{ stats.cancelled }}</span>
            <span class="stat-text">已取消/退款</span>
          </div>
        </div>

        <!-- 筛选标签 -->
        <div class="tab-bar">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['tab-btn', { active: activeTab === tab.key }]"
            @click="switchTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 搜索框 -->
        <div class="search-bar">
          <input v-model="orderSearchKey" placeholder="搜索订单（酒店名/订单号/房型）" class="search-input" />
          <span v-if="orderSearchKey" class="search-clear" @click="orderSearchKey = ''">✕</span>
        </div>

        <!-- 订单列表 -->
        <div v-loading="loading" class="order-list-section">
          <template v-if="filteredOrderList.length > 0">
            <div v-for="order in filteredOrderList" :key="order.id" class="order-card">
              <!-- 订单头部 -->
              <div class="order-card-header">
                <div class="order-hotel-info">
                  <span class="order-icon">🏨</span>
                  <span class="order-hotel-name">{{ order.hotelName }}</span>
                  <el-tag :type="getStatusTagType(order.status)" size="small">
                    {{ order.statusName }}
                  </el-tag>
                </div>
                <div class="order-no">
                  订单号：{{ order.orderNo }}
                </div>
              </div>

              <!-- 订单详情 -->
              <div class="order-card-body">
                <div class="order-detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">房型</span>
                    <span class="detail-value">{{ order.roomType || '-' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">入住日期</span>
                    <span class="detail-value">{{ formatDate(order.startDate) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">离店日期</span>
                    <span class="detail-value">{{ formatDate(order.endDate) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">入住天数</span>
                    <span class="detail-value">{{ calcNights(order.startDate, order.endDate) }}晚</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">支付方式</span>
                    <span class="detail-value">{{ order.payTypeName || '-' }}</span>
                  </div>
                  <div class="detail-item" v-if="order.status === '3'">
                    <span class="detail-label">获得积分</span>
                    <span class="detail-value points-earned">+{{ calcPoints(order.totalPrice) }}</span>
                  </div>
                </div>
              </div>

              <!-- 订单底部 -->
              <div class="order-card-footer">
                <div class="order-time">
                  <span>下单时间：{{ order.createTime }}</span>
                  <span v-if="order.payTime"> | 支付时间：{{ order.payTime }}</span>
                </div>
                <div class="order-actions">
                  <span class="order-price">
                    <span class="price-label">订单金额：</span>
                    <span class="price-symbol">¥</span>
                    <span class="price-value">{{ order.totalPrice }}</span>
                  </span>
                  <button
                    class="order-btn detail-btn"
                    @click="handleDetail(order)"
                  >查看详情</button>
                  <button
                    v-if="order.status === '0'"
                    class="order-btn pay-btn"
                    @click="handlePay(order)"
                  >去支付</button>
                  <button
                    v-if="order.status === '0'"
                    class="order-btn cancel-btn"
                    @click="handleCancel(order)"
                  >取消订单</button>
                  <button
                    v-if="order.status === '2' || order.status === '5' || order.status === '6'"
                    class="order-btn delete-btn"
                    @click="handleDelete(order)"
                  >删除</button>
                  <button
                    v-if="order.status === '3' && !order.reviewed"
                    class="order-btn pay-btn"
                    style="background:#f0fdf4;color:#22c55e"
                    @click="handleDetail(order)"
                  >已入住</button>
                  <button
                    v-if="order.status === '3' && !order.reviewed"
                    class="order-btn review-btn"
                    @click="goToWriteReview(order)"
                  >去评价</button>
                  <button
                    v-if="order.status === '3' && order.reviewed"
                    class="order-btn pay-btn"
                    style="background:#e8f5e9;color:#4caf50"
                    @click="handleDetail(order)"
                  >已完成</button>
                  <button
                    v-if="order.status === '3' && order.reviewed"
                    class="order-btn review-btn"
                    @click="goToEditReview(order)"
                  >修改评价</button>
                  <button
                    v-if="order.status === '4'"
                    class="order-btn detail-btn"
                    @click="handleDetail(order)"
                  >查看详情</button>
                </div>
              </div>
            </div>
          </template>

          <!-- 空状态 -->
          <div v-else-if="orderSearchKey && orderList.length > 0" class="empty-state">
            <span class="empty-icon">🔍</span>
            <p>未找到匹配的订单</p>
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon">📋</span>
            <p v-if="activeTab === 'all'">暂无订单记录</p>
            <p v-else-if="activeTab === 'ongoing'">暂无进行中的订单</p>
            <p v-else-if="activeTab === 'completed'">暂无已完成的订单</p>
            <p v-else>暂无已取消/退款的订单</p>
            <button class="go-book-btn" @click="goToHotelList">去预订酒店 →</button>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrap" v-if="total > 0">
          <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[5, 10, 20]"
            :total="total"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 微信支付对话框 -->
    <el-dialog title="微信支付" v-model="payDialogOpen" width="420px" destroy-on-close center>
      <div class="pay-dialog-body">
        <div class="pay-order-info">
          <span class="pay-label">订单号</span>
          <span class="pay-value">{{ payingOrder.orderNo }}</span>
        </div>
        <div class="pay-order-info">
          <span class="pay-label">支付金额</span>
          <span class="pay-amount">¥{{ payingOrder.totalPrice }}</span>
        </div>
        <div class="pay-qrcode">
          <img :src="payQrCode" alt="微信支付二维码" />
          <p>请使用微信扫一扫支付</p>
        </div>
        <div class="pay-tips">
          <span>💡 演示环境，点击下方按钮模拟支付</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="payDialogOpen = false">取消支付</el-button>
        <el-button type="success" @click="confirmPayment" :loading="paying">
          确认支付 ¥{{ payingOrder.totalPrice }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 订单详情对话框 -->
    <el-dialog :title="'订单详情 - ' + currentOrder.orderNo" v-model="detailOpen" width="650px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusTagType(currentOrder.status)">{{ currentOrder.statusName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="酒店">{{ currentOrder.hotelName }}</el-descriptions-item>
        <el-descriptions-item label="房型">{{ currentOrder.roomType || '-' }}</el-descriptions-item>
        <el-descriptions-item label="入住日期">{{ formatDate(currentOrder.startDate) }}</el-descriptions-item>
        <el-descriptions-item label="离店日期">{{ formatDate(currentOrder.endDate) }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ currentOrder.totalPrice }}</el-descriptions-item>
        <el-descriptions-item label="支付金额">¥{{ currentOrder.payAmount || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ currentOrder.payTypeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="交易号">{{ currentOrder.transactionId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ currentOrder.payTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
        <el-descriptions-item v-if="currentOrder.status === '3'" label="获得积分">
          <span style="color: #22c55e; font-weight: 600;">+{{ calcPoints(currentOrder.totalPrice) }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="MyOrders">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'
import { getToken } from '@/utils/auth'
import { listMyOrders, getOrderDetail, cancelOrder, deleteOrder, getUserDashboardStats, initiatePay, confirmPay } from '@/api/front/userHome'
import QRCode from 'qrcode'

const router = useRouter()
const userStore = useUserStore()

// 用户状态
const isLoggedIn = computed(() => !!getToken())
const userName = computed(() => userStore.nickName || userStore.name || '用户')
const userAvatar = computed(() => (userStore.nickName || userStore.name || '用户').charAt(0).toUpperCase())
const isAdmin = computed(() => userStore.roles?.some(r => r === 'admin' || r === 'ROLE_ADMIN'))
const isMerchant = computed(() => userStore.roles?.some(r => r === 'merchant' || r === 'ROLE_MERCHANT'))

const unreadCount = ref(0)

const loading = ref(false)
const orderList = ref([])
const total = ref(0)
const activeTab = ref('all')
const detailOpen = ref(false)
const currentOrder = ref({})
const userPoints = ref(0)
const payDialogOpen = ref(false)
const payingOrder = ref({})
const payQrCode = ref('')
const paying = ref(false)
const orderSearchKey = ref('')
const filteredOrderList = computed(() => {
  if (!orderSearchKey.value) return orderList.value
  const kw = orderSearchKey.value.toLowerCase()
  return orderList.value.filter(o =>
    (o.hotelName || '').toLowerCase().includes(kw) ||
    (o.orderNo || '').toLowerCase().includes(kw) ||
    (o.roomType || '').toLowerCase().includes(kw)
  )
})

const stats = reactive({
  total: 0,
  ongoing: 0,
  completed: 0,
  cancelled: 0
})

const tabs = [
  { key: 'all', label: '全部订单' },
  { key: 'ongoing', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消/退款' }
]

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
})

// 根据tab获取查询状态
function getQueryStatus() {
  switch (activeTab.value) {
    case 'ongoing': return '0,1,4'  // 待支付、已支付、退款中
    case 'completed': return '3'     // 已完成
    case 'cancelled': return '2,5,6' // 已取消、已退款、退款驳回
    default: return ''               // 全部
  }
}

function formatDate(date) {
  if (!date) return '-'
  if (typeof date === 'string') return date.substring(0, 10)
  return new Date(date).toISOString().substring(0, 10)
}

function calcNights(startDate, endDate) {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = end.getTime() - start.getTime()
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
}

function calcPoints(totalPrice) {
  if (!totalPrice) return 0
  return Math.floor(Number(totalPrice))
}

function getStatusTagType(status) {
  const m = { '0': 'info', '1': '', '2': 'warning', '3': 'success', '4': 'danger', '5': 'info', '6': 'danger' }
  return m[status] || 'info'
}

// 导航
function goHome() { router.push('/home') }
function goToLogin() { router.push('/login') }
function goToRegister() { router.push('/login?tab=register') }
function goToHotelList() { router.push('/search') }
function goToPoints() { router.push('/user/profile/points') }
function goToNotifications() { router.push('/user/notifications') }
function goToReviews() { router.push('/user/myComments') }
function goToOrders() { router.push('/user/profile/orders') }
function goToWriteReview(order) {
  router.push({ path: '/user/comment/write', query: {
    orderId: order.id,
    hotelId: order.hotelId,
    hotelName: order.hotelName || undefined,
    hotelImage: order.hotelImage || undefined,
    roomType: order.roomType || undefined,
    roomId: order.roomId || undefined,
    checkInDate: order.startDate || undefined,
    checkOutDate: order.endDate || undefined
  }})
}

function goToEditReview(order) {
  if (order.commentId) {
    router.push('/user/comment/edit/' + order.commentId)
  }
}

function handleUserCommand(command) {
  switch (command) {
    case 'profile': router.push('/user/profile'); break
    case 'orders': router.push('/user/profile/orders'); break
    case 'points': router.push('/user/profile/points'); break
    case 'reviews': router.push('/user/myComments'); break
    case 'home': router.push('/home'); break
    case 'console': router.push('/dashboard'); break
    case 'logout': logout(); break
  }
}

function logout() {
  userStore.logOut().then(() => {
    ElMessage.success('退出登录成功')
    window.location.href = '/index'
  })
}

function switchTab(key) {
  activeTab.value = key
  queryParams.pageNum = 1
  loadOrders()
}

function handlePageChange() { loadOrders() }
function handleSizeChange() {
  queryParams.pageNum = 1
  loadOrders()
}

// 加载订单列表
async function loadOrders() {
  loading.value = true
  try {
    const params = { pageNum: queryParams.pageNum, pageSize: queryParams.pageSize }
    const status = getQueryStatus()
    if (status) params.status = status

    const res = await listMyOrders(params)
    if (res.data) {
      orderList.value = res.data.rows || []
      total.value = res.data.total || 0
    } else if (res.rows) {
      orderList.value = res.rows || []
      total.value = res.total || 0
    }
  } catch {
    orderList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 加载统计数据
async function loadStats() {
  try {
    const res = await getUserDashboardStats()
    const data = res.data || res
    if (data) {
      userPoints.value = data.points || 0
      // 使用后端返回的精确分类统计
      if (data.completedOrders !== undefined && data.cancelledOrders !== undefined) {
        stats.total = data.orderCount || 0
        stats.ongoing = data.activeOrders || 0
        stats.completed = data.completedOrders || 0
        stats.cancelled = data.cancelledOrders || 0
      } else {
        // 后端未返回分类统计时，拉全量订单自行统计
        await loadAllOrdersForStats()
      }
    }
  } catch {
    await loadAllOrdersForStats()
  }
}

// 拉取全量订单自行统计分类
async function loadAllOrdersForStats() {
  try {
    const res = await listMyOrders({ pageNum: 1, pageSize: 1000 })
    const list = res.data?.rows || res.rows || []
    stats.total = list.length
    stats.ongoing = list.filter(o => o.status === '0' || o.status === '1' || o.status === '4').length
    stats.completed = list.filter(o => o.status === '3').length
    stats.cancelled = list.filter(o => o.status === '2' || o.status === '5' || o.status === '6').length
  } catch {
    stats.total = total.value
  }
}

// 查看详情
function handleDetail(order) {
  getOrderDetail(order.id).then(res => {
    currentOrder.value = res.data || res
    detailOpen.value = true
  }).catch(() => {
    ElMessage.error('获取订单详情失败')
  })
}

// 取消订单
function handleCancel(order) {
  ElMessageBox.confirm('确定要取消该订单吗？', '取消订单', {
    confirmButtonText: '确定取消',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(async () => {
    try {
      await cancelOrder(order.id)
      ElMessage.success('订单已取消')
      loadOrders()
      loadStats()
    } catch {
      ElMessage.error('取消失败')
    }
  }).catch(() => {})
}

// 删除订单
function handleDelete(order) {
  ElMessageBox.confirm('确定要删除该订单吗？删除后不可恢复。', '删除订单', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteOrder(order.id)
      ElMessage.success('订单已删除')
      loadOrders()
      loadStats()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 去支付
async function handlePay(order) {
  try {
    const res = await initiatePay(order.id)
    const data = res.data || res
    if (data && data.code && data.code !== 200) {
      ElMessage.error(data.msg || '发起支付失败')
      return
    }
    payingOrder.value = order
    payDialogOpen.value = true
    const qrData = 'WECHAT_PAY_' + (data.transactionId || order.orderNo)
    try {
      payQrCode.value = await QRCode.toDataURL(qrData, { width: 200, margin: 1 })
    } catch (e) {
      console.error('QR生成失败:', e)
      ElMessage.warning('二维码生成失败，可直接点击确认支付')
    }
  } catch (e) {
    const msg = e?.response?.data?.msg || e?.message || '发起支付失败，请重试'
    ElMessage.error(msg)
  }
}

// 确认支付
async function confirmPayment() {
  paying.value = true
  try {
    await confirmPay(payingOrder.value.id)
    ElMessage.success('支付成功！')
    payDialogOpen.value = false
    loadOrders()
    loadStats()
  } catch {
    ElMessage.error('支付失败，请重试')
  } finally {
    paying.value = false
  }
}

onMounted(() => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  loadOrders()
  loadStats()
})
</script>

<style scoped>
/* ==================== 页面基础 ==================== */
.my-orders-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* ==================== 头部 ==================== */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.logo { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.logo-icon { font-size: 24px; }
.logo-text { font-size: 20px; font-weight: 700; color: #333; }

.nav { display: flex; gap: 32px; }

.nav-item {
  text-decoration: none;
  color: #666;
  font-size: 14px;
  transition: color 0.3s;
  cursor: pointer;
}

.nav-item:hover, .nav-item.active { color: #ff6b6b; }

.user-actions { display: flex; gap: 12px; align-items: center; }

.user-dropdown {
  display: flex; align-items: center; gap: 8px;
  cursor: pointer; padding: 4px 12px;
  border-radius: 20px; transition: background 0.3s;
}

.user-dropdown:hover { background: rgba(0, 0, 0, 0.05); }

.user-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff; display: flex; align-items: center;
  justify-content: center; font-size: 14px; font-weight: 600;
}

.user-name { font-size: 14px; color: #333; }

.action-btn {
  padding: 8px 20px; border: 1px solid #ddd;
  border-radius: 20px; background: #fff; color: #666;
  font-size: 14px; cursor: pointer; transition: all 0.3s;
}

.action-btn:hover { border-color: #ff6b6b; color: #ff6b6b; }
.action-btn.primary { background: linear-gradient(135deg, #ff6b6b, #ee5a24); border-color: transparent; color: #fff; }
.action-btn.primary:hover { opacity: 0.9; }

/* ==================== 页面主体 ==================== */
.page-body { padding-top: 80px; }

.page-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
}

.page-title-row { display: flex; flex-direction: column; gap: 4px; }

.page-title {
  font-size: 28px; font-weight: 700; color: #333; margin: 0;
}

.page-subtitle { font-size: 14px; color: #999; }

/* 积分卡片 */
.points-card {
  display: flex; align-items: center; gap: 16px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 16px; padding: 16px 28px;
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.2);
  cursor: pointer; transition: transform 0.25s, box-shadow 0.25s;
}
.points-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(251, 191, 36, 0.35);
}

.points-icon { font-size: 36px; }

.points-info { display: flex; flex-direction: column; gap: 2px; }

.points-label { font-size: 13px; color: #92400e; font-weight: 500; }

.points-value {
  font-size: 32px; font-weight: 800; color: #92400e; line-height: 1.1;
}

.points-tip {
  font-size: 11px; color: #a16207;
}

/* ==================== 统计行 ==================== */
.stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex; flex-direction: column; align-items: center;
  padding: 16px; background: #fff; border-radius: 10px;
  cursor: pointer; transition: all 0.25s;
  border: 2px solid transparent;
}

.stat-item:hover { border-color: #ff6b6b33; transform: translateY(-2px); }

.stat-item.active {
  border-color: #ff6b6b;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);
}

.stat-num { font-size: 28px; font-weight: 700; color: #333; line-height: 1.2; }
.stat-num.ongoing { color: #3b82f6; }
.stat-num.completed { color: #22c55e; }
.stat-num.cancelled { color: #9ca3af; }

.stat-text { font-size: 13px; color: #999; margin-top: 4px; }

/* ==================== Tab栏 ==================== */
.tab-bar {
  display: flex; gap: 12px; margin-bottom: 20px;
}

.tab-btn {
  padding: 8px 24px; border: none; background: #fff;
  color: #666; font-size: 14px; border-radius: 20px;
  cursor: pointer; transition: all 0.3s;
}

.tab-btn:hover { color: #ff6b6b; }

.tab-btn.active {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff; font-weight: 600;
}

/* ==================== 搜索框 ==================== */
.search-bar {
  margin-bottom: 16px;
  position: relative;
  max-width: 360px;
}
.search-input {
  width: 100%;
  padding: 10px 36px 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: #3b82f6; }
.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #999;
  font-size: 16px;
}

/* ==================== 订单列表 ==================== */
.order-list-section { min-height: 300px; }

.order-card {
  background: #fff; border-radius: 12px; margin-bottom: 16px;
  overflow: hidden; transition: box-shadow 0.3s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.order-card:hover { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }

.order-card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; background: #fafafa; border-bottom: 1px solid #f0f0f0;
}

.order-hotel-info { display: flex; align-items: center; gap: 10px; }
.order-icon { font-size: 18px; }
.order-hotel-name { font-size: 15px; font-weight: 600; color: #333; }

.order-no {
  font-size: 12px; color: #999; font-family: 'SF Mono', 'Consolas', monospace;
}

.order-card-body { padding: 16px 24px; }

.order-detail-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px 24px;
}

.detail-item { display: flex; flex-direction: column; gap: 4px; }

.detail-label { font-size: 12px; color: #999; }
.detail-value { font-size: 14px; color: #333; font-weight: 500; }

.points-earned {
  color: #22c55e !important; font-weight: 700 !important;
  font-size: 16px !important;
}

.order-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 24px; border-top: 1px solid #f0f0f0;
  flex-wrap: wrap; gap: 12px;
}

.order-time { font-size: 12px; color: #999; }

.order-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.order-price { display: flex; align-items: baseline; gap: 2px; }

.price-label { font-size: 13px; color: #999; }

.price-symbol { font-size: 14px; color: #ff6b6b; font-weight: 600; }

.price-value {
  font-size: 22px; font-weight: 700; color: #ff6b6b;
}

.order-btn {
  padding: 6px 16px; border: none; border-radius: 16px;
  font-size: 13px; cursor: pointer; transition: all 0.3s;
}

.detail-btn { background: #f0f0f0; color: #666; }
.detail-btn:hover { background: #e0e0e0; }

.cancel-btn { background: #fef2f2; color: #ef4444; }
.cancel-btn:hover { background: #ef4444; color: #fff; }

.pay-btn { background: #eef2ff; color: #3b82f6; }
.pay-btn:hover { background: #3b82f6; color: #fff; }

.delete-btn { background: #f5f5f5; color: #999; }
.delete-btn:hover { background: #ef4444; color: #fff; }

.review-btn { background: #fff7ed; color: #ea580c; }
.reviewed { background: #fef3c7; color: #d97706; cursor: default; }
.review-btn:hover { background: #ea580c; color: #fff; }

/* ==================== 空状态 ==================== */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 80px 20px; color: #999;
}

.empty-icon { font-size: 48px; margin-bottom: 16px; }

.empty-state p { font-size: 15px; margin-bottom: 20px; }

.go-book-btn {
  padding: 10px 28px; border: none;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff; font-size: 14px; font-weight: 600;
  border-radius: 25px; cursor: pointer; transition: all 0.3s;
}

.go-book-btn:hover { opacity: 0.9; transform: translateY(-1px); }

/* ==================== 分页 ==================== */
.pagination-wrap {
  display: flex; justify-content: center; margin-top: 30px; padding-bottom: 40px;
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .order-detail-grid { grid-template-columns: repeat(2, 1fr); }
  .order-card-footer { flex-direction: column; align-items: flex-start; }
  .order-actions { width: 100%; justify-content: flex-end; }
  .points-card { width: 100%; justify-content: center; }
}

/* ==================== 支付对话框 ==================== */
.pay-dialog-body {
  text-align: center;
  padding: 10px 0;
}
.pay-order-info {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.pay-label { font-size: 14px; color: #999; }
.pay-value { font-size: 14px; color: #333; font-weight: 500; }
.pay-amount { font-size: 22px; font-weight: 700; color: #ff6b6b; }
.pay-qrcode {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pay-qrcode img,
.pay-qrcode canvas {
  width: 200px;
  height: 200px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.pay-qrcode p {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
}
.pay-tips {
  margin-top: 16px;
  padding: 10px 16px;
  background: #fef3c7;
  border-radius: 8px;
  font-size: 13px;
  color: #92400e;
}
</style>
