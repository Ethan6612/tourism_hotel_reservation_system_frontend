<template>
  <div class="front-page">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🏨</span>
          <span class="logo-text">ZSC酒店预订</span>
        </div>
        <nav class="nav">
          <a href="/index" class="nav-item active">首页</a>
          <a href="/search" class="nav-item">酒店</a>
          <a href="#" class="nav-item">关于我们</a>
        </nav>
        <div class="user-actions">
          <template v-if="isLoggedIn">
            <el-dropdown 
              ref="userDropdown" 
              @command="handleUserCommand" 
              trigger="hover"
              @visible-change="handleDropdownVisibleChange"
            >
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
                  <el-dropdown-item command="merchant" v-if="isMerchant" divided>我的商户</el-dropdown-item>
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

    <!-- 搜索区域 -->
    <section class="hero-section">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <h1 class="hero-title">发现美好酒店</h1>
        <p class="hero-subtitle">为您精选全球优质酒店，开启完美旅程</p>
        
        <div class="search-wrapper">
          <div class="search-box">
            <div class="search-item">
              <span class="search-icon">📍</span>
              <input 
                v-model="searchForm.destination" 
                type="text" 
                placeholder="目的地" 
                class="search-input"
              />
            </div>
            <div class="search-divider"></div>
            <div class="search-item">
              <span class="search-icon">📅</span>
              <input 
                v-model="searchForm.checkIn" 
                type="date" 
                class="search-input date-input"
              />
              <span class="date-arrow">→</span>
              <input 
                v-model="searchForm.checkOut" 
                type="date" 
                class="search-input date-input"
              />
            </div>
            <div class="search-divider"></div>
            <div class="search-item">
              <span class="search-icon">👥</span>
              <select v-model="searchForm.guests" class="search-input select-input">
                <option value="1">1人</option>
                <option value="2">2人</option>
                <option value="3">3人</option>
                <option value="4">4人</option>
                <option value="5">5人及以上</option>
              </select>
            </div>
          </div>
          <button class="search-btn" @click="handleSearch">
            <span>🔍</span>
            <span>搜索</span>
          </button>
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
              <img :src="city.image" :alt="city.name" @error="e => e.target.src = defaultCityImage" />
              <div class="city-overlay"></div>
            </div>
            <div class="city-info">
              <h3>{{ city.name }}</h3>
              <p v-if="city.hotelCount > 0">{{ city.hotelCount }}家酒店</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 酒店推荐 -->
    <section class="hotel-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">酒店推荐</h2>
          <div class="section-tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.key" 
              :class="['tab-btn', { active: activeTab === tab.key }]"
              @click="switchTab(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>
          <a href="#" class="view-all">查看全部 →</a>
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

    <!-- 热销排行 -->
    <section class="hot-rank-section">
      <div class="container">
        <h2 class="section-title">🔥 热销排行</h2>
        <p class="section-subtitle">根据真实订单量排名，看看大家都在住哪里</p>
        <div class="hot-rank-grid">
          <div
            v-for="(item, index) in hotSalesRank"
            :key="item.id"
            class="hot-rank-card"
            @click="goToHotelDetail(item.id)"
          >
            <div class="hot-rank-num">{{ index + 1 }}</div>
            <div class="hot-rank-img">
              <img :src="item.imgUrl || defaultHotelImage" :alt="item.name" />
            </div>
            <div class="hot-rank-body">
              <h4>{{ item.name }}</h4>
              <div class="hot-rank-stars">{{ '★'.repeat(item.star || 0) }}</div>
              <div class="hot-rank-bottom">
                <span class="hot-rank-sales">已售{{ item.salesCount || 0 }}单</span>
                <span class="hot-rank-price" v-if="item.minPrice">¥{{ item.minPrice }}起</span>
              </div>
            </div>
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
  </div>
</template>

