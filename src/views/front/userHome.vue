<template>
  <div class="user-home-page">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <span class="logo-icon">🏨</span>
          <span class="logo-text">ZSC酒店预订</span>
        </div>
        <nav class="nav">
          <a href="/home" class="nav-item active">首页</a>
          <a href="/search" class="nav-item">酒店</a>
          <a href="#" class="nav-item" @click.prevent="scrollToSection('orders')">我的订单</a>
          <a href="#" class="nav-item" @click.prevent="scrollToSection('reviews')">我的评价</a>
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
            <button class="action-btn primary">注册</button>
          </template>
        </div>
      </div>
    </header>

    <!-- 搜索区域 -->
    <section class="hero-section">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-welcome" v-if="isLoggedIn">
          <span>👋 欢迎回来，{{ userName }}</span>
        </div>
        <h1 class="hero-title">发现美好酒店</h1>
        <p class="hero-subtitle">为您精选全球优质酒店，开启完美旅程</p>

        <div class="search-panel">
          <!-- 上框：目的地 + 日期 -->
          <div class="search-row top">
            <div class="search-field field-dest">
              <label class="field-label">目的地</label>
              <div class="search-input-wrapper">
                <input
                  ref="destinationInput"
                  v-model="searchForm.destination"
                  type="text"
                  placeholder="输入目的地或酒店名称"
                  class="search-input"
                  @input="handleSuggestionInput"
                  @focus="showSuggestions = true"
                  @keyup.enter="handleSearch"
                />
                <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
                  <div
                    v-for="item in suggestions"
                    :key="item.id"
                    class="suggestion-item"
                    @mousedown.prevent="selectSuggestion(item)"
                  >
                    <span class="suggestion-icon">📍</span>
                    <div class="suggestion-info">
                      <span class="suggestion-name">{{ item.name }}</span>
                      <span class="suggestion-desc">{{ item.type === 'city' ? '城市' : '酒店' }} · {{ item.count }}家酒店</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="search-divider-v"></div>
            <div class="search-field field-date">
              <label class="field-label">入住 / 退房</label>
              <div class="date-range-wrap">
                <el-date-picker
                  v-model="searchForm.dates"
                  type="daterange"
                  range-separator=""
                  start-placeholder="入住日期"
                  end-placeholder="退房日期"
                  class="date-range-picker"
                  :shortcuts="dateShortcuts"
                  value-format="YYYY-MM-DD"
                  @change="onDateChange"
                />
                <span v-if="nightCount > 0" class="nights-badge">{{ nightCount }}晚</span>
              </div>
            </div>
          </div>

          <!-- 下框：房间 + 星级 + 关键词 + 搜索按钮 -->
          <div class="search-row bottom">
            <div class="search-field field-rooms">
              <label class="field-label">房间</label>
              <el-select v-model="searchForm.rooms" class="plain-select" placeholder="房间数">
                <el-option label="1间" :value="1" />
                <el-option label="2间" :value="2" />
                <el-option label="3间" :value="3" />
                <el-option label="4间" :value="4" />
                <el-option label="5间+" :value="5" />
              </el-select>
            </div>
            <div class="search-divider-v"></div>
            <div class="search-field field-guests">
              <label class="field-label">住客</label>
              <el-select v-model="searchForm.guests" class="plain-select" placeholder="住客人数">
                <el-option label="1人" :value="1" />
                <el-option label="2人" :value="2" />
                <el-option label="3人" :value="3" />
                <el-option label="4人" :value="4" />
                <el-option label="5人及以上" :value="5" />
              </el-select>
            </div>
            <div class="search-divider-v"></div>
            <div class="search-field field-star">
              <label class="field-label">酒店级别</label>
              <el-select v-model="searchForm.starLevel" class="plain-select" placeholder="不限">
                <el-option label="不限" :value="''" />
                <el-option label="二星及以下" value="2" />
                <el-option label="三星" value="3" />
                <el-option label="四星" value="4" />
                <el-option label="五星/豪华" value="5" />
              </el-select>
            </div>
            <div class="search-divider-v"></div>
            <div class="search-field field-keyword">
              <label class="field-label">关键词</label>
              <input
                v-model="searchForm.keyword"
                type="text"
                placeholder="如：海景、亲子"
                class="search-input"
                @keyup.enter="handleSearch"
              />
            </div>
            <button class="search-btn-inline" @click="handleSearch">
              🔍 搜索
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 用户数据概览 -->
    <section class="stats-section" v-if="isLoggedIn">
      <div class="container">
        <div class="stats-cards">
          <div class="stat-card" @click="goToOrders">
            <div class="stat-icon-box" style="background: #eef2ff;">
              <span>📋</span>
            </div>
            <div class="stat-body">
              <span class="stat-number">{{ stats.orderCount }}</span>
              <span class="stat-label">我的订单</span>
            </div>
            <span class="stat-arrow">→</span>
          </div>
          <div class="stat-card" @click="goToReviews">
            <div class="stat-icon-box" style="background: #fff7ed;">
              <span>⭐</span>
            </div>
            <div class="stat-body">
              <span class="stat-number">{{ stats.reviewCount }}</span>
              <span class="stat-label">我的评价</span>
            </div>
            <span class="stat-arrow">→</span>
          </div>
          <div class="stat-card" @click="goToFavorites">
            <div class="stat-icon-box" style="background: #fef2f2;">
              <span>❤️</span>
            </div>
            <div class="stat-body">
              <span class="stat-number">{{ stats.favoriteCount }}</span>
              <span class="stat-label">我的收藏</span>
            </div>
            <span class="stat-arrow">→</span>
          </div>
          <div class="stat-card" @click="goToPoints">
            <div class="stat-icon-box" style="background: #f0fdf4;">
              <span>🎁</span>
            </div>
            <div class="stat-body">
              <span class="stat-number">{{ stats.points || 0 }}</span>
              <span class="stat-label">我的积分</span>
            </div>
            <span class="stat-arrow">→</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 最近订单 -->
    <section class="orders-section" id="orders" v-if="isLoggedIn">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">最近订单</h2>
          <a href="#" class="view-all" @click.prevent="goToOrders">查看全部 →</a>
        </div>
        <div v-if="recentOrders.length > 0" class="order-list">
          <div v-for="order in recentOrders" :key="order.id" class="order-card">
            <div class="order-img">
              <img :src="order.hotelImage || defaultHotelImg" alt="酒店" />
            </div>
            <div class="order-info">
              <div class="order-top">
                <h3>{{ order.hotelName }}</h3>
                <el-tag :type="getOrderStatusType(order.status)" size="small">
                  {{ getOrderStatusText(order.status) }}
                </el-tag>
              </div>
              <p class="order-detail">{{ order.roomType || '房型信息' }}</p>
              <p class="order-dates">
                📅 {{ formatOrderDate(order.startDate) }} → {{ formatOrderDate(order.endDate) }}（{{ calcOrderNights(order) }}晚）
              </p>
              <p v-if="order.status === '3'" class="order-points-info">
                🎁 已获得 <strong>{{ calcOrderPoints(order.totalPrice) }}</strong> 积分
              </p>
            </div>
            <div class="order-right">
              <div class="order-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ order.totalPrice }}</span>
              </div>
              <button
                v-if="order.status === '1'"
                class="order-btn primary"
                @click="goToOrderDetail(order.id)"
              >查看详情</button>
              <button
                v-if="order.status === '3' && !order.reviewed"
                class="order-btn review"
                @click="goToWriteReview(order)"
              >去评价</button>
              <button
                v-else-if="order.status === '3' && order.reviewed"
                class="order-btn reviewed"
                disabled
              >已评价</button>
              <button
                v-if="order.status === '0'"
                class="order-btn primary"
                @click="handlePayOrder(order)"
              >去支付</button>
              <button
                v-if="order.status === '0'"
                class="order-btn cancel"
                @click="handleCancelOrder(order.id)"
              >取消</button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <span class="empty-icon">📋</span>
          <p>暂无订单记录</p>
          <a href="#" @click.prevent="goToHotelList">去预订酒店 →</a>
        </div>
      </div>
    </section>

    <!-- 最近评价 -->
    <section class="reviews-section" id="reviews" v-if="isLoggedIn">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">最近评价</h2>
          <a href="#" class="view-all" @click.prevent="goToReviews">查看全部 →</a>
        </div>
        <div v-if="recentReviews.length > 0" class="review-list">
          <div v-for="review in recentReviews" :key="review.id" class="review-card">
            <div class="review-img">
              <img :src="review.hotelImage || defaultHotelImg" alt="酒店" />
            </div>
            <div class="review-content">
              <div class="review-top">
                <h3>{{ review.hotelName }}</h3>
                <el-rate v-model="review.score" disabled show-score text-color="#ff9900" size="small" />
              </div>
              <p class="review-text">"{{ review.content }}"</p>
              <div class="review-meta">
                <span>{{ review.createTime }}</span>
                <span>👍 {{ review.likeCount || 0 }}</span>
                <el-tag v-if="review.replyContent" type="success" size="small">商家已回复</el-tag>
              </div>
              <div v-if="review.replyContent" class="review-reply">
                <span class="reply-label">商家回复：</span>{{ review.replyContent }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <span class="empty-icon">💬</span>
          <p>暂无评价记录</p>
          <a href="#" @click.prevent="goToOrders">去订单中写评价 →</a>
        </div>
      </div>
    </section>

    <!-- 热门城市 -->
    <section class="hot-cities-section">
      <div class="container">
        <h2 class="section-title">热门城市</h2>
        <p class="section-subtitle">不同城市，总有你喜欢的酒店</p>
        <div class="city-list">
          <div
            v-for="city in hotCities"
            :key="city.name"
            class="city-item"
            @click="searchByCity(city.name)"
          >
            <div class="city-image">
              <img :src="city.image" :alt="city.name" />
              <div class="city-overlay"></div>
            </div>
            <div class="city-info">
              <h3>{{ city.name }}</h3>
              <p>{{ city.hotelCount }}家酒店</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 酒店推荐 -->
    <section class="hotel-section" id="recommend">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">酒店推荐</h2>
          <div class="section-tabs">
            <button
              v-for="tab in hotelTabs"
              :key="tab.key"
              :class="['tab-btn', { active: activeHotelTab === tab.key }]"
              @click="switchHotelTab(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>
          <a href="#" class="view-all" @click.prevent="goToHotelList">查看全部 →</a>
        </div>
        <div class="hotel-list">
          <HotelCard
            v-for="hotel in hotels"
            :key="hotel.id"
            :hotel="hotel"
            @click="goToHotelDetail(hotel.id)"
          />
        </div>
      </div>
    </section>

    <!-- 猜你喜欢 -->
    <section class="personal-section" v-if="isLoggedIn && personalHotels.length > 0">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">猜你喜欢</h2>
          <p class="section-subtitle" style="margin-bottom:0">根据偏好为你推荐</p>
          <a href="#" class="view-all" @click.prevent="refreshPersonalRecommend">🔄 换一批</a>
        </div>
        <div class="hotel-list">
          <HotelCard
            v-for="hotel in personalHotels"
            :key="'p-' + hotel.id"
            :hotel="hotel"
            @click="goToHotelDetail(hotel.id)"
          />
        </div>
      </div>
    </section>

    <!-- 服务保障 -->
    <section class="services-section">
      <div class="container">
        <div class="service-list">
          <div class="service-item">
            <span class="service-icon">🛡️</span>
            <h3>入住保障</h3>
            <p>无忧取消保障</p>
          </div>
          <div class="service-item">
            <span class="service-icon">🎧</span>
            <h3>专业客服</h3>
            <p>全天客服在线</p>
          </div>
          <div class="service-item">
            <span class="service-icon">🚨</span>
            <h3>应急支援</h3>
            <p>紧急情况援助</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <span class="logo-icon">🏨</span>
            <span class="logo-text">ZSC酒店预订</span>
          </div>
          <div class="footer-links">
            <h4>关于我们</h4>
            <ul>
              <li><a href="#">公司简介</a></li>
              <li><a href="#">联系我们</a></li>
              <li><a href="#">加入我们</a></li>
            </ul>
          </div>
          <div class="footer-links">
            <h4>帮助中心</h4>
            <ul>
              <li><a href="#">常见问题</a></li>
              <li><a href="#">预订指南</a></li>
              <li><a href="#">退款政策</a></li>
            </ul>
          </div>
          <div class="footer-links">
            <h4>商务合作</h4>
            <ul>
              <li><a href="#">酒店加盟</a></li>
              <li><a href="#">企业合作</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 ZSC酒店预订. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <!-- 回到顶部 -->
    <transition name="fade">
      <div v-show="showBackTop" class="back-to-top" @click="scrollToTop">
        <span>⬆</span>
      </div>
    </transition>
  </div>
</template>

<script setup name="UserHome">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import HotelCard from '@/components/HotelCard.vue'
import { getHotCities, getRecommendHotels } from '@/api/front/hotel'
import {
  listMyOrders, cancelOrder,
  getUserDashboardStats, getPersonalRecommend,
  initiatePay, confirmPay
} from '@/api/front/userHome'
import { listMyComments } from '@/api/biz/comment'
import useUserStore from '@/store/modules/user'
import { getToken } from '@/utils/auth'

const router = useRouter()
const userStore = useUserStore()

// 搜索
const searchForm = ref({
  destination: '',
  dates: null,
  rooms: 1,
  guests: 2,
  starLevel: '',
  keyword: ''
})

const destinationInput = ref(null)
const showSuggestions = ref(false)
const suggestions = ref([])

// 自动计算入住晚数
const nightCount = computed(() => {
  const d = searchForm.value.dates
  if (d && d.length === 2 && d[0] && d[1]) {
    const diff = new Date(d[1]).getTime() - new Date(d[0]).getTime()
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
  }
  return 0
})

const dateShortcuts = [
  { text: '本周末', value: () => { const d = new Date(); d.setDate(d.getDate() + (6 - d.getDay())); return [d, new Date(d.getTime() + 86400000)] } },
  { text: '下周', value: () => { const d = new Date(); d.setDate(d.getDate() + 7); return [d, new Date(d.getTime() + 6 * 86400000)] } },
  { text: '下个月', value: () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return [d, new Date(d.getTime() + 6 * 86400000)] } },
]

