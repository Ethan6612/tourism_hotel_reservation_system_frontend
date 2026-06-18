import request from '@/utils/request'

// ==================== 商户端通知中心 ====================

// 通知列表
export function listMerchantNotice(query) {
  return request({
    url: '/api/merchant/notice/list',
    method: 'get',
    params: query
  })
}

// 通知详情
export function getMerchantNotice(id) {
  return request({
    url: '/api/merchant/notice/' + id,
    method: 'get'
  })
}
