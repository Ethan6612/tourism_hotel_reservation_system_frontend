import request from '@/utils/request'

// 查询支付记录列表
export function listPayment(query) {
  return request({
    url: '/api/payment/list',
    method: 'get',
    params: query
  })
}

// 查询支付记录详情
export function getPayment(id) {
  return request({
    url: '/api/payment/' + id,
    method: 'get'
  })
}

// 根据订单ID查询支付记录
export function getPaymentByOrderId(orderId) {
  return request({
    url: '/api/payment/byOrder/' + orderId,
    method: 'get'
  })
}
