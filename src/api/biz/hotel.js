import request from '@/utils/request'

// ==================== 商户端酒店管理 ====================

// 分页查询我的酒店（自动过滤，只返回商户自己的酒店）
export function listHotel(query) {
  return request({
    url: '/api/merchant/hotel/query',
    method: 'post',
    headers: { repeatSubmit: false },
    data: query
  })
}

// 查看酒店详情
export function getHotel(id) {
  return request({
    url: '/api/merchant/hotel/' + id,
    method: 'get'
  })
}

// 新增酒店（无需传businessId，后端自动绑定商户）
export function addHotel(data) {
  return request({
    url: '/api/merchant/hotel',
    method: 'post',
    data: data
  })
}

// 编辑酒店
export function updateHotel(data) {
  return request({
    url: '/api/merchant/hotel',
    method: 'put',
    data: data
  })
}

// 删除酒店
export function delHotel(id) {
  return request({
    url: '/api/merchant/hotel/' + id,
    method: 'delete'
  })
}

// 修改酒店状态（0营业中/1草稿/2待审核/3已下架/4已冻结）
export function updateHotelStatus(id, status) {
  return request({
    url: '/api/merchant/hotel/' + id + '/status/' + status,
    method: 'put'
  })
}

// 提交上架申请
export function submitHotelAudit(id) {
  return request({
    url: '/api/merchant/hotel/' + id + '/submitAudit',
    method: 'put'
  })
}
