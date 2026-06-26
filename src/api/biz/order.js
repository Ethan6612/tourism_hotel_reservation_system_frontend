import request from '@/utils/request'

// 查询订单列表
export function listOrder(query) {
  return request({
    url: '/api/order/list',
    method: 'get',
    params: query
  })
}

// 查询订单详情
export function getOrder(id) {
  return request({
    url: '/api/order/' + id,
    method: 'get'
  })
}

// 取消订单
export function cancelOrder(id, reason) {
  return request({
    url: '/api/order/' + id + '/cancel',
    method: 'put',
    params: { reason }
  })
}

// 完成订单
export function completeOrder(id) {
  return request({
    url: '/api/order/' + id + '/complete',
    method: 'put'
  })
}

// 申请退款
export function refundOrder(id, reason) {
  return request({
    url: '/api/order/' + id + '/refund',
    method: 'put',
    params: { reason }
  })
}

// 确认退款
export function confirmRefund(id) {
  return request({
    url: '/api/order/' + id + '/confirmRefund',
    method: 'put'
  })
}

// 驳回退款
export function rejectRefund(id, reason) {
  return request({
    url: '/api/order/' + id + '/rejectRefund',
    method: 'put',
    params: { reason }
  })
}

// 更新订单状态
export function updateOrderStatus(id, data) {
  return request({
    url: '/api/order/' + id + '/status',
    method: 'put',
    data: data
  })
}

// 删除订单
export function delOrder(id) {
  return request({
    url: '/api/order/' + id,
    method: 'delete'
  })
}

// 批量删除订单
export function batchDelOrder(ids) {
  return request({
    url: '/api/order/batch',
    method: 'delete',
    data: ids
  })
}

// 办理入住
export function checkinOrder(id, remark) {
  return request({
    url: '/api/order/' + id + '/checkin',
    method: 'put',
    params: { remark }
  })
}

// 办理退房
export function checkoutOrder(id, remark) {
  return request({
    url: '/api/order/' + id + '/checkout',
    method: 'put',
    params: { remark }
  })
}

// 修改备注
export function updateOrderRemark(id, remark) {
  return request({
    url: '/api/order/' + id + '/remark',
    method: 'put',
    params: { remark }
  })
}
