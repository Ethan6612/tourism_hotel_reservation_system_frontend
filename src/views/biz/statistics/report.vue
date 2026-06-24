<template>
  <div class="app-container">
    <div class="page-top mb8">
      <h2>📋 营收报表</h2>
      <p class="subtitle">按时间段查看营收数据并导出Excel报表</p>
    </div>

    <!-- 日期筛选 -->
    <el-card class="filter-card mb8">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :shortcuts="dateShortcuts"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="loadReport">查询</el-button>
          <el-button icon="Download" type="success" @click="handleExport" :loading="exportLoading">导出Excel</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 汇总卡片 -->
    <el-row :gutter="20" class="stats-row" v-loading="loading">
      <el-col :xs="12" :sm="6">
        <div class="stat-card revenue-total-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <div class="stat-value">¥{{ formatAmount(report.totalRevenue) }}</div>
            <div class="stat-label">总收入</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card order-total-card">
          <div class="stat-icon">📋</div>
          <div class="stat-info">
            <div class="stat-value">{{ report.totalOrders || 0 }}</div>
            <div class="stat-label">总订单数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card daily-revenue-card">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <div class="stat-value">¥{{ formatAmount(report.dailyAvgRevenue) }}</div>
            <div class="stat-label">日均收入</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card daily-order-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-value">{{ report.dailyAvgOrders || 0 }}</div>
            <div class="stat-label">日均订单</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 趋势图 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="24">
        <el-card class="chart-box">
          <template #header>
            <div class="chart-header">
              <span>📈 营收趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container-lg" v-loading="loading"></div>
          <el-empty v-if="!loading && (!report.details || report.details.length === 0)" description="暂无数据" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 明细表格 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="24">
        <el-card class="chart-box">
          <template #header>
            <div class="chart-header">
              <span>📝 每日明细</span>
            </div>
          </template>
          <el-table :data="report.details || []" v-loading="loading" stripe size="small" max-height="400">
            <el-table-column label="日期" prop="date" min-width="120" />
            <el-table-column label="收入(元)" prop="revenue" min-width="150" align="right">
              <template #default="scope">
                <span class="revenue-text">¥{{ formatAmount(scope.row.revenue) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="订单数" prop="orderCount" width="100" align="center" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="RevenueReport">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getRevenueReport, exportRevenueReport } from '@/api/biz/statistics'

const { proxy } = getCurrentInstance()

const loading = ref(false)
const exportLoading = ref(false)
const trendChartRef = ref(null)

const dateRange = ref([])
const queryParams = ref({ beginTime: '', endTime: '' })

const report = ref({
  totalRevenue: 0,
  totalOrders: 0,
  dailyAvgRevenue: 0,
  dailyAvgOrders: 0,
  details: []
})

const dateShortcuts = [
  { text: '最近7天', value: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 6); return [s, e] } },
  { text: '最近30天', value: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 29); return [s, e] } },
  { text: '本月', value: () => { const e = new Date(); const s = new Date(); s.setDate(1); return [s, e] } },
  { text: '上月', value: () => { const e = new Date(); e.setDate(0); const s = new Date(); s.setDate(0); s.setDate(1); return [s, e] } }
]

function formatAmount(val) {
  if (val == null || val === 0) return '0'
  const num = Number(val)
  if (num >= 10000) return (num / 10000).toFixed(2) + '万'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function handleDateChange(val) {
  if (val && val.length === 2) {
    queryParams.value.beginTime = val[0]
    queryParams.value.endTime = val[1]
  } else {
    queryParams.value.beginTime = ''
    queryParams.value.endTime = ''
  }
}

async function loadReport() {
  loading.value = true
  try {
    const res = await getRevenueReport(queryParams.value)
    if (res.data) {
      report.value = res.data
    }
    await nextTick()
    initTrendChart()
  } catch (err) {
    console.error('加载营收报表失败:', err)
    proxy.$modal.msgError('加载营收报表失败')
  }
  loading.value = false
}

function initTrendChart() {
  if (!trendChartRef.value) return
  const chart = echarts.init(trendChartRef.value)
  const details = report.value.details || []
  const dates = details.map(d => d.date || '')
  const revenues = details.map(d => Number(d.revenue || 0))
  const orders = details.map(d => Number(d.orderCount || 0))

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let html = params[0].axisValue + '<br/>'
        params.forEach(p => {
          if (p.seriesName === '收入') {
            html += p.marker + p.seriesName + ': ¥' + Number(p.value).toLocaleString() + '<br/>'
          } else {
            html += p.marker + p.seriesName + ': ' + p.value
          }
        })
        return html
      }
    },
    legend: { data: ['收入', '订单数'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dates.length > 0 ? dates : ['暂无数据'],
      axisLabel: { fontSize: 11, rotate: dates.length > 14 ? 30 : 0 }
    },
    yAxis: [
      { type: 'value', name: '收入(元)', axisLabel: { formatter: v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v } },
      { type: 'value', name: '订单数', minInterval: 1 }
    ],
    series: [
      {
        name: '收入', type: 'line', smooth: true,
        data: dates.length > 0 ? revenues : [0],
        symbol: 'circle', symbolSize: 6,
        itemStyle: { color: '#f56c6c' },
        lineStyle: { width: 2, color: '#f56c6c' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
          [{ offset: 0, color: 'rgba(245,108,108,0.25)' }, { offset: 1, color: 'rgba(245,108,108,0.02)' }]) }
      },
      {
        name: '订单数', type: 'bar', yAxisIndex: 1,
        data: dates.length > 0 ? orders : [0],
        barWidth: '50%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1,
            [{ offset: 0, color: '#409eff' }, { offset: 1, color: '#79bbff' }])
        }
      }
    ]
  })

  window.addEventListener('resize', () => chart.resize())
}

async function handleExport() {
  exportLoading.value = true
  try {
    const res = await exportRevenueReport(queryParams.value)
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '营收报表.xlsx'
    a.click()
    window.URL.revokeObjectURL(url)
    proxy.$modal.msgSuccess('导出成功')
  } catch (err) {
    console.error('导出失败:', err)
    proxy.$modal.msgError('导出失败')
  }
  exportLoading.value = false
}

onMounted(() => {
  // 默认加载最近7天
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 6)
  dateRange.value = [start, end]
  queryParams.value.beginTime = formatDate(start)
  queryParams.value.endTime = formatDate(end)
  loadReport()
})

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
</script>

<style scoped lang="scss">
.page-top {
  h2 { font-size: 22px; font-weight: 700; color: #333; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #999; margin: 0; }
}
.filter-card { border-radius: 10px; margin-bottom: 16px; }
.stats-row { margin-bottom: 16px; }

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
  background: #fff;
  border-radius: 10px;
  transition: all 0.3s;
  box-shadow: 0 1px 8px rgba(0,0,0,0.04);
  margin-bottom: 8px;

  .stat-icon { font-size: 28px; }
  .stat-value { font-size: 22px; font-weight: 700; color: #333; }
  .stat-label { font-size: 12px; color: #999; margin-top: 2px; }
}

.revenue-total-card { border-left: 3px solid #f56c6c; }
.order-total-card { border-left: 3px solid #e6a23c; }
.daily-revenue-card { border-left: 3px solid #9b59b6; }
.daily-order-card { border-left: 3px solid #67c23a; }

.charts-row { margin-bottom: 20px; }
.chart-box {
  border-radius: 10px;
  margin-bottom: 16px;
  .chart-header { display: flex; align-items: center; justify-content: space-between; }
  .chart-container-lg { height: 350px; width: 100%; }
}

.revenue-text { color: #f56c6c; font-weight: 600; }
</style>