// 数据
const stats = ref({ orderCount: 0, activeOrders: 0, reviewCount: 0, pendingReviews: 0, favoriteCount: 0, points: 0 })
const recentOrders = ref([])
const recentReviews = ref([])
const hotCities = ref([])
const activeHotelTab = ref('recommend')
const hotelTabs = [
  { key: 'recommend', label: '推荐' },
  { key: 'hot', label: '热门' },
  { key: 'luxury', label: '高档' },
  { key: 'budget', label: '经济型' }
]
const hotels = ref([])
const personalHotels = ref([])

const defaultHotelImg = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop'
const unreadCount = ref(0)
const showBackTop = ref(false)

// 计算属性
const isLoggedIn = computed(() => !!getToken())
const userName = computed(() => userStore.nickName || userStore.name || '用户')
const userAvatar = computed(() => (userStore.nickName || userStore.name || '用户').charAt(0).toUpperCase())
const isAdmin = computed(() => userStore.roles?.some(r => r === 'admin' || r === 'ROLE_ADMIN'))
const isMerchant = computed(() => userStore.roles?.some(r => r === 'merchant' || r === 'ROLE_MERCHANT'))

// 导航
function handleUserCommand(command) {
  switch (command) {
    case 'profile': router.push('/user/profile'); break
    case 'orders': router.push('/user/profile/orders'); break
    case 'points': router.push('/user/profile/points'); break
    case 'reviews': router.push('/user/myComments'); break
    case 'favorites': router.push('/user/profile/favorites'); break
    case 'console': router.push('/dashboard'); break
    case 'logout': logout(); break
  }
}

