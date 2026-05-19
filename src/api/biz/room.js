import request from '@/utils/request'

// 查询房源列表
export function listRoom(query) {
  return request({
    url: '/api/room/list',
    method: 'get',
    params: query
  })
}

// 查询房源详细
export function getRoom(id) {
  return request({
    url: '/api/room/' + id,
    method: 'get'
  })
}

// 新增房源
export function addRoom(data) {
  return request({
    url: '/api/room',
    method: 'post',
    data: data
  })
}

// 修改房源
export function updateRoom(data) {
  return request({
    url: '/api/room',
    method: 'put',
    data: data
  })
}

// 删除房源
export function delRoom(id) {
  return request({
    url: '/api/room/' + id,
    method: 'delete'
  })
}
