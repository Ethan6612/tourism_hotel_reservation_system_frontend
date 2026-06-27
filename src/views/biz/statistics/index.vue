<template>
  <div class="app-container">
    <div class="page-top mb8">
      <h2>📊 数据统计</h2>
      <p class="subtitle">查看您旗下酒店的经营数据与统计报表</p>
    </div>

    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="8" :md="4">
        <div class="stat-card hotel-card">
          <div class="stat-icon">🏨</div>
          <div class="stat-info">
            <div class="stat-value">{{ dashboard.hotelCount }}</div>
            <div class="stat-label">酒店数量</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <div class="stat-card room-card">
          <div class="stat-icon">🚪</div>
          <div class="stat-info">
            <div class="stat-value">{{ dashboard.roomCount }}</div>
            <div class="stat-label">房型总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <div class="stat-card order-card">
          <div class="stat-icon">📋</div>
          <div class="stat-info">
            <div class="stat-value">{{ dashboard.orderCount }}</div>
            <div class="stat-label">订单总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :md="3">
        <div class="stat-card revenue-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <div class="stat-value">¥{{ formatAmount(dashboard.totalRevenue) }}</div>
            <div class="stat-label">总收入</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :md="3">
        <div class="stat-card month-card">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <div class="stat-value">¥{{ formatAmount(dashboard.monthRevenue) }}</div>
            <div class="stat-label">本月收入</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="8" :md="3">
        <div class="stat-card comment-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <div class="stat-value">{{ dashboard.averageScore }}</div>
            <div class="stat-label">平均评分</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 今日概览 + 待处理 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card today-card" @click="goToPage('/today-orders')" style="cursor:pointer">
          <div class="stat-icon">🕐</div>
          <div class="stat-info">
            <div class="stat-value">{{ dashboard.todayOrderCount }}</div>
            <div class="stat-label">今日订单</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card pending-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <div class="stat-value">{{ dashboard.pendingCount }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card comment-count-card">
          <div class="stat-icon">💬</div>
          <div class="stat-info">
            <div class="stat-value">{{ dashboard.commentCount }}</div>
            <div class="stat-label">评价总数</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 近7天趋势图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-box">
          <template #header>
            <div class="chart-header">
              <span>📈 近7天收入趋势</span>
            </div>
          </template>
          <div ref="revenueTrendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="chart-box">
          <template #header>
            <div class="chart-header">
              <span>📊 近7天订单趋势</span>
            </div>
          </template>
          <div ref="orderTrendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-box">
          <template #header>
            <div class="chart-header">
              <span>📈 评价评分分布</span>
              <el-button link type="primary" @click="loadCommentStats">刷新</el-button>
            </div>
          </template>
          <div ref="scoreChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="chart-box">
          <template #header>
            <div class="chart-header">
              <span>🏨 酒店评分排名</span>
            </div>
          </template>
          <el-table :data="commentStats" v-loading="statsLoading" stripe size="small">
            <el-table-column label="酒店" prop="hotelName" min-width="130" :show-overflow-tooltip="true" />
            <el-table-column label="平均评分" prop="averageScore" width="100" align="center">
              <template #default="scope">
                <el-rate :model-value="Number(scope.row.averageScore || 0)" disabled size="small" show-score />
              </template>
            </el-table-column>
            <el-table-column label="评价数" prop="totalComments" width="80" align="center" />
            <el-table-column label="5星" prop="fiveStarCount" width="60" align="center">
              <template #default="scope"><span class="star-5">{{ scope.row.fiveStarCount }}</span></template>
            </el-table-column>
            <el-table-column label="4星" prop="fourStarCount" width="60" align="center">
              <template #default="scope"><span class="star-4">{{ scope.row.fourStarCount }}</span></template>
            </el-table-column>
            <el-table-column label="3星" prop="threeStarCount" width="60" align="center">
              <template #default="scope"><span class="star-3">{{ scope.row.threeStarCount }}</span></template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="BizStatistics">
import { ref, onMounted, nextTick } from 'vue'

import * as echarts from 'echarts'
import { getMerchantDashboard } from '@/api/biz/statistics'
import { getMerchantCommentStatistics } from '@/api/biz/comment'


const { proxy } = getCurrentInstance()

const statsLoading = ref(false)
const scoreChartRef = ref(null)
const revenueTrendChartRef = ref(null)
const orderTrendChartRef = ref(null)
const commentStats = ref([])

const dashboard = ref({
  hotelCount: 0,
  roomCount: 0,
  orderCount: 0,
  todayOrderCount: 0,
  totalRevenue: 0,
  monthRevenue: 0,
  commentCount: 0,
  averageScore: '--',
  pendingCount: 0
})

function formatAmount(val) {
  if (val == null || val === 0) return '0'
  const num = Number(val)
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toLocaleString()
}


async function loadDashboard() {
  try {
    const res = await getMerchantDashboard()
    if (res.data) {
      dashboard.value = res.data
    }
    await nextTick()
    initRevenueTrendChart()
    initOrderTrendChart()
  } catch (err) {
    console.error('加载仪表盘数据失败:', err)
  }
}

async function loadCommentStats() {
  statsLoading.value = true
  try {
    const res = await getMerchantCommentStatistics()
    const data = res.data || res || []
    commentStats.value = Array.isArray(data) ? data : (data.list || data.rows || [])
    await nextTick()
    initScoreChart()
  } catch { /* ignore */ }
  statsLoading.value = false
}

function initRevenueTrendChart() {
  if (!revenueTrendChartRef.value) return
  const chart = echarts.init(revenueTrendChartRef.value)
  const trend = dashboard.value.revenueTrend || []
  const dates = trend.map(t => t.date || '')
  const revenues = trend.map(t => Number(t.revenue || 0))

  chart.setOption({
    tooltip: { trigger: 'axis', formatter: p => `${p[0].axisValue}<br/>收入: ¥${Number(p[0].value).toLocaleString()}` },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: dates.length > 0 ? dates : ['暂无数据'], axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', name: '收入(元)', axisLabel: { formatter: v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v } },
    series: [{
      name: '收入', type: 'line', smooth: true,
      data: dates.length > 0 ? revenues : [0],
      symbol: 'circle', symbolSize: 6,
      itemStyle: { color: '#f56c6c' },
      lineStyle: { width: 2, color: '#f56c6c' },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
        [{ offset: 0, color: 'rgba(245,108,108,0.25)' }, { offset: 1, color: 'rgba(245,108,108,0.02)' }]) }
    }]
  })
  window.addEventListener('resize', () => chart.resize())
}

