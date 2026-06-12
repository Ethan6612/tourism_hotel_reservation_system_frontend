<template>
  <div class="hotel-detail-page">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo" @click="goToHome">
          <span class="logo-icon">🏨</span>
          <span class="logo-text">ZSC酒店预订</span>
        </div>
        <nav class="nav">
          <a href="/index" class="nav-item">首页</a>
          <a href="/search" class="nav-item">酒店</a>
          <a href="#" class="nav-item">攻略</a>
          <a href="#" class="nav-item">关于我们</a>
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

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>正在加载酒店信息...</span>
    </div>

    <!-- 酒店详情内容 -->
    <div v-else-if="hotel" class="detail-content">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-section">
        <div class="container">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item><a href="/index">首页</a></el-breadcrumb-item>
            <el-breadcrumb-item><a href="/search">酒店搜索</a></el-breadcrumb-item>
            <el-breadcrumb-item>{{ hotel.hotelName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>

      <!-- 酒店主要信息 -->
      <section class="hotel-main">
        <div class="container">
          <div class="hotel-gallery">
            <div class="main-image">
              <img :src="hotel.coverImage" alt="酒店主图" @error="handleImageError($event)" />
            </div>
            <div class="sub-images">
              <img v-for="(img, index) in hotel.images" :key="index" :src="img" alt="酒店图片" @error="handleSubImageError($event)" />
            </div>
          </div>
          <div class="hotel-info-card">
            <div class="hotel-header">
              <h1 class="hotel-name">{{ hotel.hotelName }}</h1>
              <div class="hotel-tags">
                <span v-if="hotel.tag" class="tag">{{ hotel.tag }}</span>
                <span class="star-tag">{{ '★'.repeat(hotel.star || 0) }}{{ '☆'.repeat(5 - (hotel.star || 0)) }}</span>
              </div>
            </div>
            <div class="hotel-score">
              <span class="score">{{ hotel.score || 4.5 }}</span>
              <span class="score-label">超棒</span>
              <span class="review-count">{{ hotel.reviewCount || 0 }}条点评</span>
            </div>
            <div class="hotel-address">
              <span class="address-icon">📍</span>
              <span>{{ hotel.address }}</span>
            </div>
            <div class="hotel-facilities">
              <span v-for="facility in hotel.facilities" :key="facility" class="facility-tag">{{ facility }}</span>
            </div>
            <div class="hotel-description">
              <h3>酒店简介</h3>
              <p>{{ hotel.description || '暂无简介' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 房型列表 -->
      <section class="room-section">
        <div class="container">
          <h2 class="section-title">房型与价格</h2>
          <div class="room-list">
            <div v-for="room in rooms" :key="room.id" class="room-card">
              <div class="room-image">
                <img :src="room.coverImage" alt="房型图片" @error="handleRoomImageError($event)" />
              </div>
              <div class="room-info">
                <h3 class="room-name">{{ room.roomName }}</h3>
                <p class="room-type">{{ room.roomType }}</p>
                <div class="room-features">
                  <span v-for="feature in room.features" :key="feature" class="feature-tag">{{ feature }}</span>
                </div>
                <p class="room-bed">床型：{{ room.bedType }}</p>
                <p class="room-area">面积：{{ room.area }}㎡</p>
              </div>
              <div class="room-price">
                <div class="price-info">
                  <span class="price-symbol">¥</span>
                  <span class="price">{{ room.price }}</span>
                  <span class="price-unit">/晚</span>
                </div>
                <button class="book-btn" @click="handleBookRoom(room)">预订</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 用户评价 -->
      <section class="review-section">
        <div class="container">
          <h2 class="section-title">用户评价</h2>
          <div v-if="reviews.length > 0" class="review-list">
            <div v-for="review in reviews" :key="review.id" class="review-item">
              <div class="review-header">
                <div class="reviewer-info">
                  <span class="reviewer-avatar">{{ review.userName?.charAt(0) || '用' }}</span>
                  <div class="reviewer-details">
                    <span class="reviewer-name">{{ review.userName || '匿名用户' }}</span>
                    <span class="review-time">{{ review.createTime }}</span>
                  </div>
                </div>
                <div class="review-score">
                  <span class="score">{{ review.score }}</span>
                  <span class="score-text">分</span>
                </div>
              </div>
              <p class="review-content">{{ review.content }}</p>
              <div v-if="review.replyContent" class="review-reply">
                <span class="reply-label">商家回复：</span>
                <span class="reply-content">{{ review.replyContent }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-review">
            <span class="empty-icon">💬</span>
            <p>暂无评价</p>
          </div>
        </div>
      </section>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-state">
      <span class="error-icon">😕</span>
      <h3>酒店信息加载失败</h3>
      <p>请稍后重试或返回首页</p>
      <button class="back-btn" @click="goToHome">返回首页</button>
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

<script setup name="HotelDetail">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown, Loading } from '@element-plus/icons-vue'
import { getHotelDetail, getHotelRooms } from '@/api/front/hotel'
import useUserStore from '@/store/modules/user'
import { getToken } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 数据状态
const hotel = ref(null)
const rooms = ref([])
const reviews = ref([])
const loading = ref(true)

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

// 默认设施列表
const defaultFacilities = ['免费WiFi', '停车场', '餐厅', '健身房', '商务中心', '行李寄存']

// 默认酒店图片
const defaultHotelImages = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1551882547-be7b2a60087d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?w=400&h=300&fit=crop'
]

// 获取酒店详情
async function fetchHotelDetail() {
  const hotelId = route.params.id
  if (!hotelId) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    const res = await getHotelDetail(hotelId)
    if (res.code === 200) {
      const data = res.data
      // 处理设施字段，确保是数组格式
      if (data.facilities) {
        if (typeof data.facilities === 'string') {
          data.facilities = data.facilities.split(',').filter(f => f.trim())
        }
      } else {
        // 如果没有设施数据，使用默认设施
        data.facilities = defaultFacilities
      }
      // 统一字段名
      data.hotelName = data.hotelName || data.name
      // 处理封面图片
      data.coverImage = data.coverImage || data.image || data.img || data.pic || defaultHotelImages[0]
      // 处理图片数组
      if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
        data.images = defaultHotelImages.slice(1)
      }
      data.commentCount = data.commentCount || data.reviewCount
      hotel.value = data
      // 获取房型列表
      fetchHotelRooms(hotelId)
    } else {
      ElMessage.error(res.msg || '获取酒店信息失败')
    }
  } catch (error) {
    console.error('获取酒店详情失败:', error)
    ElMessage.error('获取酒店信息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 默认房型图片
const defaultRoomImages = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&h=200&fit=crop'
]

// 获取房型列表
async function fetchHotelRooms(hotelId) {
  try {
    const res = await getHotelRooms(hotelId)
    if (res.code === 200) {
      const data = res.data || []
      // 为房型添加默认图片
      rooms.value = data.map((room, index) => ({
        ...room,
        coverImage: room.coverImage || room.image || room.img || room.pic || defaultRoomImages[index % defaultRoomImages.length],
        roomName: room.roomName || room.name,
        roomType: room.roomType || room.type,
        bedType: room.bedType || room.bed || '大床',
        area: room.area || 30,
        price: room.price || room.roomPrice || 0,
        features: room.features || (Array.isArray(room.facilities) ? room.facilities : [])
      }))
    }
  } catch (error) {
    console.error('获取房型列表失败:', error)
  }
}

// 主图加载失败处理
function handleImageError(event) {
  event.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop'
}

// 子图加载失败处理
function handleSubImageError(event) {
  event.target.src = 'https://images.unsplash.com/photo-1551882547-be7b2a60087d?w=400&h=300&fit=crop'
}

// 房型图片加载失败处理
function handleRoomImageError(event) {
  event.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=200&fit=crop'
}

// 预订房间
function handleBookRoom(room) {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  // 跳转到预订页面
  ElMessage.success(`已选择房型：${room.roomName}`)
  // router.push(`/booking/${hotel.value.id}/${room.id}`)
}

// 跳转到首页
function goToHome() {
  router.push('/index')
}

// 跳转到登录
function goToLogin() {
  router.push('/login')
}

// 用户命令处理
function handleUserCommand(command) {
  switch (command) {
    case 'merchant':
      router.push('/biz/merchant')
      break
    case 'console':
      router.push('/dashboard')
      break
    case 'logout':
      userStore.logOut().then(() => {
        ElMessage.success('退出登录成功')
        router.push('/index')
        location.reload()
      })
      break
  }
}

onMounted(() => {
  fetchHotelDetail()
})
</script>

<style scoped>
.hotel-detail-page {
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

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding-top: 80px;
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

/* 面包屑导航 */
.breadcrumb-section {
  padding: 80px 0 20px;
  background: #fff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 酒店主要信息 */
.hotel-main {
  padding: 20px 0;
}

.hotel-gallery {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.main-image {
  flex: 2;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sub-images {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sub-images img {
  flex: 1;
  height: calc(50% - 8px);
  object-fit: cover;
  border-radius: 8px;
}

.hotel-info-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.hotel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.hotel-name {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.hotel-tags {
  display: flex;
  gap: 8px;
}

.tag {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.star-tag {
  color: #ffb800;
  font-size: 16px;
}

.hotel-score {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.score {
  font-size: 32px;
  font-weight: 700;
  color: #ff6b6b;
  margin-right: 8px;
}

.score-label {
  font-size: 14px;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 12px;
}

.review-count {
  font-size: 14px;
  color: #999;
}

.hotel-address {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}

.address-icon {
  font-size: 16px;
}

.hotel-facilities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.facility-tag {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 6px 12px;
  border-radius: 4px;
}

.hotel-description h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.hotel-description p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* 房型列表 */
.room-section {
  padding: 20px 0 40px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.room-card {
  display: flex;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.room-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.room-image {
  width: 200px;
  height: 160px;
  flex-shrink: 0;
}

.room-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-info {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.room-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.room-type {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.room-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.feature-tag {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.room-bed,
.room-area {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
}

.room-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  padding: 20px;
  border-left: 1px solid #eee;
  min-width: 150px;
}

.price-info {
  text-align: right;
  margin-bottom: 12px;
}

.price-symbol {
  font-size: 16px;
  color: #ff6b6b;
  font-weight: 600;
}

.price {
  font-size: 32px;
  font-weight: 700;
  color: #ff6b6b;
}

.price-unit {
  font-size: 14px;
  color: #999;
}

.book-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  border: none;
  padding: 10px 28px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.book-btn:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

/* 用户评价 */
.review-section {
  padding: 20px 0 40px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
}

.reviewer-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.review-time {
  font-size: 12px;
  color: #999;
}

.review-score {
  display: flex;
  align-items: baseline;
}

.review-score .score {
  font-size: 24px;
  font-weight: 700;
  color: #ff6b6b;
}

.score-text {
  font-size: 14px;
  color: #999;
  margin-left: 4px;
}

.review-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-reply {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
}

.reply-label {
  color: #ff6b6b;
  font-weight: 600;
}

.reply-content {
  color: #666;
}

.empty-review {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-review p {
  font-size: 14px;
  color: #999;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding-top: 80px;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-state h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 8px;
}

.error-state p {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}

.back-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  opacity: 0.9;
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
@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 12px;
  }

  .nav {
    display: none;
  }

  .hotel-gallery {
    flex-direction: column;
  }

  .main-image {
    height: 250px;
  }

  .sub-images {
    flex-direction: row;
  }

  .sub-images img {
    height: 100px;
  }

  .hotel-header {
    flex-direction: column;
    gap: 12px;
  }

  .room-card {
    flex-direction: column;
  }

  .room-image {
    width: 100%;
    height: 200px;
  }

  .room-price {
    border-left: none;
    border-top: 1px solid #eee;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .footer-content {
    flex-direction: column;
    gap: 30px;
  }
}
</style>
