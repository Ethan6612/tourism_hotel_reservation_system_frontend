import request from '@/utils/request'

// ==================== 管理员端酒店管理 ====================

// 分页查询酒店列表（管理员视角，所有酒店）
export function listHotel(query) {
  return request({
    url: '/api/hotel/query',
    method: 'post',
    data: query
  })
}

// 获取酒店详情
export function getHotel(id) {
  return request({
    url: '/api/hotel/' + id,
    method: 'get'
  })
}

// 新增酒店
export function addHotel(data) {
  return request({
    url: '/api/hotel',
    method: 'post',
    data: data
  })
}

// 编辑酒店
export function updateHotel(data) {
  return request({
    url: '/api/hotel',
    method: 'put',
    data: data
  })
}

// 删除酒店
export function delHotel(id) {
  return request({
    url: '/api/hotel/' + id,
    method: 'delete'
  })
}

// 修改酒店状态
export function updateHotelStatus(id, status) {
  return request({
    url: '/api/hotel/' + id + '/status/' + status,
    method: 'put'
  })
}