function initOrderTrendChart() {
  if (!orderTrendChartRef.value) return
  const chart = echarts.init(orderTrendChartRef.value)
  const trend = dashboard.value.orderCountTrend || []
  const dates = trend.map(t => t.date || '')
  const counts = trend.map(t => Number(t.orderCount || 0))

  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: dates.length > 0 ? dates : ['暂无数据'], axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', name: '订单数', minInterval: 1 },
    series: [{
      name: '订单数', type: 'line', smooth: true,
      data: dates.length > 0 ? counts : [0],
      symbol: 'circle', symbolSize: 6,
      itemStyle: { color: '#409eff' },
      lineStyle: { width: 2, color: '#409eff' },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
        [{ offset: 0, color: 'rgba(64,158,255,0.25)' }, { offset: 1, color: 'rgba(64,158,255,0.02)' }]) }
    }]
  })
  window.addEventListener('resize', () => chart.resize())
}

function initScoreChart() {
  if (!scoreChartRef.value) return
  const chart = echarts.init(scoreChartRef.value)
  const labels = commentStats.value.map(item => item.hotelName || `酒店${item.hotelId}`)
  const values = commentStats.value.map(item => Number(item.averageScore || 0))

  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '8%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: labels.length > 0 ? labels : ['暂无数据'],
      axisLabel: { rotate: labels.length > 4 ? 30 : 0, fontSize: 11 }
    },
    yAxis: { type: 'value', name: '评分', min: 0, max: 5 },
    series: [{
      name: '平均评分',
      type: 'bar',
      data: values.length > 0 ? values : [0],
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#ff6b6b' },
          { offset: 1, color: '#ee5a24' }
        ])
      },
      barWidth: '50%',
      label: { show: true, position: 'top', fontSize: 12 }
    }]
  })

  window.addEventListener('resize', () => chart.resize())
}

onMounted(async () => {
  await loadDashboard()
  await loadCommentStats()
})
</script>

<style scoped lang="scss">
.page-top {
  h2 { font-size: 22px; font-weight: 700; color: #333; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #999; margin: 0; }
}
.stats-row { margin-bottom: 16px; }

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 1px 8px rgba(0,0,0,0.04);
  margin-bottom: 8px;

  &:hover { transform: translateY(-3px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

  .stat-icon { font-size: 28px; }
  .stat-value { font-size: 22px; font-weight: 700; color: #333; }
  .stat-label { font-size: 12px; color: #999; margin-top: 2px; }
}

.hotel-card { border-left: 3px solid #409eff; }
.room-card { border-left: 3px solid #67c23a; }
.order-card { border-left: 3px solid #e6a23c; }
.revenue-card { border-left: 3px solid #f56c6c; }
.month-card { border-left: 3px solid #9b59b6; }
.comment-card { border-left: 3px solid #1abc9c; }
.today-card { border-left: 3px solid #3498db; }
.pending-card { border-left: 3px solid #e74c3c; }
.comment-count-card { border-left: 3px solid #2ecc71; }

.charts-row { margin-bottom: 20px; }
.chart-box {
  border-radius: 10px;
  margin-bottom: 16px;
  .chart-header { display: flex; align-items: center; justify-content: space-between; }
  .chart-container { height: 280px; width: 100%; }
}

.star-5 { color: #f56c6c; font-weight: 600; }
.star-4 { color: #e6a23c; font-weight: 600; }
.star-3 { color: #409eff; font-weight: 600; }
</style>