function goToLogin() { router.push('/login') }
function goHome() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

function logout() {
  userStore.logOut().then(() => {
    ElMessage.success('退出登录成功')
    window.location.href = '/index'
  })
}

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

// 搜索
function handleSuggestionInput() {
  const kw = searchForm.value.destination?.trim()
  if (!kw) { suggestions.value = []; showSuggestions.value = false; return }
  suggestions.value = [
    { id: 1, name: kw + '（城市）', type: 'city', count: 1280 },
    { id: 2, name: kw + '大酒店', type: 'hotel', count: 1 },
    { id: 3, name: kw + '希尔顿酒店', type: 'hotel', count: 1 },
    { id: 4, name: kw + '国际酒店', type: 'hotel', count: 1 },
  ]
  showSuggestions.value = true
}

function selectSuggestion(item) {
  searchForm.value.destination = item.name
  showSuggestions.value = false
  handleSearch()
}

function searchByCity(name) {
  searchForm.value.destination = name
  handleSearch()
}

function onDateChange() {
  // 日期变更时 nightCount 自动重新计算
}

function handleSearch() {
  const q = {
    destination: searchForm.value.destination || undefined,
    checkIn: searchForm.value.dates?.[0] || undefined,
    checkOut: searchForm.value.dates?.[1] || undefined,
    rooms: searchForm.value.rooms,
    guests: searchForm.value.guests,
    starLevel: searchForm.value.starLevel || undefined,
    keyword: searchForm.value.keyword || undefined
  }
  router.push({ path: '/search', query: q })
}

