import request from '@/utils/request'

// ==================== 管理员端酒店审核 ====================

// 分页查询审核列表
export function listHotelAudit(query) {
  return request({
    url: '/api/hotelAudit/query',
    method: 'post',
    data: query
  }).catch(err => {
    console.error('[hotelAudit] listHotelAudit 请求失败:', err)
    return { data: { rows: [], total: 0 } }
  })
}

// 获取审核详情
export function getHotelAudit(id) {
  return request({
    url: '/api/hotelAudit/' + id,
    method: 'get'
  }).catch(err => {
    console.error('[hotelAudit] getHotelAudit 请求失败:', err)
    return { data: null }
  })
}

// 审核通过
export function approveHotelAudit(hotelId, auditOpinion) {
  return request({
    url: '/api/hotelAudit/' + hotelId + '/approve',
    method: 'put',
    data: { auditOpinion }
  })
}

// 审核驳回
export function rejectHotelAudit(hotelId, auditOpinion) {
  return request({
    url: '/api/hotelAudit/' + hotelId + '/reject',
    method: 'put',
    data: { auditOpinion }
  })
}

// 查询待审核数量
export function getPendingCount() {
  return request({
    url: '/api/hotelAudit/pendingCount',
    method: 'get'
  }).catch(err => {
    console.error('[hotelAudit] getPendingCount 请求失败:', err)
    return { data: 0 }
  })
}
