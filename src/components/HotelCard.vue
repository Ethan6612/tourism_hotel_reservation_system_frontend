<template>
  <div class="hotel-card" @click="goToDetail">
    <div class="hotel-image">
      <img :src="hotel.coverImage || '/api/image/default-hotel'" alt="酒店图片" />
      <div v-if="hotel.tag" class="hotel-tag">{{ hotel.tag }}</div>
    </div>
    <div class="hotel-info">
      <h3 class="hotel-name">{{ hotel.hotelName }}</h3>
      <p class="hotel-address">{{ hotel.address }}</p>
      <div class="hotel-score">
        <span class="score">{{ hotel.score || 4.5 }}</span>
        <span class="score-label">超棒</span>
        <span class="review-count">{{ hotel.reviewCount || 0 }}条点评</span>
      </div>
      <div class="hotel-facilities">
        <span v-for="facility in hotel.facilities" :key="facility" class="facility-tag">{{ facility }}</span>
      </div>
    </div>
    <div class="hotel-price">
      <div class="price-info">
        <span class="price-symbol">¥</span>
        <span class="price">{{ hotel.minPrice || 0 }}</span>
        <span class="price-unit">起/晚</span>
      </div>
      <button class="book-btn">查看详情</button>
    </div>
  </div>
</template>

<script setup name="HotelCard">
defineProps({
  hotel: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

function goToDetail() {
  emit('click')
}
</script>

<style scoped>
.hotel-card {
  display: flex;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.hotel-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.hotel-image {
  position: relative;
  width: 200px;
  height: 150px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.hotel-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hotel-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.hotel-info {
  flex: 1;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
}

.hotel-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hotel-address {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hotel-score {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.score {
  font-size: 20px;
  font-weight: 700;
  color: #ff6b6b;
  margin-right: 6px;
}

.score-label {
  font-size: 12px;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 10px;
}

.review-count {
  font-size: 12px;
  color: #999;
}

.hotel-facilities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.facility-tag {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.hotel-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  padding-left: 20px;
  border-left: 1px solid #eee;
}

.price-info {
  text-align: right;
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
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.book-btn:hover {
  transform: scale(1.05);
  opacity: 0.9;
}
</style>