function switchHotelTab(key) { activeHotelTab.value = key; loadHotels() }
function goToHotelDetail(id) { router.push('/hotel/' + id) }
function goToHotelList() { router.push('/search') }

// 订单 / 评价 / 收藏
function getOrderStatusType(s) {
  const m = { '0': 'warning', '1': '', '2': 'info', '3': 'success', '4': 'danger', '5': 'info', '6': 'danger' }
  return m[s] || 'info'
}
function getOrderStatusText(s) {
  const m = { '0': '待支付', '1': '已支付', '2': '已取消', '3': '已完成', '4': '退款中', '5': '已退款', '6': '退款驳回' }
  return m[s] || s
}

function formatOrderDate(date) {
  if (!date) return '-'
  if (typeof date === 'string') return date.substring(0, 10)
  return new Date(date).toISOString().substring(0, 10)
}

function calcOrderNights(order) {
  if (!order.startDate || !order.endDate) return 0
  const start = new Date(order.startDate)
  const end = new Date(order.endDate)
  const diff = end.getTime() - start.getTime()
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
}

function calcOrderPoints(totalPrice) {
  if (!totalPrice) return 0
  return Math.floor(Number(totalPrice))
}
function goToOrders() { router.push('/user/profile/orders') }
function goToPoints() { router.push('/user/profile/points') }
function goToOrderDetail(id) { router.push('/user/order/' + id) }
function goToWriteReview(order) {
  router.push({ path: '/user/comment/write', query: {
    orderId: order.id,
    hotelId: order.hotelId || undefined,
    hotelName: order.hotelName || undefined,
    hotelImage: order.hotelImage || undefined,
    roomType: order.roomType || undefined,
    roomId: order.roomId || undefined,
    checkInDate: order.checkInDate || undefined,
    checkOutDate: order.checkOutDate || undefined
  }})
}
function goToReviews() { router.push('/user/myComments') }
function goToFavorites() { router.push('/user/profile/favorites') }
function goToNotifications() { router.push('/user/notifications') }
function refreshPersonalRecommend() { loadPersonalRecommend() }

