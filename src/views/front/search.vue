<template>
  <div class="search-page">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo" @click="goToHome">
          <span class="logo-icon">🏨</span>
          <span class="logo-text">ZSC酒店预订</span>
        </div>
        <nav class="nav">
          <a :href="isLoggedIn ? '/home' : '/index'" class="nav-item">首页</a>
          <a href="/search" class="nav-item active">酒店</a>
          <a v-if="isLoggedIn" href="#" class="nav-item" @click.prevent="router.push('/user/profile/orders')">我的订单</a>
          <a v-if="isLoggedIn" href="#" class="nav-item" @click.prevent="router.push('/user/myComments')">我的评价</a>
        </nav>
        <div class="user-actions">
          <template v-if="isLoggedIn">
            <div class="notification-bell" @click="goToNotifications">
              <span class="bell-icon">🔔</span>
            </div>
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

    <!-- 搜索栏 -->
    <section class="search-section">
      <div class="search-bar">
        <div class="search-item">
          <span class="search-icon">📍</span>
          <input
            v-model="searchForm.keyword"
            type="text"
            placeholder="目的地/酒店名称"
            class="search-input"
            @keyup.enter="handleSearch"
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
        <button class="search-btn" @click="handleSearch">
          <span>🔍</span>
          <span>搜索</span>
        </button>
      </div>
    </section>

    <!-- 主要内容区 -->
    <div class="main-content">
      <div class="container">
        <div class="content-wrapper">
          <!-- 左侧筛选面板 -->
          <aside class="filter-panel">
            <div class="filter-header">
              <h3>筛选</h3>
              <a href="#" class="reset-link" @click.prevent="resetFilters">重置</a>
            </div>

            <!-- 星级筛选 -->
            <div class="filter-group">
              <h4 class="filter-title">酒店星级</h4>
              <div class="filter-options">
                <label
                  v-for="star in starOptions"
                  :key="star.value"
                  class="filter-option"
                >
                  <input
                    type="checkbox"
                    v-model="filters.star"
                    :value="star.value"
                    @change="handleFilter"
                  />
                  <span class="checkbox-custom"></span>
                  <span class="option-label">
                    <span class="star-icons">{{ '★'.repeat(star.value) }}{{ '☆'.repeat(5 - star.value) }}</span>
                    <span class="star-text">{{ star.label }}</span>
                  </span>
                </label>
              </div>
            </div>

            <!-- 价格范围筛选 -->
            <div class="filter-group">
              <h4 class="filter-title">价格范围</h4>
              <div class="price-range">
                <input
                  v-model.number="filters.minPrice"
                  type="number"
                  placeholder="最低价"
                  class="price-input"
                  @change="handleFilter"
                />
                <span class="price-separator">-</span>
                <input
                  v-model.number="filters.maxPrice"
                  type="number"
                  placeholder="最高价"
                  class="price-input"
                  @change="handleFilter"
                />
              </div>
              <div class="price-tags">
                <span
                  v-for="price in priceOptions"
                  :key="price.label"
                  class="price-tag"
                  :class="{ active: isPriceActive(price) }"
                  @click="selectPriceRange(price)"
                >
                  {{ price.label }}
                </span>
              </div>
            </div>

            <!-- 评分筛选 -->
            <div class="filter-group">
              <h4 class="filter-title">用户评分</h4>
              <div class="filter-options">
                <label
                  v-for="score in scoreOptions"
                  :key="score.value"
                  class="filter-option"
                >
                  <input
                    type="radio"
                    v-model="filters.minScore"
                    :value="score.value"
                    name="score"
                    @change="handleFilter"
                  />
                  <span class="radio-custom"></span>
                  <span class="option-label">{{ score.label }}</span>
                </label>
              </div>
            </div>

            <!-- 设施筛选 -->
            <div class="filter-group">
              <h4 class="filter-title">酒店设施</h4>
              <div class="filter-options">
                <label
                  v-for="facility in facilityOptions"
                  :key="facility"
                  class="filter-option"
                >
                  <input
                    type="checkbox"
                    v-model="filters.facilities"
                    :value="facility"
                    @change="handleFilter"
                  />
                  <span class="checkbox-custom"></span>
                  <span class="option-label">{{ facility }}</span>
                </label>
              </div>
            </div>

            <!-- 酒店类型 -->
            <div class="filter-group">
              <h4 class="filter-title">酒店类型</h4>
              <div class="filter-options">
                <label
                  v-for="type in typeOptions"
                  :key="type"
                  class="filter-option"
                >
                  <input
                    type="checkbox"
                    v-model="filters.types"
                    :value="type"
                    @change="handleFilter"
                  />
                  <span class="checkbox-custom"></span>
                  <span class="option-label">{{ type }}</span>
                </label>
              </div>
            </div>
          </aside>

          <!-- 右侧搜索结果 -->
          <main class="search-results">
            <!-- 结果头部 -->
            <div class="results-header">
              <div class="results-info">
                <span class="results-count">共找到 <strong>{{ total }}</strong> 家酒店</span>
                <span v-if="searchForm.keyword" class="search-keyword">关键词：{{ searchForm.keyword }}</span>
              </div>
              <div class="sort-options">
                <span class="sort-label">排序：</span>
                <button
                  v-for="sort in sortOptions"
                  :key="sort.value"
                  class="sort-btn"
                  :class="{ active: currentSort === sort.value }"
                  @click="handleSort(sort.value)"
                >
                  {{ sort.label }}
                </button>
              </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <span>正在搜索...</span>
            </div>

            <!-- 无结果状态 -->
            <div v-else-if="hotels.length === 0" class="empty-state">
              <span class="empty-icon">🏨</span>
              <h3>未找到符合条件的酒店</h3>
              <p>请尝试调整筛选条件或搜索关键词</p>
              <button class="reset-btn" @click="resetFilters">重置筛选条件</button>
            </div>

            <!-- 酒店列表 -->
            <div v-else class="hotel-list">
              <HotelCard
                v-for="hotel in hotels"
                :key="hotel.id"
                :hotel="hotel"
                @click="goToHotelDetail(hotel.id)"
              />
            </div>

            <!-- 分页 -->
            <div v-if="total > 0" class="pagination-wrapper">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 30, 50]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </main>
        </div>
      </div>
    </div>

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

