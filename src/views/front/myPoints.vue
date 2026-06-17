<template>
  <div class="my-points-page">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <span class="logo-icon">🏨</span>
          <span class="logo-text">ZSC酒店预订</span>
        </div>
        <nav class="nav">
          <a href="#" class="nav-item" @click.prevent="goHome">首页</a>
          <a href="#" class="nav-item" @click.prevent="goToHotelList">酒店</a>
          <a href="#" class="nav-item active">我的积分</a>
        </nav>
        <div class="user-actions">
          <template v-if="isLoggedIn">
            <el-dropdown @command="handleUserCommand" trigger="hover">
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
                  <el-dropdown-item command="home">返回首页</el-dropdown-item>
                  <el-dropdown-item command="console" v-if="isAdmin || isMerchant" divided>前往控制台</el-dropdown-item>
                  <el-dropdown-item command="logout" :divided="!isAdmin && !isMerchant">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <button class="action-btn" @click="goToLogin">登录</button>
            <button class="action-btn primary">注册</button>
          </template>
        </div>
      </div>
    </header>

    <!-- 页面主体 -->
    <div class="page-body">
      <div class="container">
        <!-- 积分概览 -->
        <div class="points-hero">
          <div class="points-hero-bg"></div>
          <div class="points-hero-content">
            <span class="points-hero-icon">🎁</span>
            <div class="points-hero-info">
              <span class="points-hero-label">当前积分</span>
              <span class="points-hero-value">{{ userPoints.toLocaleString() }}</span>
            </div>
            <div class="points-hero-rule">
              <span>💡 积分规则：订单完成后自动获得积分</span>
              <span>💰 换算比例：<strong>1元消费 = 1积分</strong></span>
            </div>
          </div>
        </div>

        <!-- 积分明细 -->
        <div class="points-detail-section">
          <div class="section-header">
            <h2 class="section-title">积分明细</h2>
            <span class="section-subtitle">仅已完成订单可获得积分</span>
          </div>

          <div v-loading="loading" class="points-list">
            <template v-if="completedOrders.length > 0">
              <div v-for="order in completedOrders" :key="order.id" class="points-item">
                <div class="points-item-left">
                  <div class="points-item-icon">✅</div>
                  <div class="points-item-info">
                    <div class="points-item-title">{{ order.hotelName }}</div>
                    <div class="points-item-meta">
                      <span>{{ order.roomType || '房型' }}</span>
                      <span class="meta-sep">·</span>
                      <span>{{ formatDate(order.startDate) }} → {{ formatDate(order.endDate) }}</span>
                      <span class="meta-sep">·</span>
                      <span>订单号：{{ order.orderNo }}</span>
                    </div>
                    <div class="points-item-time">完成时间：{{ order.updateTime || order.payTime || '-' }}</div>
                  </div>
                </div>
                <div class="points-item-right">
                  <div class="points-item-amount">
                    <span class="amount-label">消费</span>
                    <span class="amount-value">¥{{ order.totalPrice }}</span>
                  </div>
                  <div class="points-item-earned">
                    <span class="earned-icon">🎁</span>
                    <span class="earned-value">+{{ calcPoints(order.totalPrice) }}</span>
                    <span class="earned-label">积分</span>
                  </div>
                </div>
              </div>
            </template>

            <div v-else class="empty-state">
              <span class="empty-icon">🎁</span>
              <p>暂无积分记录</p>
              <p class="empty-hint">完成订单后即可获得积分</p>
              <button class="go-book-btn" @click="goToHotelList">去预订酒店 →</button>
            </div>
          </div>

          <!-- 积分汇总 -->
          <div v-if="completedOrders.length > 0" class="points-summary">
            <div class="summary-card">
              <span class="summary-label">累计完成订单</span>
              <span class="summary-value">{{ completedOrders.length }} 笔</span>
            </div>
            <div class="summary-card">
              <span class="summary-label">累计消费金额</span>
              <span class="summary-value">¥{{ totalSpent.toLocaleString() }}</span>
            </div>
            <div class="summary-card highlight">
              <span class="summary-label">累计获得积分</span>
              <span class="summary-value">{{ userPoints.toLocaleString() }}</span>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrap" v-if="total > pageSize">
            <el-pagination
              v-model:current-page="pageNum"
              :page-size="pageSize"
              :total="total"
              layout="prev, pager, next"
              @current-change="loadCompletedOrders"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="MyPoints">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'
import { getToken } from '@/utils/auth'
import { listMyOrders, getUserDashboardStats } from '@/api/front/userHome'

const router = useRouter()
const userStore = useUserStore()

const isLoggedIn = computed(() => !!getToken())
const userName = computed(() => userStore.nickName || userStore.name || '用户')
const userAvatar = computed(() => (userStore.nickName || userStore.name || '用户').charAt(0).toUpperCase())
const isAdmin = computed(() => userStore.roles?.some(r => r === 'admin' || r === 'ROLE_ADMIN'))
const isMerchant = computed(() => userStore.roles?.some(r => r === 'merchant' || r === 'ROLE_MERCHANT'))

const loading = ref(false)
const userPoints = ref(0)
const completedOrders = ref([])
const pageNum = ref(1)
const pageSize = ref(5)
const total = ref(0)

const totalSpent = computed(() => {
  return completedOrders.value.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0)
})

function formatDate(date) {
  if (!date) return '-'
  if (typeof date === 'string') return date.substring(0, 10)
  return new Date(date).toISOString().substring(0, 10)
}

function calcPoints(totalPrice) {
  if (!totalPrice) return 0
  return Math.floor(Number(totalPrice))
}

function goHome() { router.push('/home') }
function goToLogin() { router.push('/login') }
function goToHotelList() { router.push('/search') }

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
    router.push('/index')
    location.reload()
  })
}

