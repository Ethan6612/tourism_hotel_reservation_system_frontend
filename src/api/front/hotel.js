import request from '@/utils/request'
import { getToken } from '@/utils/auth'

// 公开接口：有token就带，没有也不报错
function publicRequest(config) {
  const token = getToken()
  config.metadata = { noAuthDialog: true }
  if (!token) {
    config.headers = { ...(config.headers || {}), isToken: false }
  }
  return request(config)
}

// 查询酒店列表
export function searchHotels(query) {
  return publicRequest({ url: '/api/hotel/search', method: 'post', data: query })
}

// 查询酒店详情（公开接口）
export function getHotelDetail(id) {
  return publicRequest({ url: '/api/hotel/detail/' + id, method: 'get' })
}

// 查询酒店房间列表
export function getHotelRooms(hotelId) {
  return publicRequest({ url: '/api/room/hotel/' + hotelId, method: 'get' })
}

// 查询热门城市
export function getHotCities() {
  return publicRequest({ url: '/api/hotel/hotCities', method: 'get' })
}

// 查询推荐酒店
export function getRecommendHotels() {
  return publicRequest({ url: '/api/hotel/recommend', method: 'get' })
}

// 查询热销排行
export function getHotSalesRank() {
  return publicRequest({ url: '/api/hotel/hotSales', method: 'get' })
}

// 创建订单
export function createOrder(data) {
  return request({ url: '/api/order', method: 'post', data: data })
}