<script setup name="HotelSearch">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown, Loading } from '@element-plus/icons-vue'
import HotelCard from '@/components/HotelCard.vue'
import { searchHotels, getHotelRooms } from '@/api/front/hotel'
import useUserStore from '@/store/modules/user'
import { getToken } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 搜索表单
const searchForm = ref({
  keyword: '',
  checkIn: '',
  checkOut: '',
  guests: '2'
})

// 筛选条件
const filters = ref({
  star: [],
  minPrice: null,
  maxPrice: null,
  minScore: null,
  facilities: [],
  types: []
})

// 排序和分页
const currentSort = ref('recommend')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 数据状态
const hotels = ref([])
const loading = ref(false)

// 星级选项
const starOptions = [
  { value: 5, label: '五星' },
  { value: 4, label: '四星' },
  { value: 3, label: '三星' },
  { value: 2, label: '二星' },
  { value: 1, label: '一星' }
]

// 价格范围选项
const priceOptions = [
  { label: '0-200', min: 0, max: 200 },
  { label: '200-500', min: 200, max: 500 },
  { label: '500-1000', min: 500, max: 1000 },
  { label: '1000-2000', min: 1000, max: 2000 },
  { label: '2000以上', min: 2000, max: null }
]

// 评分选项
const scoreOptions = [
  { value: 4.5, label: '4.5分及以上' },
  { value: 4.0, label: '4.0分及以上' },
  { value: 3.5, label: '3.5分及以上' },
  { value: 3.0, label: '3.0分及以上' }
]

// 设施选项
const facilityOptions = [
  'WiFi',
  '停车场',
  '游泳池',
  '健身房',
  'SPA',
  '餐厅',
  '商务中心',
  '会议室',
  '接机服务',
  '行李寄存'
]

// 酒店类型选项
const typeOptions = [
  '豪华酒店',
  '商务酒店',
  '度假酒店',
  '经济型酒店',
  '民宿',
  '公寓'
]

// 排序选项
const sortOptions = [
  { value: 'recommend', label: '推荐' },
  { value: 'price_asc', label: '价格低到高' },
  { value: 'price_desc', label: '价格高到低' },
  { value: 'score_desc', label: '评分最高' },
  { value: 'review_desc', label: '评论最多' }
]

// 用户相关
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

// 检查价格范围是否激活
function isPriceActive(price) {
  return filters.value.minPrice === price.min && filters.value.maxPrice === price.max
}

// 选择价格范围
function selectPriceRange(price) {
  filters.value.minPrice = price.min
  filters.value.maxPrice = price.max
  handleFilter()
}

// 搜索酒店
async function handleSearch() {
  currentPage.value = 1
  await fetchHotels()
}

// 处理筛选
async function handleFilter() {
  currentPage.value = 1
  await fetchHotels()
}

// 处理排序
async function handleSort(sort) {
  currentSort.value = sort
  currentPage.value = 1
  await fetchHotels()
}

// 重置筛选条件
function resetFilters() {
  filters.value = {
    star: [],
    minPrice: null,
    maxPrice: null,
    minScore: null,
    facilities: [],
    types: []
  }
  currentSort.value = 'recommend'
  currentPage.value = 1
  fetchHotels()
}

