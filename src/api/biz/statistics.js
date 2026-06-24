import request from '@/utils/request'

// ==================== 商户端数据统计 ====================

// 商户仪表盘
// 返回: { hotelCount, roomCount, orderCount, todayOrderCount, totalRevenue, monthRevenue, commentCount, averageScore, pendingCount, revenueTrend, orderCountTrend }
export function getMerchantDashboard() {
  return request({
    url: '/api/merchant/statistics/dashboard',
    method: 'get'
  })
}

// 获取营收报表（支持时间段筛选）
export function getRevenueReport(params) {
  return request({
    url: '/api/merchant/statistics/revenue',
    method: 'get',
    params
  })
}

// 获取营收趋势
export function getRevenueTrend(params) {
  return request({
    url: '/api/merchant/statistics/trend',
    method: 'get',
    params
  })
}

// 导出营收报表Excel
export function exportRevenueReport(params) {
  return request({
    url: '/api/merchant/statistics/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