async function loadPoints() {
  try {
    const res = await getUserDashboardStats()
    const data = res.data || res
    if (data) {
      userPoints.value = data.points || 0
    }
  } catch { /* ignore */ }
}

async function loadCompletedOrders() {
  loading.value = true
  try {
    // 只查询已完成的订单（status=3）
    const res = await listMyOrders({ pageNum: pageNum.value, pageSize: pageSize.value, status: '3' })
    const data = res.data || res
    const list = data.rows || res.rows || []
    completedOrders.value = list
    total.value = data.total || res.total || list.length
  } catch {
    completedOrders.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  loadPoints()
  loadCompletedOrders()
})
</script>

<style scoped>
.my-points-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* ==================== 头部 ==================== */
.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.header-content {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
}
.logo { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.logo-icon { font-size: 24px; }
.logo-text { font-size: 20px; font-weight: 700; color: #333; }
.nav { display: flex; gap: 32px; }
.nav-item { text-decoration: none; color: #666; font-size: 14px; transition: color 0.3s; cursor: pointer; }
.nav-item:hover, .nav-item.active { color: #ff6b6b; }
.user-actions { display: flex; gap: 12px; align-items: center; }
.user-dropdown { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 12px; border-radius: 20px; }
.user-dropdown:hover { background: rgba(0,0,0,0.05); }
.user-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; }
.user-name { font-size: 14px; color: #333; }
.action-btn { padding: 8px 20px; border: 1px solid #ddd; border-radius: 20px; background: #fff; color: #666; font-size: 14px; cursor: pointer; }
.action-btn.primary { background: linear-gradient(135deg, #ff6b6b, #ee5a24); border-color: transparent; color: #fff; }

.page-body { padding-top: 80px; }

/* ==================== 积分英雄区 ==================== */
.points-hero {
  position: relative;
  background: linear-gradient(135deg, #fef3c7, #fde68a, #fbbf24);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 40px;
  box-shadow: 0 8px 32px rgba(251, 191, 36, 0.25);
}
.points-hero-bg {
  position: absolute;
  top: -20px; right: -20px;
  width: 160px; height: 160px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
}
.points-hero-content {
  position: relative;
  display: flex; align-items: center; gap: 32px;
  padding: 36px 40px;
  flex-wrap: wrap;
}
.points-hero-icon { font-size: 56px; }
.points-hero-info { display: flex; flex-direction: column; gap: 4px; }
.points-hero-label { font-size: 14px; color: #92400e; font-weight: 500; }
.points-hero-value { font-size: 52px; font-weight: 800; color: #78350f; line-height: 1; }
.points-hero-rule {
  margin-left: auto;
  display: flex; flex-direction: column; gap: 6px;
  font-size: 13px; color: #92400e;
  text-align: right;
}
.points-hero-rule strong { color: #78350f; }

/* ==================== 积分明细 ==================== */
.points-detail-section { background: #fff; border-radius: 16px; padding: 30px; }
.section-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 24px; }
.section-title { font-size: 20px; font-weight: 700; color: #333; margin: 0; }
.section-subtitle { font-size: 13px; color: #999; }
.points-list { min-height: 200px; }

.points-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 0; border-bottom: 1px solid #f0f0f0;
  gap: 16px;
}
.points-item:last-child { border-bottom: none; }

.points-item-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
.points-item-icon { font-size: 28px; flex-shrink: 0; }
.points-item-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.points-item-title { font-size: 15px; font-weight: 600; color: #333; }
.points-item-meta { font-size: 12px; color: #999; display: flex; flex-wrap: wrap; gap: 4px; }
.meta-sep { color: #ccc; }
.points-item-time { font-size: 11px; color: #bbb; }

.points-item-right {
  display: flex; align-items: center; gap: 20px; flex-shrink: 0;
}
.points-item-amount { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.amount-label { font-size: 11px; color: #999; }
.amount-value { font-size: 16px; font-weight: 600; color: #666; }
.points-item-earned {
  display: flex; align-items: center; gap: 6px;
  background: #f0fdf4; padding: 8px 16px; border-radius: 12px;
}
.earned-icon { font-size: 18px; }
.earned-value { font-size: 20px; font-weight: 700; color: #22c55e; }
.earned-label { font-size: 12px; color: #16a34a; }

/* ==================== 积分汇总 ==================== */
.points-summary {
  display: flex; gap: 16px; margin-top: 24px; padding-top: 24px;
  border-top: 2px solid #f0f0f0;
}
.summary-card {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  gap: 6px; padding: 16px; background: #f9fafb; border-radius: 12px;
}
.summary-card.highlight { background: #f0fdf4; }
.summary-label { font-size: 12px; color: #999; }
.summary-value { font-size: 22px; font-weight: 700; color: #333; }
.summary-card.highlight .summary-value { color: #22c55e; }

/* ==================== 空状态 ==================== */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 60px 20px; color: #999;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state p { font-size: 15px; margin-bottom: 8px; }
.empty-hint { font-size: 13px !important; color: #bbb; margin-bottom: 20px !important; }
.go-book-btn {
  padding: 10px 28px; border: none;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff; font-size: 14px; font-weight: 600;
  border-radius: 25px; cursor: pointer; transition: all 0.3s;
}
.go-book-btn:hover { opacity: 0.9; transform: translateY(-1px); }

.pagination-wrap { display: flex; justify-content: center; margin-top: 24px; }

@media (max-width: 768px) {
  .points-hero-content { flex-direction: column; text-align: center; }
  .points-hero-rule { margin-left: 0; text-align: center; }
  .points-item { flex-direction: column; align-items: flex-start; }
  .points-item-right { width: 100%; justify-content: space-between; }
  .points-summary { flex-direction: column; }
}
</style>