async function handleCancelOrder(orderId) {
  try {
    await ElMessageBox.confirm('确定要取消这个订单吗？', '取消订单', {
      confirmButtonText: '确定取消', cancelButtonText: '再想想', type: 'warning'
    })
    await cancelOrder(orderId)
    ElMessage.success('订单已取消')
    loadRecentOrders()
    loadStats()
  } catch { /* 用户取消 */ }
}

async function handlePayOrder(order) {
  try {
    await initiatePay(order.id)
    await ElMessageBox.confirm(
      `订单号：${order.orderNo}<br/>金额：¥${order.totalPrice}<br/><br/>确认支付？`,
      '微信支付',
      { confirmButtonText: '确认支付', cancelButtonText: '取消', type: 'info',
        dangerouslyUseHTMLString: true }
    )
    await confirmPay(order.id)
    ElMessage.success('支付成功！')
    loadRecentOrders()
    loadStats()
  } catch { /* 用户取消或失败 */ }
}

// ==================== 数据加载 ====================

async function loadStats() {
  if (!isLoggedIn.value) return
  try {
    const res = await getUserDashboardStats()
    // axios拦截器已解包: res = { code, data, msg }
    // data在 res.data 中（RuoYi AjaxResult格式）
    const body = res.data || res
    if (body) {
      stats.value = {
        orderCount: body.orderCount ?? stats.value.orderCount,
        activeOrders: body.activeOrders ?? stats.value.activeOrders,
        reviewCount: body.reviewCount ?? stats.value.reviewCount,
        pendingReviews: body.pendingReviews ?? stats.value.pendingReviews,
        favoriteCount: body.favoriteCount ?? stats.value.favoriteCount,
        points: body.points ?? stats.value.points
      }
    }
  } catch (e) {
    console.warn('获取首页统计失败，使用订单列表推算', e)
    // 降级：从订单列表推算
    try {
      const res = await listMyOrders({ pageNum: 1, pageSize: 100 })
      const list = res.data?.rows || res.rows || []
      stats.value.orderCount = list.length
      stats.value.activeOrders = list.filter(o => o.status === '0' || o.status === '1' || o.status === '4').length
      stats.value.points = res.data?.points ?? res.points ?? stats.value.points
    } catch { /* 忽略 */ }
  }
}

async function loadRecentOrders() {
  if (!isLoggedIn.value) return
  try {
    const res = await listMyOrders({ pageNum: 1, pageSize: 3 })
    // axios拦截器解包后: res = { code, data: { rows, total } }
    const list = res.data?.rows || res.rows || []
    recentOrders.value = list
  } catch (e) {
    console.warn('获取最近订单失败', e)
    recentOrders.value = []
  }
}

async function loadRecentReviews() {
  if (!isLoggedIn.value) return
  try {
    const res = await listMyComments({ pageNum: 1, pageSize: 3 })
    if (res.rows) recentReviews.value = res.rows
    else if (res.data?.rows) recentReviews.value = res.data.rows
  } catch {
    recentReviews.value = [
      { id: 2001, hotelName: '上海华尔道夫大酒店管理', hotelImage: 'https://images.unsplash.com/photo-1551882547-be7b2a60087d?w=200&h=150&fit=crop', score: 4.5, content: '非常棒的入住体验！酒店位置很好，步行到外滩只需要5分钟。房间非常干净整洁，床品舒适，早餐种类丰富。前台服务态度很好，下次还会选择这家酒店。', createTime: '2026-05-25', likeCount: 3, replyContent: '尊敬的客人，感谢您的入住与好评！我们很高兴您满意这次的住宿体验，期待您的再次光临。' },
      { id: 2002, hotelName: '广州丽思卡尔顿酒店', hotelImage: defaultHotelImg, score: 5, content: '五星好评！服务和设施都是一流的，游泳池和水疗中心特别棒。房间视野开阔，可以看到珠江夜景。下次来广州出差还会选择这里。', createTime: '2026-04-18', likeCount: 8, replyContent: null }
    ]
  }
}