<script setup name="FrontIndex">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import HotelCard from '@/components/HotelCard.vue'
import { searchHotels, getHotCities, getRecommendHotels, getHotSalesRank } from '@/api/front/hotel'
import useUserStore from '@/store/modules/user'
import { getToken } from '@/utils/auth'

const router = useRouter()
const userStore = useUserStore()

const searchForm = ref({
  destination: '',
  checkIn: '',
  checkOut: '',
  guests: '2'
})

const hotCities = ref([])
const hotels = ref([])
const hotSalesRank = ref([])
const defaultHotelImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'
const defaultCityImage = 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=300&h=200&fit=crop'
const activeTab = ref('recommend')
const userDropdown = ref(null)

const tabs = [
  { key: 'recommend', label: '推荐' },
  { key: 'hot', label: '热门' },
  { key: 'luxury', label: '高档' },
  { key: 'budget', label: '经济型' }
]

const isLoggedIn = computed(() => !!getToken())

const userName = computed(() => userStore.nickName || userStore.name || '用户')

const userAvatar = computed(() => {
  const name = userStore.nickName || userStore.name || '用户'
  return name.charAt(0).toUpperCase()
})

const isAdmin = computed(() => {
  return userStore.roles && userStore.roles.some(role => role === 'admin' || role === 'ROLE_ADMIN')
})

const isMerchant = computed(() => {
  return userStore.roles && userStore.roles.some(role => role === 'merchant' || role === 'ROLE_MERCHANT')
})

function handleUserCommand(command) {
  switch (command) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'orders':
      router.push('/user/profile/orders')
      break
    case 'points':
      router.push('/user/profile/points')
      break
    case 'reviews':
      router.push('/user/myComments')
      break
    case 'favorites':
      router.push('/user/profile/favorites')
      break
    case 'merchant':
      router.push('/biz/merchant')
      break
    case 'console':
      router.push('/dashboard')
      break
    case 'logout':
      logout()
      break
  }
}

function handleDropdownVisibleChange(visible) {
  // 可以在这里添加额外的逻辑
  if (!visible && userDropdown.value) {
    // 下拉菜单关闭时的处理
  }
}

function goToLogin() {
  router.push('/login')
}

function goToRegister() {
  router.push('/register')
}

function logout() {
  userStore.logOut().then(() => {
    ElMessage.success('退出登录成功')
    window.location.href = '/index'
  })
}

function handleSearch() {
  console.log('搜索条件:', searchForm.value)
  // 跳转到搜索结果页面
  router.push({
    path: '/search',
    query: {
      keyword: searchForm.value.destination,
      checkIn: searchForm.value.checkIn,
      checkOut: searchForm.value.checkOut,
      guests: searchForm.value.guests
    }
  })
}

function searchByCity(cityName) {
  searchForm.value.destination = cityName
  // 直接跳转到搜索结果页
  router.push({
    path: '/search',
    query: {
      keyword: cityName,
      checkIn: searchForm.value.checkIn,
      checkOut: searchForm.value.checkOut,
      guests: searchForm.value.guests
    }
  })
}

function goToHotelDetail(hotelId) {
  console.log('查看酒店详情:', hotelId)
  // 跳转到酒店详情页
  router.push(`/hotel/${hotelId}`)
}

onMounted(() => {
  loadHotCities()
  loadHotels()
  loadHotSalesRank()
})

async function loadHotCities() {
  // 12 个种子城市默认列表，确保始终显示完整的 12 个城市
  const seedCities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '南京', '西安', '重庆', '武汉', '长沙', '厦门']
  const cityMap = new Map(seedCities.map(name => [name, { name, hotelCount: 0, image: defaultCityImage }]))

  try {
    const res = await getHotCities()
    const data = res.data || res
    const list = Array.isArray(data) ? data : (data?.rows || [])
    list.forEach(c => {
      const name = c.cityName || c.name
      if (cityMap.has(name)) {
        cityMap.set(name, {
          name,
          hotelCount: c.hotelCount ?? c.count ?? 0,
          image: c.imageUrl || c.image || c.img || c.pic || defaultCityImage
        })
      }
    })
  } catch (error) {
    console.error('加载热门城市失败:', error)
  }
  hotCities.value = Array.from(cityMap.values())
}

