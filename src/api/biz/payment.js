import request from '@/utils/request'

// 查询支付列表
export function listPayment(query) {
  return request({
    url: '/api/payment/list',
    method: 'get',
    params: query
  })
}

// 查询支付详细
export function getPayment(id) {
  return request({
    url: '/api/payment/' + id,
    method: 'get'
  })
}

// 创建支付记录
export function createPayment(data) {
  return request({
    url: '/api/payment',
    method: 'post',
    data: data
  })
}

// 更新支付状态
export function updatePaymentStatus(id, status, transactionId) {
  return request({
    url: '/api/payment/' + id + '/status',
    method: 'put',
    params: { status, transactionId }
  })
}
