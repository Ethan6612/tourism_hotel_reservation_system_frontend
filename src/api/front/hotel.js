import request from '@/utils/request'

// 查询酒店列表
export function searchHotels(query) {
  return request({
    url: '/api/hotel/search',
    method: 'post',
    data: query
  })
}

// 查询酒店详情
export function getHotelDetail(id) {
  return request({
    url: '/api/hotel/' + id,
    method: 'get'
  })
}

// 查询酒店房间列表
export function getHotelRooms(hotelId) {
  return request({
    url: '/api/room/hotel/' + hotelId,
    method: 'get'
  })
}

// 查询热门城市
export function getHotCities() {
  return request({
    url: '/api/hotel/hotCities',
    method: 'get'
  })
}

// 查询推荐酒店
export function getRecommendHotels() {
  return request({
    url: '/api/hotel/recommend',
    method: 'get'
  })
}

// 创建订单
export function createOrder(data) {
  return request({
    url: '/api/order',
    method: 'post',
    data: data
  })
}