function switchTab(key) {
  activeTab.value = key
  loadHotels()
}

async function loadHotels() {
  try {
    const res = await getRecommendHotels({ type: activeTab.value })
    const data = res.data || res
    if (Array.isArray(data) && data.length > 0) {
      hotels.value = data
    } else if (data?.rows?.length) {
      hotels.value = data.rows
    } else {
      hotels.value = []
    }
  } catch (error) {
    console.error('加载推荐酒店失败:', error)
    hotels.value = []
  }
}

async function loadHotSalesRank() {
  try {
    const res = await getHotSalesRank()
    const data = res.data || res
    if (Array.isArray(data)) hotSalesRank.value = data
    else if (data && Array.isArray(data.rows)) hotSalesRank.value = data.rows
    else hotSalesRank.value = []
  } catch (error) {
    console.error('加载热销排行失败:', error)
    hotSalesRank.value = []
  }
}
</script>

<style scoped>
.front-page {
  min-height: 100vh;
  background: #f5f5f5;
}

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
}

.logo-icon {
  font-size: 24px;
}

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

.search-wrapper {
  display: flex;
  align-items: center;
  gap: -4px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 50px 0 0 50px;
  padding: 0 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  min-width: 750px;
  max-width: 850px;
  height: 60px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
}

.search-icon {
  font-size: 18px;
}

.search-input {
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
}

.date-input {
  width: 100px;
}

.select-input {
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background: transparent;
}

.date-arrow {
  color: #999;
  margin: 0 4px;
}

.search-divider {
  width: 1px;
  height: 30px;
  background: #eee;
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  border: none;
  padding: 0 40px;
  border-radius: 0 50px 50px 0;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 10px 10px 40px rgba(0, 0, 0, 0.2);
  height: 60px;
  box-sizing: border-box;
  min-width: 120px;
  flex-direction: row;
}

.search-btn span {
  display: inline-block;
  white-space: nowrap;
}

.search-btn:hover {
  opacity: 0.9;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

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

.hotel-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.services-section {
  background: #fff;
}

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

.service-icon {
  font-size: 40px;
}

.service-item h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.service-item p {
  font-size: 12px;
  color: #999;
}

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

.footer-links a:hover {
  color: #fff;
}

.footer-bottom {
  padding: 20px 0;
  text-align: center;
  color: #666;
  font-size: 12px;
}

/* ==================== 热销排行 ==================== */
.hot-rank-section {
  background: #fff;
}
.hot-rank-section .container {
  padding-top: 60px;
  padding-bottom: 60px;
}
.hot-rank-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.hot-rank-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s;
  border: 1px solid #f0f0f0;
  background: #fff;
}
.hot-rank-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}
.hot-rank-num {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #f0f0f0;
  color: #999;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hot-rank-card:nth-child(1) .hot-rank-num { background: #fef3c7; color: #d97706; }
.hot-rank-card:nth-child(2) .hot-rank-num { background: #e5e7eb; color: #6b7280; }
.hot-rank-card:nth-child(3) .hot-rank-num { background: #fed7aa; color: #c2410c; }

.hot-rank-img {
  width: 70px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}
.hot-rank-img img { width: 100%; height: 100%; object-fit: cover; }

.hot-rank-body { flex: 1; min-width: 0; }
.hot-rank-body h4 {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hot-rank-stars { color: #f59e0b; font-size: 11px; margin-bottom: 4px; }
.hot-rank-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.hot-rank-sales { font-size: 11px; color: #22c55e; }
.hot-rank-price { font-size: 13px; font-weight: 700; color: #ff6b6b; }

@media (max-width: 768px) {
  .hot-rank-grid { grid-template-columns: 1fr; }
}
</style>
