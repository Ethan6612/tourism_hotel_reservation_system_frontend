import request from '@/utils/request'

// 查询酒店列表
export function listHotel(query) {
  return request({
    url: '/api/hotel/list',
    method: 'get',
    params: query
  })
}

// 查询酒店详细
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

// 修改酒店
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