// 默认设施列表
const defaultFacilitiesList = ['免费WiFi', '停车场', '餐厅', '健身房', '商务中心', '行李寄存', '游泳池', 'SPA', '会议室', '接机服务']

// 排序字段映射
const sortFieldMap = {
  'recommend': { orderBy: 'score', orderDirection: 'desc' },
  'price_asc': { orderBy: 'price', orderDirection: 'asc' },
  'price_desc': { orderBy: 'price', orderDirection: 'desc' },
  'score_desc': { orderBy: 'score', orderDirection: 'desc' },
  'review_desc': { orderBy: 'createTime', orderDirection: 'desc' }
}

// 获取酒店数据（使用后端分页）
async function fetchHotels() {
  loading.value = true
  try {
    const sortConfig = sortFieldMap[currentSort.value] || sortFieldMap['recommend']

    const params = {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchForm.value.keyword || undefined,
      star: filters.value.star.length === 1 ? filters.value.star[0] : undefined,
      minPrice: filters.value.minPrice || undefined,
      maxPrice: filters.value.maxPrice || undefined,
      minScore: filters.value.minScore || undefined,
      facility: filters.value.facilities.length > 0 ? filters.value.facilities.join(',') : undefined,
      orderBy: sortConfig.orderBy,
      orderDirection: sortConfig.orderDirection
    }

    const res = await searchHotels(params)
    console.log('搜索响应:', res)
    // 响应拦截器已解包：res 就是 { rows, total } 或 { code, data: { rows, total } } 或空数组
    const data = res.data || res
    // 兼容空数组降级（公开接口 401 时返回 []）
    if (Array.isArray(data)) {
      hotels.value = []
      total.value = 0
      loading.value = false
      return
    }
    const rows = data.rows || []
    if (rows.length > 0) {

      // 处理返回的酒店数据，统一字段名
      hotels.value = rows.map(hotel => {
        // 处理设施字段
        let facilities = []
        if (hotel.facilityList) {
          facilities = Array.isArray(hotel.facilityList) ? hotel.facilityList : []
        } else if (hotel.facility) {
          if (Array.isArray(hotel.facility)) {
            facilities = hotel.facility
          } else if (typeof hotel.facility === 'string') {
            facilities = hotel.facility.split(',').filter(f => f.trim())
          }
        }
        // 如果没有设施数据，分配默认设施
        if (facilities.length === 0) {
          facilities = defaultFacilitiesList.slice(0, 4)
        }

        return {
          ...hotel,
          // 统一酒店名称字段
          hotelName: hotel.name || hotel.hotelName,
          // 统一图片字段
          coverImage: hotel.imgUrl || hotel.coverImage || hotel.image,
          // 统一最低价格字段
          minPrice: hotel.minPrice || 0,
          // 统一评价数量字段
          commentCount: hotel.roomCount || hotel.commentCount || 0,
          // 设施字段
          facilities: facilities
        }
      })

      // 更新总数
      total.value = data.total || 0

      // 获取每个酒店的房型最低价格
      await fetchHotelsMinPrice()
    } else {
      // 后端返回空列表（rows = []），正常显示空状态
      hotels.value = []
      total.value = data.total || 0
    }
  } catch (error) {
    console.error('搜索酒店失败:', error)
    ElMessage.error('搜索失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 批量获取酒店的房型最低价格
async function fetchHotelsMinPrice() {
  const promises = hotels.value.map(async (hotel) => {
    try {
      const res = await getHotelRooms(hotel.id)
      if (res.code === 200 && res.data && res.data.length > 0) {
        // 找到最低价格的房型
        const prices = res.data
          .filter(room => room.status === '0') // 只统计上架的房型
          .map(room => room.price || 0)
          .filter(price => price > 0)
        if (prices.length > 0) {
          hotel.minPrice = Math.min(...prices)
        }
      }
    } catch (error) {
      console.error(`获取酒店 ${hotel.id} 房型失败:`, error)
    }
  })
  await Promise.all(promises)
}

// 分页大小变化
function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  fetchHotels()
}

// 页码变化
function handleCurrentChange(page) {
  currentPage.value = page
  fetchHotels()
}

// 跳转到酒店详情
function goToHotelDetail(hotelId) {
  router.push(`/hotel/${hotelId}`)
}

// 跳转到首页
function goToHome() {
  if (isLoggedIn.value) {
    router.push('/home')
  } else {
    router.push('/index')
  }
}

function goToNotifications() {
  router.push('/user/profile/orders')
}

function goToRegister() {
  router.push('/register')
}

// 跳转到登录
function goToLogin() {
  router.push('/login')
}

// 用户命令处理
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
      userStore.logOut().then(() => {
        ElMessage.success('退出登录成功')
        window.location.href = '/index'
      })
      break
  }
}

