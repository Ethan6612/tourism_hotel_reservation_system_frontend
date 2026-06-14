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
          <a href="#" class="nav-item">攻略</a>
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
                  <el-dropdown-item command="merchant" v-if="isMerchant">我的商户</el-dropdown-item>
                  <el-dropdown-item command="console" v-if="isAdmin">前往控制台</el-dropdown-item>
                  <el-dropdown-item command="logout" :divided="isMerchant || isAdmin">退出登录</el-dropdown-item>
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
    <section class="hotel-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">酒店推荐</h2>
          <div class="section-tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.key" 
              :class="['tab-btn', { active: activeTab === tab.key }]"
              @click="activeTab = tab.key"
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
import { searchHotels, getHotCities, getRecommendHotels } from '@/api/front/hotel'
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
    case 'merchant':
      // ✅ 商户用户点击"我的商户"，跳转到评价管理页面
      router.push('/biz/comment')
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

function logout() {
  userStore.logOut().then(() => {
    ElMessage.success('退出登录成功')
    router.push('/index')
    location.reload()
  })
}

// 模拟热门城市数据
const mockCities = [
  { name: '北京', hotelCount: 2356, image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=300&h=200&fit=crop' },
  { name: '上海', hotelCount: 3120, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop' },
  { name: '广州', hotelCount: 1890, image: 'https://images.unsplash.com/photo-1559656914944-3d2426425947?w=300&h=200&fit=crop' },
  { name: '深圳', hotelCount: 1650, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=300&h=200&fit=crop' },
  { name: '成都', hotelCount: 1450, image: 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=300&h=200&fit=crop' },
  { name: '杭州', hotelCount: 1380, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop' }
]

// 模拟酒店数据
const mockHotels = [
  {
    id: 1,
    hotelName: '北京希尔顿酒店管理有限公司',
    address: '北京市东城区王府井大街1号',
    score: 4.9,
    reviewCount: 789,
    minPrice: 1280,
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop',
    tag: '高档',
    facilities: ['免费WiFi', '停车场', '游泳池', '健身房']
  },
  {
    id: 2,
    hotelName: '上海华尔道夫大酒店管理',
    address: '上海市黄浦区中山东一路2号',
    score: 4.8,
    reviewCount: 654,
    minPrice: 1580,
    coverImage: 'https://images.unsplash.com/photo-1551882547-be7b2a60087d?w=200&h=150&fit=crop',
    tag: '奢华',
    facilities: ['免费WiFi', '停车场', 'SPA', '餐厅']
  },
  {
    id: 3,
    hotelName: '广州丽思卡尔顿酒店',
    address: '广州市天河区珠江新城兴安路3号',
    score: 4.9,
    reviewCount: 890,
    minPrice: 1380,
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop',
    tag: '高档',
    facilities: ['免费WiFi', '停车场', '游泳池', '商务中心']
  },
  {
    id: 4,
    hotelName: '深圳香格里拉酒店有限公司',
    address: '深圳市福田区中心四路1号',
    score: 4.7,
    reviewCount: 567,
    minPrice: 1180,
    coverImage: 'https://images.unsplash.com/photo-1551882547-be7b2a60087d?w=200&h=150&fit=crop',
    tag: '高档',
    facilities: ['免费WiFi', '停车场', '健身房', '餐厅']
  },
  {
    id: 5,
    hotelName: '杭州西湖国宾馆有限公司',
    address: '杭州市西湖区杨公堤1号',
    score: 4.9,
    reviewCount: 1200,
    minPrice: 1680,
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop',
    tag: '奢华',
    facilities: ['免费WiFi', '停车场', '游泳池', '花园']
  },
  {
    id: 6,
    hotelName: '成都尼依格罗酒店有限公司',
    address: '成都市锦江区红星路三段1号',
    score: 4.8,
    reviewCount: 720,
    minPrice: 1480,
    coverImage: 'https://images.unsplash.com/photo-1551882547-be7b2a60087d?w=200&h=150&fit=crop',
    tag: '高档',
    facilities: ['免费WiFi', '停车场', 'SPA', '健身房']
  }
]

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
}

onMounted(() => {
  // 获取热门城市
  hotCities.value = mockCities
  
  // 获取推荐酒店
  hotels.value = mockHotels
})
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
</style>
