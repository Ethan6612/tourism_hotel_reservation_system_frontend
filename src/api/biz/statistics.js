import request from '@/utils/request'

// ==================== 商户端数据统计 ====================

// 商户仪表盘
// 返回: { hotelCount, roomCount, orderCount, todayOrderCount, totalRevenue, monthRevenue, commentCount, averageScore, pendingCount }
export function getMerchantDashboard() {
  return request({
    url: '/api/merchant/statistics/dashboard',
    method: 'get'
  })
}
