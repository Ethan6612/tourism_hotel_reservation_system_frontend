import request from '@/utils/request'

// ==================== 酒店分类管理 ====================

// 分页查询分类列表
export function listCategory(query) {
  return request({
    url: '/api/category/query',
    method: 'post',
    data: query
  })
}

// 获取分类详情
export function getCategory(categoryId) {
  return request({
    url: '/api/category/' + categoryId,
    method: 'get'
  })
}

// 新增分类
export function addCategory(data) {
  return request({
    url: '/api/category',
    method: 'post',
    data: data
  })
}

// 编辑分类
export function updateCategory(data) {
  return request({
    url: '/api/category',
    method: 'put',
    data: data
  })
}

// 删除分类
export function delCategory(categoryId) {
  return request({
    url: '/api/category/' + categoryId,
    method: 'delete'
  })
}

// 修改分类状态
export function updateCategoryStatus(categoryId, status) {
  return request({
    url: '/api/category/' + categoryId + '/status/' + status,
    method: 'put'
  })
}

// 下拉选择列表（启用状态的分类）
export function selectCategory() {
  return request({
    url: '/api/category/select',
    method: 'get'
  })
}
