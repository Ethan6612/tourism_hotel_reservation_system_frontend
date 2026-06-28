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
          <a :href="isLoggedIn ? '/home' : '/index'" class="nav-item">首页</a>
          <a href="/search" class="nav-item active">酒店</a>
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

    <!-- 面包屑导航 -->
    <div class="breadcrumb-section">
      <div class="container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item><a :href="isLoggedIn ? '/home' : '/index'">首页</a></el-breadcrumb-item>
          <el-breadcrumb-item><a href="/search">酒店搜索</a></el-breadcrumb-item>
          <el-breadcrumb-item>{{ hotel.hotelName }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <!-- 酒店图片轮播 -->
    <section class="gallery-section">
      <div class="container">
        <div class="gallery">
          <div class="main-image">
            <img :src="currentImage" alt="酒店主图" />
            <div class="image-nav">
              <button class="nav-btn prev" @click="prevImage">‹</button>
              <button class="nav-btn next" @click="nextImage">›</button>
            </div>
            <div class="image-counter">{{ currentImageIndex + 1 }} / {{ hotel.images.length }}</div>
          </div>
          <div class="thumbnail-list">
            <img
              v-for="(img, index) in hotel.images"
              :key="index"
              :src="img"
              :class="['thumbnail', { active: currentImageIndex === index }]"
              @click="currentImageIndex = index"
              alt="酒店缩略图"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 酒店主要信息 -->
    <section class="hotel-main">
      <div class="container">
        <div class="main-content">
          <!-- 左侧信息 -->
          <div class="hotel-info">
            <div class="hotel-header">
              <h1 class="hotel-name">{{ hotel.hotelName }}</h1>
              <div class="hotel-tags">
                <span class="tag star-tag">{{ '★'.repeat(hotel.star) }}{{ '☆'.repeat(5 - hotel.star) }}</span>
                <span class="tag type-tag">{{ hotel.type }}</span>
              </div>
            </div>
            <div class="hotel-score">
              <span class="score">{{ hotel.score }}</span>
              <span class="score-label">{{ hotel.scoreLabel }}</span>
              <span class="review-count">{{ hotel.reviewCount }}条点评</span>
            </div>
            <div class="hotel-address">
              <span class="icon">📍</span>
              <span>{{ hotel.address }}</span>
            </div>
            <div class="hotel-phone">
              <span class="icon">📞</span>
              <span>{{ hotel.phone }}</span>
            </div>
            <div class="hotel-intro">
              <h3>酒店简介</h3>
              <p>{{ hotel.intro }}</p>
            </div>
          </div>

          <!-- 右侧预订卡片 -->
          <div class="booking-card">
            <div class="price-section">
              <span class="price-label">起</span>
              <span class="price-symbol">¥</span>
              <span class="price">{{ hotel.minPrice }}</span>
              <span class="price-unit">/晚</span>
            </div>
            <div class="booking-dates">
              <div class="date-item">
                <label>入住日期</label>
                <input type="date" v-model="booking.checkIn" />
              </div>
              <div class="date-item">
                <label>退房日期</label>
                <input type="date" v-model="booking.checkOut" />
              </div>
            </div>
            <div class="booking-guests">
              <label>入住人数</label>
              <select v-model="booking.guests">
                <option value="1">1人</option>
                <option value="2">2人</option>
                <option value="3">3人</option>
                <option value="4">4人</option>
              </select>
            </div>
            <button class="book-btn" @click="handleBook">立即预订</button>
            <p class="booking-tip">预订即表示同意《服务协议》</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 设施服务 -->
    <section class="facilities-section">
      <div class="container">
        <h2 class="section-title">设施服务</h2>
        <div class="facilities-grid">
          <div v-for="facility in hotel.facilities" :key="facility.name" class="facility-item">
            <span class="facility-icon">{{ facility.icon }}</span>
            <div class="facility-info">
              <span class="facility-name">{{ facility.name }}</span>
              <span class="facility-desc">{{ facility.description }}</span>
            </div>
          </div>
        </div>
        <div class="service-tags">
          <div class="service-item">
            <span class="service-label">🅿️ 停车信息</span>
            <span class="service-value">{{ hotel.parkingInfo }}</span>
          </div>
          <div class="service-item">
            <span class="service-label">📶 WiFi信息</span>
            <span class="service-value">{{ hotel.wifiInfo }}</span>
          </div>
          <div class="service-item">
            <span class="service-label">🍳 早餐信息</span>
            <span class="service-value">{{ hotel.breakfastInfo }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 入住政策 -->
    <section class="policy-section">
      <div class="container">
        <h2 class="section-title">入住政策</h2>
        <div class="policy-grid">
          <div class="policy-card">
            <div class="policy-icon">🕐</div>
            <h4>入住/退房时间</h4>
            <p>入住时间：{{ hotel.checkInTime }}</p>
            <p>退房时间：{{ hotel.checkOutTime }}</p>
          </div>
          <div class="policy-card">
            <div class="policy-icon">🚫</div>
            <h4>取消政策</h4>
            <p>{{ hotel.cancellationPolicy }}</p>
          </div>
          <div class="policy-card">
            <div class="policy-icon">👶</div>
            <h4>儿童政策</h4>
            <p>{{ hotel.childPolicy }}</p>
          </div>
          <div class="policy-card">
            <div class="policy-icon">🐾</div>
            <h4>宠物政策</h4>
            <p>{{ hotel.petPolicy }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 入住须知 -->
    <section class="rules-section">
      <div class="container">
        <h2 class="section-title">入住须知</h2>
        <div class="rules-content">
          <p v-for="(rule, index) in hotel.rules" :key="index">{{ rule }}</p>
        </div>
      </div>
    </section>

    <!-- 周边信息 -->
    <section class="surrounding-section">
      <div class="container">
        <h2 class="section-title">周边信息</h2>
        <div class="surrounding-grid">
          <div v-for="item in hotel.surroundingInfo" :key="item.name" class="surrounding-item">
            <span class="surrounding-icon">{{ item.icon }}</span>
            <div class="surrounding-info">
              <span class="surrounding-name">{{ item.name }}</span>
              <span class="surrounding-distance">{{ item.distance }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 房型列表 -->
    <section class="room-section" id="room-section">
      <div class="container">
        <h2 class="section-title">房型与价格</h2>
        <div class="room-list">
          <div v-for="room in rooms" :key="room.id" class="room-card">
            <div class="room-image">
              <img :src="room.image" alt="房型图片" />
            </div>
            <div class="room-info">
              <h3 class="room-name">{{ room.name }}</h3>
              <p class="room-type">{{ room.type }}</p>
              <div class="room-features">
                <span v-for="feature in room.features" :key="feature" class="feature-tag">{{ feature }}</span>
              </div>
              <p class="room-bed">🛏️ 床型：{{ room.bedType }}</p>
              <p class="room-area">📐 面积：{{ room.area }}㎡</p>
              <p class="room-max">👥 最多入住：{{ room.maxGuests }}人</p>
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
        <div class="review-summary">
          <div class="summary-score">
            <span class="big-score">{{ hotel.score }}</span>
            <span class="score-label">{{ getScoreLabel(hotel.score) }}</span>
          </div>
          <div class="summary-bars">
            <div v-for="item in ratingDistribution" :key="item.label" class="bar-item">
              <span class="bar-label">{{ item.label }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: item.percentage + '%' }"></div>
              </div>
              <span class="bar-count">{{ item.count }}</span>
            </div>
          </div>
        </div>
        <div class="review-list">
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <div class="reviewer-info">
                <span class="reviewer-avatar">{{ review.userName.charAt(0) }}</span>
                <div class="reviewer-details">
                  <span class="reviewer-name">{{ review.userName }}</span>
                  <span class="review-time">{{ review.time }}</span>
                  <span class="review-hotel-tag">{{ hotel.name }}</span>
                </div>
              </div>
              <div class="review-score">
                <span class="score">{{ review.score }}</span>
                <span class="score-text">分</span>
              </div>
            </div>
            <p class="review-content">{{ review.content }}</p>
            <div class="review-likes">
              <span class="like-count" :class="{ liked: review._liked }" @click="handleReviewLike(review)">
                <svg class="like-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m7-2V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14Z"/></svg>
                <span>{{ review.likeCount || 0 }}</span>
              </span>
              <span class="likes-who" v-if="Number(userStore.id) === Number(review.userId) && (review.likeCount || 0) > 0" @click="showReviewLikes(review)">
                谁赞过
              </span>
            </div>
            <div v-if="review.reply" class="review-reply">
              <span class="reply-label">商家回复：</span>
              <span class="reply-content">{{ review.reply }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 点赞列表对话框 -->
    <el-dialog title="👍 点赞详情" v-model="likesOpen" width="420px" append-to-body>
      <div v-if="likesList.length > 0" class="likes-list">
        <div v-for="u in likesList" :key="u.id" class="likes-user">
          <span class="likes-avatar">{{ (u.userName || '用户').charAt(0) }}</span>
          <span class="likes-name">{{ u.userName || '用户' }}</span>
          <span class="likes-time">{{ u.createTime }}</span>
        </div>
      </div>
      <el-empty v-else description="暂无点赞" :image-size="80" />
    </el-dialog>

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

    <!-- 支付对话框 -->
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
        <el-button type="success" @click="confirmPayInHotel" :loading="paying">
          确认支付 ¥{{ payingOrder.totalPrice }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="HotelDetail">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'
import { getToken } from '@/utils/auth'
import { getHotelDetail, getHotelRooms } from '@/api/front/hotel'
import { listCommentByHotel, likeComment, getCommentLikes } from '@/api/biz/comment'
import { initiatePay, confirmPay } from '@/api/front/userHome'
import QRCode from 'qrcode'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 图片轮播
const currentImageIndex = ref(0)

// 点赞
const likesOpen = ref(false)
const likesList = ref([])
const currentUserId = computed(() => userStore.id)

// 支付状态
const payDialogOpen = ref(false)
const payingOrder = ref({})
const payQrCode = ref('')
const paying = ref(false)

async function handlePayInHotel(order) {
  try {
    const res = await initiatePay(order.id)
    const data = res.data || res
    if (data && data.code && data.code !== 200) {
      ElMessage.error(data.msg || '发起支付失败')
      return
    }
    payingOrder.value = order
    payQrCode.value = ''
    payDialogOpen.value = true
    const qrData = 'WECHAT_PAY_' + (data.transactionId || order.orderNo)
    try {
      payQrCode.value = await QRCode.toDataURL(qrData, { width: 200, margin: 1 })
    } catch (e) {
      console.error('QR生成失败:', e)
    }
  } catch (e) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '发起支付失败')
  }
}

async function confirmPayInHotel() {
  paying.value = true
  try {
    await confirmPay(payingOrder.value.id)
    ElMessage.success('支付成功！')
    payDialogOpen.value = false
  } catch {
    ElMessage.error('支付失败，请重试')
  } finally {
    paying.value = false
  }
}

async function handleReviewLike(review) {
  try {
    const res = await likeComment(review.id)
    if (res.msg && res.msg.includes('取消')) {
      review._liked = false
      review.likeCount = Math.max(0, (review.likeCount || 0) - 1)
    } else {
      review._liked = true
      review.likeCount = (review.likeCount || 0) + 1
    }
  } catch { /* 错误已处理 */ }
}

async function showReviewLikes(review) {
  try {
    const res = await getCommentLikes(review.id)
    likesList.value = res.data || []
    likesOpen.value = true
  } catch { likesList.value = [] }
}

// 预订信息
const booking = ref({
  checkIn: '',
  checkOut: '',
  guests: '2'
})

// 酒店假数据
const hotel = ref({
  id: 1,
  hotelName: '北京希尔顿酒店',
  star: 5,
  type: '豪华酒店',
  score: 4.8,
  scoreLabel: '超棒',
  reviewCount: 1256,
  address: '北京市东城区王府井大街1号',
  phone: '010-88888888',
  intro: '北京希尔顿酒店位于北京市中心，毗邻王府井商业区，交通便利。酒店拥有豪华客房和套房，配备现代化设施，提供高品质的餐饮服务和完善的会议设施。酒店还设有健身中心、室内游泳池、SPA中心等休闲设施，是商务和休闲旅客的理想选择。',
  minPrice: 1280,

  // 图片
  images: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1551882547-be7b2a60087d?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=500&fit=crop'
  ],

  // 设施服务
  facilities: [
    { icon: '📶', name: '免费WiFi', description: '大堂及客房免费WiFi' },
    { icon: '🅿️', name: '停车场', description: '地下停车场，收费50元/天' },
    { icon: '🏊', name: '游泳池', description: '室内恒温游泳池' },
    { icon: '💪', name: '健身房', description: '24小时健身中心' },
    { icon: '🧖', name: 'SPA', description: '专业SPA理疗服务' },
    { icon: '🍽️', name: '餐厅', description: '中西餐厅，自助早餐' },
    { icon: '🍸', name: '酒吧', description: '大堂酒吧，营业至深夜' },
    { icon: '💼', name: '商务中心', description: '提供复印、打印、传真服务' },
    { icon: '🏊‍♂️', name: '儿童泳池', description: '儿童专用浅水泳池' },
    { icon: '🧺', name: '洗衣服务', description: '提供洗衣和熨烫服务' },
    { icon: '🚖', name: '接机服务', description: '提供机场接送服务（收费）' },
    { icon: '🔐', name: '保险柜', description: '客房配备电子保险柜' }
  ],
  parkingInfo: '地下停车场，收费50元/天，入住客人免费',
  wifiInfo: '全酒店覆盖免费WiFi，速度100Mbps',
  breakfastInfo: '自助早餐 6:30-10:00，成人128元/位，儿童64元/位',

  // 入住政策
  checkInTime: '14:00',
  checkOutTime: '12:00',
  cancellationPolicy: '入住前24小时可免费取消，24小时内取消将收取首晚房费',
  childPolicy: '6岁以下儿童免费入住，6-12岁儿童加床费100元/晚',
  petPolicy: '允许携带宠物入住，需额外支付200元清洁费',

  // 入住须知
  rules: [
    '请携带有效身份证件办理入住',
    '入住时间为14:00后，退房时间为12:00前',
    '酒店提供免费WiFi，请在前台获取密码',
    '如需提前入住或延迟退房，请提前联系酒店',
    '酒店内禁止吸烟，如需吸烟请前往指定区域',
    '请妥善保管贵重物品，酒店不承担责任',
    '如需特殊服务（如婴儿床、加床），请提前预约'
  ],

  // 周边信息
  surroundingInfo: [
    { icon: '🛍️', name: '王府井百货', distance: '步行5分钟' },
    { icon: '🚇', name: '地铁1号线', distance: '步行3分钟' },
    { icon: '🏛️', name: '故宫博物院', distance: '车程10分钟' },
    { icon: '🌳', name: '天安门广场', distance: '车程8分钟' },
    { icon: '✈️', name: '首都国际机场', distance: '车程40分钟' },
    { icon: '🚄', name: '北京站', distance: '车程15分钟' }
  ]
})

// 房型数据
const rooms = ref([
  {
    id: 1,
    name: '豪华大床房',
    type: '大床房',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=250&fit=crop',
    features: ['免费WiFi', '迷你吧', '浴缸', '城市景观'],
    bedType: '1.8米大床',
    area: 45,
    maxGuests: 2,
    price: 1280
  },
  {
    id: 2,
    name: '行政双床房',
    type: '双床房',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=250&fit=crop',
    features: ['免费WiFi', '迷你吧', '浴缸', '行政酒廊'],
    bedType: '2张1.2米单人床',
    area: 50,
    maxGuests: 2,
    price: 1580
  },
  {
    id: 3,
    name: '豪华套房',
    type: '套房',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=250&fit=crop',
    features: ['免费WiFi', '迷你吧', '浴缸', '客厅', '城市景观'],
    bedType: '1.8米大床',
    area: 80,
    maxGuests: 3,
    price: 2880
  },
  {
    id: 4,
    name: '总统套房',
    type: '顶级套房',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=250&fit=crop',
    features: ['免费WiFi', '迷你吧', '按摩浴缸', '独立客厅', '餐厅', '全景景观'],
    bedType: '2米特大床',
    area: 150,
    maxGuests: 4,
    price: 8880
  }
])

// 评价数据
const reviews = ref([])
const ratingDistribution = ref([])

async function loadReviews() {
  try {
    const hotelId = route.params.id
    const res = await listCommentByHotel(hotelId, { pageNum: 1, pageSize: 50, status: '1' })
    const list = (res.data?.rows || res.data?.list || res.rows || []).map(r => ({
      id: r.id, userId: r.userId,
      userName: r.userName || '用户',
      score: r.score,
      time: r.createTime ? r.createTime.substring(0, 10) : '',
      content: r.content,
      reply: r.replyContent,
      likeCount: r.likeCount || 0,
      _liked: r.liked || false
    }))
    reviews.value = list
    const dist = [0, 0, 0, 0, 0]
    list.forEach(r => { if (r.score >= 1 && r.score <= 5) dist[5 - r.score]++ })
    const total = list.length || 1
    const labels = ['5分', '4分', '3分', '2分', '1分']
    ratingDistribution.value = dist.map((c, i) => ({ label: labels[i], percentage: Math.round(c / total * 100), count: c }))
    if (list.length > 0) {
      const avg = (list.reduce((s, r) => s + r.score, 0) / list.length).toFixed(1)
      hotel.value.score = avg
      hotel.value.scoreLabel = getScoreLabel(avg);
      hotel.value.reviewCount = list.length
    }
  } catch { /* 评价加载失败 */ }
}

function getScoreLabel(score) {
  const n = Number(score);
  if (n >= 4.5) return '超棒';
  if (n >= 4.0) return '很棒';
  if (n >= 3.0) return '一般';
  if (n >= 2.0) return '较差';
  return '很差';
}

// 当前显示的图片
const currentImage = computed(() => hotel.value.images[currentImageIndex.value])

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

// 上一张图片
function prevImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  } else {
    currentImageIndex.value = hotel.value.images.length - 1
  }
}

// 下一张图片
function nextImage() {
  if (currentImageIndex.value < hotel.value.images.length - 1) {
    currentImageIndex.value++
  } else {
    currentImageIndex.value = 0
  }
}

// 预订（使用右侧预订卡片，默认第一个房型）
function handleBook() {
  document.getElementById('room-section')?.scrollIntoView({ behavior: 'smooth' })
}

// 预订指定房型
async function handleBookRoom(room) {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  // 使用当前选择的日期，如果没有则默认明天起
  const checkIn = booking.value.checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const checkOut = booking.value.checkOut || new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
  await createOrderRequest(room.id, checkIn, checkOut)
}

// 调用创建订单API
async function createOrderRequest(roomId, checkIn, checkOut) {
  try {
    const res = await request({
      url: '/api/user/order/create',
      method: 'post',
      data: {
        hotelId: Number(route.params.id),
        roomId: roomId,
        startDate: checkIn,
        endDate: checkOut,
        guests: Number(booking.value.guests || 2)
      }
    })
    const order = res.data || res
    const orderNo = order.orderNo || ''
    await ElMessageBox.confirm(
      `订单创建成功！<br/>订单号：<strong>${orderNo}</strong><br/>金额：<strong>¥${order.totalPrice}</strong><br/><br/>是否立即支付？`,
      '预订成功',
      { confirmButtonText: '去支付', cancelButtonText: '稍后支付', type: 'success',
        dangerouslyUseHTMLString: true }
    )
    // 当前页弹出支付对话框
    handlePayInHotel(order)
  } catch (e) {
    if (e !== 'cancel' && e?.response?.data?.msg) {
      ElMessage.error(e.response.data.msg)
    }
  }
}

// 加载真实酒店数据
async function loadHotelData() {
  try {
    const res = await getHotelDetail(route.params.id)
    const apiData = res.data || res
    // 只有有效对象（非数组、非null）才处理，防止 401 降级返回 []
    if (apiData && typeof apiData === 'object' && !Array.isArray(apiData)) {
      // 字段映射：API 的 VO 字段 → 模板使用的字段
      const mapped = {
        // 基础信息映射
        hotelName: apiData.name || apiData.hotelName,
        address: apiData.address,
        star: apiData.star,
        score: apiData.score,
        phone: apiData.phone,
        intro: apiData.intro,
        minPrice: apiData.minPrice,

        // 图片：VO 返回单张 imgUrl，转为 images 数组
        images: apiData.imgUrl
          ? [apiData.imgUrl, apiData.imgUrl, apiData.imgUrl, apiData.imgUrl, apiData.imgUrl]
          : hotel.value.images,

        // 设施：VO 返回 facilityList（字符串数组），转为 facility 对象数组
        facilities: apiData.facilityList?.length
          ? apiData.facilityList.map(f => ({ icon: '✅', name: f, description: f }))
          : hotel.value.facilities,

        // 房型列表（VO 的 roomList）
        roomList: apiData.roomList || [],
      }
      // 合并：mock 数据兜底，API 数据覆盖
      hotel.value = { ...hotel.value, ...mapped }
    }
  } catch { /* 使用默认数据 */ }
}

// 加载真实房型数据
async function loadRooms() {
  try {
    const res = await getHotelRooms(route.params.id)
    const data = res.data || res
    const list = data?.rows || data
    if (Array.isArray(list) && list.length > 0) {
      rooms.value = list.map(r => ({
        id: r.id,
        name: r.roomType || r.name,
        type: r.bedType || r.type || '房型',
        image: r.imgUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=250&fit=crop',
        features: ['免费WiFi', '空调', '电视'],
        bedType: r.bedType || '大床',
        area: parseInt(r.area) || 40,
        maxGuests: 2,
        price: r.price
      }))
    }
  } catch { /* 使用默认房型 */ }
}

// 跳转到首页
function goToHome() {
  router.push(isLoggedIn.value ? '/home' : '/index')
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
        window.location.href = '/index'
      })
      break
  }
}

