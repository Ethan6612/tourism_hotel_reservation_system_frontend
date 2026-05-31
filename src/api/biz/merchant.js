import request from '@/utils/request'

// 查询商户列表
export function listMerchant(query) {
  return request({
    url: '/api/merchant/query',
    method: 'post',
    data: query
  })
}

// 查询商户详细
export function getMerchant(id) {
  return request({
    url: '/api/merchant/' + id,
    method: 'get'
  })
}

// 新增商户
export function addMerchant(data) {
  return request({
    url: '/api/merchant',
    method: 'post',
    data: data
  })
}

// 修改商户
export function updateMerchant(data) {
  return request({
    url: '/api/merchant',
    method: 'put',
    data: data
  })
}

// 删除商户
export function delMerchant(id) {
  return request({
    url: '/api/merchant/' + id,
    method: 'delete'
  })
}

// 冻结商户
export function freezeMerchant(id) {
  return request({
    url: '/api/merchant/' + id + '/freeze',
    method: 'put'
  })
}

// 解冻商户
export function unfreezeMerchant(id) {
  return request({
    url: '/api/merchant/' + id + '/unfreeze',
    method: 'put'
  })
}

// 注销商户
export function deregisterMerchant(id) {
  return request({
    url: '/api/merchant/' + id + '/deregister',
    method: 'put'
  })
}

// 检查营业执照号是否存在
export function checkLicenseNo(licenseNo) {
  return request({
    url: '/api/merchant/checkLicense/' + licenseNo,
    method: 'get'
  })
}

// 查询审核记录列表
export function listMerchantAudit(query) {
  return request({
    url: '/api/merchant/audit/query',
    method: 'post',
    data: query
  })
}

// 查询审核记录详细
export function getMerchantAudit(id) {
  return request({
    url: '/api/merchant/audit/' + id,
    method: 'get'
  })
}

// 提交审核申请
export function submitMerchantAudit(data) {
  return request({
    url: '/api/merchant/audit',
    method: 'post',
    data: data
  })
}

// 执行审核操作
export function processMerchantAudit(data) {
  return request({
    url: '/api/merchant/audit',
    method: 'put',
    data: data
  })
}