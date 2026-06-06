import request from '@/utils/request'

// ==================== 查询接口 ====================

// 查询评价列表（基础分页查询）
export function listComment(query) {
  return request({
    url: '/api/comment/list',
    method: 'get',
    params: query
  })
}

// 查询评价列表（带用户、酒店、房型信息）
export function listCommentWithUserInfo(query) {
  return request({
    url: '/api/comment/listWithUserInfo',
    method: 'get',
    params: query
  })
}

// 查询评价详细
export function getComment(id) {
  return request({
    url: '/api/comment/' + id,
    method: 'get'
  })
}

// ==================== 用户端接口 ====================

// 查询我的评价列表
export function listMyComments(query) {
  return request({
    url: '/api/user/comment/list',
    method: 'get',
    params: query
  })
}

// 用户提交评价
export function submitComment(data) {
  return request({
    url: '/api/user/comment',
    method: 'post',
    data: data
  })
}

// 删除我的评价
export function deleteMyComment(id) {
  return request({
    url: '/api/user/comment/' + id,
    method: 'delete'
  })
}

// 检查订单是否可以评价
export function canComment(orderId) {
  return request({
    url: '/api/user/comment/canComment/' + orderId,
    method: 'get'
  })
}

// 我的评价统计
export function myCommentStatistics() {
  return request({
    url: '/api/user/comment/statistics',
    method: 'get'
  })
}

// 查询指定酒店我的评价
export function myHotelComment(hotelId) {
  return request({
    url: '/api/user/comment/hotel/' + hotelId,
    method: 'get'
  })
}

// ==================== 管理端接口 ====================

// 添加评价（管理端）
export function addComment(data) {
  return request({
    url: '/api/comment',
    method: 'post',
    data: data
  })
}

// 回复评价
export function replyComment(id, replyContent) {
  return request({
    url: '/api/comment/' + id + '/reply',
    method: 'put',
    params: { replyContent }
  })
}

// 删除评价
export function delComment(id) {
  return request({
    url: '/api/comment/' + id,
    method: 'delete'
  })
}

// 批量删除评价
export function batchDelComment(ids) {
  return request({
    url: '/api/comment/batch',
    method: 'delete',
    data: ids
  })
}

// ==================== 统计接口 ====================

// 获取评分统计
export function getScoreStatistics(query) {
  return request({
    url: '/api/comment/statistics',
    method: 'get',
    params: query
  })
}

// 获取酒店评分分布统计
export function getHotelScoreDistribution(hotelId) {
  return request({
    url: '/api/comment/statistics/hotel/' + hotelId,
    method: 'get'
  })
}

// 批量获取酒店平均评分
export function getHotelsAverageScore(hotelIds) {
  return request({
    url: '/api/comment/statistics/hotels',
    method: 'post',
    data: hotelIds
  })
}

// ==================== 互动接口 ====================

// 点赞评价
export function likeComment(id) {
  return request({
    url: '/api/comment/' + id + '/like',
    method: 'post'
  })
}

// 取消点赞
export function unlikeComment(id) {
  return request({
    url: '/api/comment/' + id + '/unlike',
    method: 'post'
  })
}

// ==================== 审核接口 ====================

// 审核评价（status: 1=通过 2=拒绝）
export function auditComment(id, status) {
  return request({
    url: '/api/comment/' + id + '/audit',
    method: 'put',
    params: { status }
  })
}