onMounted(() => {
  // 设置默认预订日期
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfterTomorrow = new Date(today)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

  booking.value.checkIn = tomorrow.toISOString().split('T')[0]
  booking.value.checkOut = dayAfterTomorrow.toISOString().split('T')[0]

  // 加载真实酒店、房型和评价数据
  loadHotelData()
  loadRooms()
  loadReviews()
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

/* 图片轮播 */
.gallery-section {
  padding: 20px 0;
  background: #fff;
}

.gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-image {
  position: relative;
  height: 450px;
  border-radius: 12px;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-nav {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  transform: translateY(-50%);
  pointer-events: none;
}

.nav-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 24px;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-counter {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.thumbnail-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.thumbnail {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s;
  flex-shrink: 0;
}

.thumbnail:hover {
  border-color: #ff6b6b;
}

.thumbnail.active {
  border-color: #ff6b6b;
}

/* 酒店主要信息 */
.hotel-main {
  padding: 30px 0;
}

.main-content {
  display: flex;
  gap: 30px;
}

.hotel-info {
  flex: 1;
}

.hotel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.hotel-name {
  font-size: 32px;
  font-weight: 700;
  color: #333;
}

.hotel-tags {
  display: flex;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.star-tag {
  background: #fff3e6;
  color: #ff9500;
}

.type-tag {
  background: #e6f7ff;
  color: #1890ff;
}

.hotel-score {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.score {
  font-size: 36px;
  font-weight: 700;
  color: #ff6b6b;
  margin-right: 8px;
}

.score-label {
  font-size: 16px;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 4px 10px;
  border-radius: 4px;
  margin-right: 12px;
}

.review-count {
  font-size: 14px;
  color: #999;
}

.hotel-address,
.hotel-phone {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 15px;
  color: #666;
}

.icon {
  font-size: 18px;
}

.hotel-intro {
  margin-top: 24px;
}

.hotel-intro h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.hotel-intro p {
  font-size: 15px;
  color: #666;
  line-height: 1.8;
}

/* 预订卡片 */
.booking-card {
  width: 360px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 90px;
}

.price-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.price-label {
  font-size: 14px;
  color: #999;
}

.price-symbol {
  font-size: 20px;
  color: #ff6b6b;
  font-weight: 600;
}

.price {
  font-size: 42px;
  font-weight: 700;
  color: #ff6b6b;
}

.price-unit {
  font-size: 14px;
  color: #999;
}

.booking-dates {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.date-item {
  flex: 1;
}

.date-item label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.date-item input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.date-item input:focus {
  border-color: #ff6b6b;
}

.booking-guests {
  margin-bottom: 20px;
}

.booking-guests label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.booking-guests select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
  cursor: pointer;
}

.booking-guests select:focus {
  border-color: #ff6b6b;
}

.book-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.book-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.booking-tip {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 12px;
}

/* 设施服务 */
.facilities-section {
  padding: 30px 0;
  background: #fff;
  margin-bottom: 20px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin-bottom: 24px;
}

.facilities-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.facility-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 10px;
}

.facility-icon {
  font-size: 28px;
}

.facility-info {
  display: flex;
  flex-direction: column;
}

.facility-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.facility-desc {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.service-label {
  color: #666;
}

.service-value {
  color: #333;
  font-weight: 500;
}

/* 入住政策 */
.policy-section {
  padding: 30px 0;
  background: #fff;
  margin-bottom: 20px;
}

.policy-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.policy-card {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
  text-align: center;
}

.policy-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.policy-card h4 {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.policy-card p {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

/* 入住须知 */
.rules-section {
  padding: 30px 0;
  background: #fff;
  margin-bottom: 20px;
}

.rules-content {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
}

.rules-content p {
  font-size: 14px;
  color: #666;
  line-height: 2;
  padding-left: 20px;
  position: relative;
}

.rules-content p::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #ff6b6b;
}

/* 周边信息 */
.surrounding-section {
  padding: 30px 0;
  background: #fff;
  margin-bottom: 20px;
}

.surrounding-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.surrounding-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 10px;
}

.surrounding-icon {
  font-size: 28px;
}

.surrounding-info {
  display: flex;
  flex-direction: column;
}

.surrounding-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.surrounding-distance {
  font-size: 12px;
  color: #999;
}

/* 房型列表 */
.room-section {
  padding: 30px 0;
  background: #fff;
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
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s;
}

.room-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.room-image {
  width: 220px;
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
.room-area,
.room-max {
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
.review-likes {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.like-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #999;
  transition: color 0.2s;
  padding: 2px 10px;
  border-radius: 12px;
  background: #fafafa;
  user-select: none;
}

.like-count:hover {
  color: #e74c3c;
  background: #fef2f2;
}

.like-count.liked {
  color: #e74c3c;
  background: #fef2f2;
  font-weight: 600;
}

.likes-who {
  font-size: 12px;
  color: #409eff;
  cursor: pointer;
}

.likes-who:hover {
  text-decoration: underline;
}

.likes-list {
  max-height: 350px;
  overflow-y: auto;
}

.likes-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.likes-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.likes-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.likes-time {
  font-size: 12px;
  color: #bbb;
}

.like-svg {
  flex-shrink: 0;
}

.review-section {
  padding: 30px 0;
  background: #fff;
  margin-bottom: 20px;
}

.review-summary {
  display: flex;
  gap: 40px;
  padding: 24px;
  background: #f9f9f9;
  border-radius: 10px;
  margin-bottom: 24px;
}

.summary-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.big-score {
  font-size: 48px;
  font-weight: 700;
  color: #ff6b6b;
}

.summary-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 30px;
  font-size: 13px;
  color: #666;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  border-radius: 4px;
}

.bar-count {
  width: 40px;
  text-align: right;
  font-size: 13px;
  color: #999;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
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
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
}

.reviewer-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.review-time {
  font-size: 13px;
  color: #999;
}

.review-hotel-tag {
  font-size: 11px;
  color: #409eff;
  background: #e8f0fe;
  padding: 1px 8px;
  border-radius: 8px;
  margin-left: 6px;
  white-space: nowrap;
  display: inline-block;
}

.review-score .score {
  font-size: 28px;
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
  line-height: 1.8;
  margin-bottom: 12px;
}

.review-reply {
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
}

.reply-label {
  color: #ff6b6b;
  font-weight: 600;
}

.reply-content {
  color: #666;
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
  .main-content {
    flex-direction: column;
  }

  .booking-card {
    width: 100%;
    position: static;
  }

  .facilities-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .policy-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .surrounding-grid {
    grid-template-columns: repeat(2, 1fr);
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

  .hotel-header {
    flex-direction: column;
    gap: 12px;
  }

  .hotel-name {
    font-size: 24px;
  }

  .facilities-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .policy-grid {
    grid-template-columns: 1fr;
  }

  .surrounding-grid {
    grid-template-columns: 1fr;
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

  .review-summary {
    flex-direction: column;
    align-items: center;
  }

  .footer-content {
    flex-direction: column;
    gap: 30px;
  }
}

/* 支付对话框 */
.pay-dialog-body { text-align: center; }
.pay-order-info { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.pay-label { font-size: 14px; color: #999; }
.pay-value { font-size: 14px; color: #333; font-weight: 500; }
.pay-amount { font-size: 22px; font-weight: 700; color: #ff6b6b; }
.pay-qrcode { margin: 20px 0; display: flex; flex-direction: column; align-items: center; }
.pay-qrcode img, .pay-qrcode canvas { width: 200px; height: 200px; border: 1px solid #eee; border-radius: 8px; }
.pay-qrcode p { margin-top: 8px; font-size: 13px; color: #666; }
.pay-tips { padding: 10px 16px; background: #fef3c7; border-radius: 8px; font-size: 13px; color: #b45309; }
</style>
