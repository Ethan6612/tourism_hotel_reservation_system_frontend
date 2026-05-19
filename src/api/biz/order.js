import request from '@/utils/request'

// 查询订单列表
export function listOrder(query) {
  return request({
    url: '/api/order/list',
    method: 'get',
    params: query
  })
}

// 查询订单详细
export function getOrder(id) {
  return request({
    url: '/api/order/' + id,
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

// 更新订单状态
export function updateOrderStatus(id, status) {
  return request({
    url: '/api/order/' + id + '/status',
    method: 'put',
    params: { status }
  })
}
