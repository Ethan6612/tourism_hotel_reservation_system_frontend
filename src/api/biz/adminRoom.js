import request from '@/utils/request'

// ==================== 管理员端房源管理 ====================

// 分页查询房型列表
export function listRoom(query) {
  return request({
    url: '/api/room/query',
    method: 'post',
    data: query
  })
}

// 获取房型详情
export function getRoom(id) {
  return request({
    url: '/api/room/' + id,
    method: 'get'
  })
}

// 新增房型
export function addRoom(data) {
  return request({
    url: '/api/room',
    method: 'post',
    data: data
  })
}

// 编辑房型
export function updateRoom(data) {
  return request({
    url: '/api/room',
    method: 'put',
    data: data
  })
}

// 删除房型
export function delRoom(id) {
  return request({
    url: '/api/room/' + id,
    method: 'delete'
  })
}

// 修改房型状态
export function updateRoomStatus(id, status) {
  return request({
    url: '/api/room/' + id + '/status/' + status,
    method: 'put'
  })
}

// 调整价格
export function updateRoomPrice(id, price) {
  return request({
    url: '/api/room/' + id + '/price',
    method: 'put',
    params: { price }
  })
}

// 调整库存
export function updateRoomStock(id, stock) {
  return request({
    url: '/api/room/' + id + '/stock',
    method: 'put',
    params: { stock }
  })
}

// 低库存预警
export function getLowStockRooms(threshold, hotelId) {
  return request({
    url: '/api/room/lowStock',
    method: 'get',
    params: { threshold, hotelId }
  })
}