async function loadHotCities() {
  try {
    const res = await getHotCities()
    if (res.data) hotCities.value = res.data
  } catch {
    hotCities.value = [
      { name: '北京', hotelCount: 2356, image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=300&h=200&fit=crop' },
      { name: '上海', hotelCount: 3120, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop' },
      { name: '广州', hotelCount: 1890, image: 'https://images.unsplash.com/photo-1559656914944-3d2426425947?w=300&h=200&fit=crop' },
      { name: '深圳', hotelCount: 1650, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=300&h=200&fit=crop' },
      { name: '成都', hotelCount: 1450, image: 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=300&h=200&fit=crop' },
      { name: '杭州', hotelCount: 1380, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop' }
    ]
  }
}

async function loadHotels() {
  try {
    const res = await getRecommendHotels()
    if (res.data) hotels.value = res.data
    else if (res.rows) hotels.value = res.rows
  } catch {
    hotels.value = [
      { id: 1, hotelName: '北京希尔顿酒店管理有限公司', address: '北京市东城区王府井大街1号', score: 4.9, reviewCount: 789, minPrice: 1280, coverImage: defaultHotelImg, tag: '高档', facilities: ['免费WiFi', '停车场', '游泳池', '健身房'] },
      { id: 2, hotelName: '上海华尔道夫大酒店管理', address: '上海市黄浦区中山东一路2号', score: 4.8, reviewCount: 654, minPrice: 1580, coverImage: 'https://images.unsplash.com/photo-1551882547-be7b2a60087d?w=200&h=150&fit=crop', tag: '奢华', facilities: ['免费WiFi', '停车场', 'SPA', '餐厅'] },
      { id: 3, hotelName: '广州丽思卡尔顿酒店', address: '广州市天河区珠江新城兴安路3号', score: 4.9, reviewCount: 890, minPrice: 1380, coverImage: defaultHotelImg, tag: '高档', facilities: ['免费WiFi', '停车场', '游泳池', '商务中心'] },
      { id: 4, hotelName: '深圳香格里拉酒店有限公司', address: '深圳市福田区中心四路1号', score: 4.7, reviewCount: 567, minPrice: 1180, coverImage: 'https://images.unsplash.com/photo-1551882547-be7b2a60087d?w=200&h=150&fit=crop', tag: '高档', facilities: ['免费WiFi', '停车场', '健身房', '餐厅'] }
    ]
  }
}

async function loadPersonalRecommend() {
  if (!isLoggedIn.value) return
  try {
    const res = await getPersonalRecommend()
    if (res.data) personalHotels.value = res.data
    else if (res.rows) personalHotels.value = res.rows
  } catch {
    personalHotels.value = [
      { id: 5, hotelName: '杭州西湖国宾馆有限公司', address: '杭州市西湖区杨公堤1号', score: 4.9, reviewCount: 1200, minPrice: 1680, coverImage: defaultHotelImg, tag: '奢华', facilities: ['免费WiFi', '停车场', '游泳池', '花园'] },
      { id: 6, hotelName: '成都尼依格罗酒店有限公司', address: '成都市锦江区红星路三段1号', score: 4.8, reviewCount: 720, minPrice: 1480, coverImage: 'https://images.unsplash.com/photo-1551882547-be7b2a60087d?w=200&h=150&fit=crop', tag: '高档', facilities: ['免费WiFi', '停车场', 'SPA', '健身房'] }
    ]
  }
}

// 点击外部关闭建议
function handleClickOutside(e) {
  if (destinationInput.value && !destinationInput.value.contains(e.target)) {
    showSuggestions.value = false
  }
}
function handleScroll() { showBackTop.value = window.scrollY > 500 }

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll)
  loadHotCities()
  loadHotels()
  if (isLoggedIn.value) {
    loadStats()
    loadRecentOrders()
    loadRecentReviews()
    loadPersonalRecommend()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* ==================== 页面基础 ==================== */
.user-home-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
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

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.logo-icon { font-size: 24px; }

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.nav {
  display: flex;
  gap: 32px;
}

.nav-item {
  text-decoration: none;
  color: #666;
  font-size: 14px;
  transition: color 0.3s;
}

.nav-item:hover,
.nav-item.active {
  color: #ff6b6b;
}

.user-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.notification-bell {
  position: relative;
  cursor: pointer;
  padding: 4px;
  margin-right: 4px;
}

.bell-icon { font-size: 18px; }

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ff6b6b;
  color: #fff;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 20px;
  transition: background 0.3s;
}

.user-dropdown:hover {
  background: rgba(0, 0, 0, 0.05);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  color: #333;
}

.user-dropdown :deep(.el-dropdown-menu__item) {
  font-size: 14px;
}

.action-btn {
  padding: 8px 20px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.action-btn.primary {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  border-color: transparent;
  color: #fff;
}

.action-btn.primary:hover {
  opacity: 0.9;
}

/* ==================== 英雄搜索区 ==================== */
.hero-section {
  position: relative;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-top: 64px;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop') center/cover;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #fff;
  max-width: 800px;
  padding: 0 20px;
}

.hero-welcome {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 20px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 16px;
  backdrop-filter: blur(4px);
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 40px;
}

/* ==================== 搜索面板（上下双框） ==================== */
.search-panel {
  max-width: 780px;
  margin: 0 auto;
}

.search-row {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 8px 6px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.search-row.top {
  border-radius: 16px 16px 0 0;
  margin-bottom: 2px;
}

.search-row.bottom {
  border-radius: 0 0 16px 16px;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 14px;
  flex: 1;
  min-width: 0;
}

.field-label {
  font-size: 11px;
  color: #999;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
  width: 100%;
  background: transparent;
}

.search-input::placeholder { color: #bbb; }

.search-divider-v {
  width: 1px;
  height: 48px;
  background: #eee;
  flex-shrink: 0;
}

/* 日期区域 */
.date-range-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range-picker {
  flex: 1;
  min-width: 180px;
}

.date-range-picker :deep(.el-input__wrapper) {
  box-shadow: none !important;
  padding: 0;
}

.date-range-picker :deep(.el-input__inner) {
  font-size: 15px;
}

.nights-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fef2f2;
  color: #ff6b6b;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* 下拉选择器 */
.plain-select {
  min-width: 90px;
}

.plain-select :deep(.el-input__wrapper) {
  box-shadow: none !important;
  padding: 0;
}

.plain-select :deep(.el-input__inner) {
  font-size: 15px;
}

/* 搜索建议 */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  width: 280px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 200;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.suggestion-item:hover { background: #f5f5f5; }

.suggestion-icon { font-size: 16px; }
.suggestion-name { font-size: 14px; color: #333; font-weight: 500; }
.suggestion-desc { font-size: 12px; color: #999; }

/* 搜索按钮（内嵌） */
.search-btn-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  border: none;
  padding: 0 32px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  height: 52px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: 4px;
}

.search-btn-inline:hover {
  opacity: 0.9;
}

/* ==================== 统计卡片 ==================== */
.stats-section {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.stats-section .container {
  padding-top: 28px;
  padding-bottom: 28px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  cursor: pointer;
  transition: all 0.25s;
  border-radius: 12px;
  border: 2px solid transparent;
}

.stat-card:nth-child(1) { border-color: #e0e7ff; }
.stat-card:nth-child(2) { border-color: #fed7aa; }
.stat-card:nth-child(3) { border-color: #fecaca; }
.stat-card:nth-child(4) { border-color: #bbf7d0; }

.stat-card:nth-child(1):hover { border-color: #a5b4fc; background: #fafafe; }
.stat-card:nth-child(2):hover { border-color: #fdba74; background: #fffcf8; }
.stat-card:nth-child(3):hover { border-color: #fca5a5; background: #fffafa; }
.stat-card:nth-child(4):hover { border-color: #86efac; background: #f8fdf9; }

.stat-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.stat-body {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 26px;
  font-weight: 700;
  color: #333;
  line-height: 1.1;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.stat-arrow {
  margin-left: auto;
  font-size: 16px;
  color: #ccc;
  transition: all 0.25s;
}

.stat-card:hover .stat-arrow {
  color: #ff6b6b;
  transform: translateX(3px);
}

/* ==================== 区块标题 ==================== */
.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.section-subtitle {
  font-size: 14px;
  color: #999;
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.section-header .section-title {
  margin-bottom: 0;
}

.section-tabs {
  display: flex;
  gap: 16px;
}

.tab-btn {
  padding: 8px 20px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
}

.view-all {
  color: #ff6b6b;
  font-size: 14px;
  text-decoration: none;
}

/* ==================== 订单列表 ==================== */
.orders-section { background: #fff; }

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  transition: all 0.3s;
  gap: 20px;
}

.order-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.order-img {
  width: 140px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.order-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.order-info { flex: 1; }

.order-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.order-top h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.order-detail {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.order-dates {
  font-size: 13px;
  color: #999;
}

.order-points-info {
  font-size: 13px;
  color: #22c55e;
  margin-top: 2px;
}

.order-points-info strong {
  color: #16a34a;
  font-weight: 700;
}

.order-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.order-price { text-align: right; }

.price-symbol { font-size: 14px; color: #ff6b6b; font-weight: 600; }
.price-value { font-size: 24px; font-weight: 700; color: #ff6b6b; }

.order-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.order-btn.primary {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
}

.order-btn.primary:hover {
  background: #ff6b6b;
  color: #fff;
}

.order-btn.review {
  background: #fff7ed;
  color: #ea580c;
}

.order-btn.review:hover {
  background: #ea580c;
  color: #fff;
}

.order-btn.cancel {
  background: #eee;
  color: #999;
}

.order-btn.cancel:hover {
  background: #ef4444;
  color: #fff;
}

.order-btn.reviewed {
  background: #e8f5e9;
  color: #4caf50;
  cursor: default;
}

/* ==================== 评价列表 ==================== */
.reviews-section { background: #fff; }

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  display: flex;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  gap: 20px;
  transition: all 0.3s;
}

.review-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.review-img {
  width: 120px;
  height: 90px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.review-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.review-content { flex: 1; }

.review-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.review-top h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.review-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.review-reply {
  margin-top: 10px;
  padding: 10px 14px;
  background: #f0fdf4;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
}

.reply-label {
  font-weight: 600;
  color: #22c55e;
}

/* ==================== 空状态 ==================== */
.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: #999;
}

.empty-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 14px;
  margin-bottom: 12px;
}

.empty-state a {
  color: #ff6b6b;
  font-size: 13px;
  text-decoration: none;
}

.empty-state a:hover { text-decoration: underline; }

/* ==================== 城市网格 ==================== */
.city-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.city-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.city-item:hover {
  transform: translateY(-4px);
}

.city-image {
  position: relative;
  height: 180px;
}

.city-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.city-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}

.city-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  color: #fff;
}

.city-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.city-info p {
  font-size: 12px;
  opacity: 0.8;
}

/* ==================== 酒店列表 ==================== */
.hotel-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ==================== 猜你喜欢 ==================== */
.personal-section { background: #fff; }

/* ==================== 服务保障 ==================== */
.services-section { background: #fff; }

.service-list {
  display: flex;
  justify-content: center;
  gap: 100px;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.service-icon { font-size: 40px; }

.service-item h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.service-item p {
  font-size: 12px;
  color: #999;
}

/* ==================== 页脚 ==================== */
.footer {
  background: #333;
  color: #fff;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  padding: 40px 0;
  border-bottom: 1px solid #444;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-links h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

.footer-links ul {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: #999;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.3s;
}

.footer-links a:hover { color: #fff; }

.footer-bottom {
  padding: 20px 0;
  text-align: center;
  color: #666;
  font-size: 12px;
}

/* ==================== 回到顶部 ==================== */
.back-to-top {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
  z-index: 99;
  transition: all 0.3s;
}

.back-to-top:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 24px rgba(255, 107, 107, 0.5);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ==================== 响应式 ==================== */
@media (max-width: 1024px) {
  .stats-cards { grid-template-columns: repeat(2, 1fr); }
  .city-list { grid-template-columns: repeat(3, 1fr); }
  .service-list { gap: 60px; }
}

@media (max-width: 768px) {
  .stats-cards { grid-template-columns: 1fr 1fr; }
  .city-list { grid-template-columns: repeat(2, 1fr); }
  .order-card { flex-direction: column; align-items: flex-start; }
  .order-right { flex-direction: row; width: 100%; justify-content: space-between; align-items: center; }
  .review-card { flex-direction: column; }
  .footer-content { flex-direction: column; gap: 30px; }
  .service-list { flex-wrap: wrap; gap: 40px; }
  .search-row { flex-wrap: wrap; }
  .search-row.top { border-radius: 16px; margin-bottom: 2px; }
  .search-row.bottom { border-radius: 16px; }
  .search-divider-v { display: none; }
  .search-field { flex: 1 1 40%; min-width: 120px; }
  .search-btn-inline { width: 100%; margin-left: 0; margin-top: 4px; }
  .hero-title { font-size: 32px; }
  .nav { display: none; }
  .section-header { flex-direction: column; gap: 12px; align-items: flex-start; }
}
</style>
