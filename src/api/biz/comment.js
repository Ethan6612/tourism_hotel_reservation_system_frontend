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

// 修改我的评价
export function updateMyComment(data) {
  return request({
    url: '/api/user/comment',
    method: 'put',
    data: data
  })
}

// 追加评价
export function appendComment(id, content) {
  return request({
    url: '/api/user/comment/' + id + '/append',
    method: 'put',
    params: { content }
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

// 审核申诉（appealStatus: 2=申诉通过 3=申诉驳回）
export function auditAppeal(id, appealStatus, remark) {
  return request({
    url: '/api/comment/' + id + '/auditAppeal',
    method: 'put',
    params: { appealStatus, remark }
  })
}

// ==================== 商户端接口 ====================

// 查询商户下所有酒店的评价
export function listMerchantComments(query) {
  return request({
    url: '/api/merchant/comment/list',
    method: 'get',
    params: query
  })
}

// 评价详情
export function getMerchantComment(id) {
  return request({
    url: '/api/merchant/comment/' + id,
    method: 'get'
  })
}

// 商家回复评价
export function merchantReplyComment(id, replyContent) {
  return request({
    url: '/api/merchant/comment/' + id + '/reply',
    method: 'put',
    params: { replyContent }
  })
}

// 商家申诉评价
export function appealComment(id, reason) {
  return request({
    url: '/api/merchant/comment/' + id + '/appeal',
    method: 'put',
    params: { reason }
  })
}

// 商户评价统计概览
export function getMerchantCommentStatistics() {
  return request({
    url: '/api/merchant/comment/statistics',
    method: 'get'
  })
}

// 指定酒店评价统计
export function getMerchantHotelCommentStatistics(hotelId) {
  return request({
    url: '/api/merchant/comment/statistics/hotel/' + hotelId,
    method: 'get'
  })
}

// ==================== 酒店维度查询 ====================

// 按酒店分组查询评价（管理端用）
export function listCommentGroupByHotel(query) {
  return request({
    url: '/api/comment/groupByHotel',
    method: 'get',
    params: query
  })
}

// 查询某个酒店的所有评价
export function listCommentByHotel(hotelId, query) {
  return request({
    url: '/api/comment/byHotel/' + hotelId,
    method: 'get',
    params: query
  })
}