// 从URL参数初始化搜索条件
function initSearchParams() {
  const { keyword, destination, checkIn, checkOut, guests, star, minPrice, maxPrice, sort } = route.query
  searchForm.value.keyword = keyword || destination || ''
  searchForm.value.checkIn = checkIn || ''
  searchForm.value.checkOut = checkOut || ''
  searchForm.value.guests = guests || '2'

  if (star) {
    filters.value.star = star.split(',').map(Number)
  }
  if (minPrice) {
    filters.value.minPrice = Number(minPrice)
  }
  if (maxPrice) {
    filters.value.maxPrice = Number(maxPrice)
  }
  if (sort) {
    currentSort.value = sort
  }
}

// 监听路由参数变化
watch(() => route.query, (newQuery) => {
  initSearchParams()
  fetchHotels()
}, { deep: true })

onMounted(() => {
  initSearchParams()
  fetchHotels()
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 顶部导航 */
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

.notification-bell {
  position: relative;
  cursor: pointer;
  padding: 4px;
  margin-right: 4px;
}

.bell-icon { font-size: 18px; }

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

/* 搜索栏 */
.search-section {
  background: #fff;
  padding: 80px 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-bar {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #ff6b6b;
  border-radius: 50px;
  padding: 8px 12px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  flex: 1;
}

.search-icon {
  font-size: 18px;
}

.search-input {
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  width: 100%;
}

.search-input::placeholder {
  color: #999;
}

.date-input {
  width: 120px;
}

.select-input {
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background: transparent;
  cursor: pointer;
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
  padding: 12px 32px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.search-btn:hover {
  opacity: 0.9;
}

/* 主要内容区 */
.main-content {
  padding: 20px 0 40px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.content-wrapper {
  display: flex;
  gap: 20px;
}

/* 筛选面板 */
.filter-panel {
  width: 260px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 90px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.filter-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.reset-link {
  font-size: 14px;
  color: #ff6b6b;
  text-decoration: none;
}

.reset-link:hover {
  text-decoration: underline;
}

.filter-group {
  margin-bottom: 24px;
}

.filter-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.filter-option input[type="checkbox"],
.filter-option input[type="radio"] {
  display: none;
}

.checkbox-custom,
.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 4px;
  flex-shrink: 0;
  position: relative;
  transition: all 0.3s;
}

.radio-custom {
  border-radius: 50%;
}

.filter-option input:checked + .checkbox-custom,
.filter-option input:checked + .radio-custom {
  border-color: #ff6b6b;
  background: #ff6b6b;
}

.filter-option input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 12px;
}

.filter-option input:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.star-icons {
  color: #ffb800;
  font-size: 14px;
}

.star-text {
  color: #666;
}

/* 价格范围 */
.price-range {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.price-input {
  width: 0;
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.price-input:focus {
  border-color: #ff6b6b;
}

.price-input::placeholder {
  color: #999;
}

.price-separator {
  color: #999;
}

.price-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.price-tag {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.price-tag:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.price-tag.active {
  background: #ff6b6b;
  border-color: #ff6b6b;
  color: #fff;
}

/* 搜索结果 */
.search-results {
  flex: 1;
  min-width: 0;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.results-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.results-count {
  font-size: 14px;
  color: #666;
}

.results-count strong {
  color: #ff6b6b;
  font-size: 18px;
}

.search-keyword {
  font-size: 13px;
  color: #999;
  background: #f5f5f5;
  padding: 4px 10px;
  border-radius: 4px;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-label {
  font-size: 14px;
  color: #666;
}

.sort-btn {
  padding: 6px 14px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: #fff;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.sort-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.sort-btn.active {
  background: #ff6b6b;
  border-color: #ff6b6b;
  color: #fff;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.loading-icon {
  font-size: 40px;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}

.reset-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.reset-btn:hover {
  opacity: 0.9;
}

/* 酒店列表 */
.hotel-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 页脚 */
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

/* 响应式设计 */
@media (max-width: 992px) {
  .content-wrapper {
    flex-direction: column;
  }

  .filter-panel {
    width: 100%;
    position: static;
  }

  .results-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .sort-options {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 12px;
  }

  .nav {
    display: none;
  }

  .search-bar {
    flex-direction: column;
    border-radius: 12px;
    padding: 12px;
  }

  .search-item {
    width: 100%;
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
  }

  .search-divider {
    display: none;
  }

  .search-btn {
    width: 100%;
    margin-top: 8px;
  }

  .footer-content {
    flex-direction: column;
    gap: 30px;
  }
}
</style>
