import request from '@/utils/request'

// ==================== 订单接口 ====================

// 查询我的订单列表
export function listMyOrders(query) {
  return request({
    url: '/api/user/order/list',
    method: 'get',
    params: query
  })
}

// 查询订单详情
export function getOrderDetail(orderId) {
  return request({
    url: '/api/user/order/' + orderId,
    method: 'get'
  })
}

// 取消订单
export function cancelOrder(orderId) {
  return request({
    url: '/api/user/order/' + orderId + '/cancel',
    method: 'put'
  })
}

// 删除订单
export function deleteOrder(orderId) {
  return request({
    url: '/api/user/order/' + orderId,
    method: 'delete'
  })
}

// ==================== 用户首页统计 ====================

// 获取用户首页统计数据
export function getUserDashboardStats() {
  return request({
    url: '/api/user/dashboard/stats',
    method: 'get'
  })
}

// 获取个性化推荐酒店
export function getPersonalRecommend() {
  return request({
    url: '/api/hotel/personalRecommend',
    method: 'get'
  })
}

// ==================== 收藏接口 ====================

// 我的收藏列表
export function listMyFavorites(query) {
  return request({
    url: '/api/user/favorite/list',
    method: 'get',
    params: query
  })
}

// 添加收藏
export function addFavorite(hotelId) {
  return request({
    url: '/api/user/favorite/' + hotelId,
    method: 'post'
  })
}

// 取消收藏
export function removeFavorite(hotelId) {
  return request({
    url: '/api/user/favorite/' + hotelId,
    method: 'delete'
  })
}

// 检查是否已收藏
export function checkFavorite(hotelId) {
  return request({
    url: '/api/user/favorite/check/' + hotelId,
    method: 'get'
  })
}

// ==================== 搜索接口 ====================

// 高级搜索酒店
export function advancedSearch(query) {
  return request({
    url: '/api/hotel/advancedSearch',
    method: 'post',
    data: query
  })
}

// 获取搜索建议（自动补全）
export function getSearchSuggestions(keyword) {
  return request({
    url: '/api/hotel/suggestions',
    method: 'get',
    params: { keyword }
  })
}
