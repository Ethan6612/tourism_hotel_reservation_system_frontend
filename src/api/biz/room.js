import request from '@/utils/request'

// ==================== 商户端房型管理 ====================

// 分页查询我的房型（只查自己酒店下的）
export function listRoom(query) {
  return request({
    url: '/api/merchant/room/query',
    method: 'post',
    headers: { repeatSubmit: false },
    data: query
  })
}

// 房型详情
export function getRoom(id) {
  return request({
    url: '/api/merchant/room/' + id,
    method: 'get'
  })
}

// 新增房型（hotelId由后端根据商户自动绑定）
export function addRoom(data) {
  return request({
    url: '/api/merchant/room',
    method: 'post',
    data: data
  })
}

// 编辑房型
export function updateRoom(data) {
  return request({
    url: '/api/merchant/room',
    method: 'put',
    data: data
  })
}

// 删除房型
export function delRoom(id) {
  return request({
    url: '/api/merchant/room/' + id,
    method: 'delete'
  })
}

// 上下架（0上架/1下架）
export function updateRoomStatus(id, status) {
  return request({
    url: '/api/merchant/room/' + id + '/status/' + status,
    method: 'put'
  })
}

// 修改价格
export function updateRoomPrice(id, price) {
  return request({
    url: '/api/merchant/room/' + id + '/price',
    method: 'put',
    params: { price }
  })
}

// 修改库存
export function updateRoomStock(id, stock) {
  return request({
    url: '/api/merchant/room/' + id + '/stock',
    method: 'put',
    params: { stock }
  })
}

// 按酒店查房型列表
export function getRoomsByHotelId(hotelId) {
  return request({
    url: '/api/merchant/room/hotel/' + hotelId,
    method: 'get'
  })
}

// 库存预警查询
export function getLowStockRooms(threshold, hotelId) {
  return request({
    url: '/api/merchant/room/lowStock',
    method: 'get',
    params: { threshold, hotelId }
  })
}
