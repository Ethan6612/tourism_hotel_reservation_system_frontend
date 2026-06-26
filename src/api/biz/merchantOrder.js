import request from '@/utils/request'

// 查询商户订单列表
export function listMerchantOrder(query) {
  return request({
    url: '/api/merchant/order/list',
    method: 'get',
    params: query
  })
}

// 查询商户订单详情
export function getMerchantOrder(id) {
  return request({
    url: '/api/merchant/order/' + id,
    method: 'get'
  })
}

// 办理入住
export function checkinOrder(id, remark) {
  return request({
    url: '/api/merchant/order/' + id + '/checkin',
    method: 'put',
    params: { remark }
  })
}

// 办理退房
export function checkoutOrder(id, remark) {
  return request({
    url: '/api/merchant/order/' + id + '/checkout',
    method: 'put',
    params: { remark }
  })
}

// 取消订单
export function cancelOrder(id, reason) {
  return request({
    url: '/api/merchant/order/' + id + '/cancel',
    method: 'put',
    params: { reason }
  })
}

// 修改备注
export function updateRemark(id, remark) {
  return request({
    url: '/api/merchant/order/' + id + '/remark',
    method: 'put',
    params: { remark }
  })
}
