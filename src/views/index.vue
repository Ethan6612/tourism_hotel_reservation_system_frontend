<template>
  <div class="app-container dashboard">
    <el-row :gutter="20" class="dashboard-stats">
      <el-col :xs="12" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon hotel-icon">
              <el-icon :size="36"><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalHotels }}</div>
              <div class="stat-label">总酒店数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon available-icon">
              <el-icon :size="36"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.availableRooms }}</div>
              <div class="stat-label">可用房间</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon occupied-icon">
              <el-icon :size="36"><DocumentChecked /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.occupiedRooms }}</div>
              <div class="stat-label">已入住房间</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon order-icon">
              <el-icon :size="36"><Tickets /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalOrders }}</div>
              <div class="stat-label">今日订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="dashboard-charts">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>房型分布统计</span>
            </div>
          </template>
          <div ref="roomTypeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>本周入住趋势</span>
            </div>
          </template>
          <div ref="occupancyTrendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>热门酒店排行</span>
            </div>
          </template>
          <div class="rank-list">
            <div v-for="(hotel, index) in hotHotels" :key="index" class="rank-item">
              <span :class="['rank-number', { top: index < 3 }]">{{ index + 1 }}</span>
              <span class="rank-title">{{ hotel.name }}</span>
              <span class="rank-count">{{ hotel.orderCount }}单</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="dashboard-tables">
      <el-col :xs="24" :sm="24" :lg="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span>热门酒店</span>
              <el-button type="primary" link @click="viewAllHotels">查看全部</el-button>
            </div>
          </template>
          <el-table :data="hotHotels" style="width: 100%" max-height="300">
            <el-table-column label="排名" width="70" align="center">
              <template #default="scope">
                <el-tag :type="scope.$index < 3 ? 'danger' : 'info'" effect="dark">
                  {{ scope.$index + 1 }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="酒店名称" />
            <el-table-column prop="location" label="位置" width="150" />
            <el-table-column prop="orderCount" label="订单数" width="100" align="center" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span>最新订单</span>
              <el-button type="primary" link @click="viewNewOrders">查看全部</el-button>
            </div>
          </template>
          <el-table :data="newOrders" style="width: 100%" max-height="300">
            <el-table-column prop="orderNo" label="订单号" width="120" />
            <el-table-column prop="hotelName" label="酒店名称" />
            <el-table-column prop="roomType" label="房型" width="120" />
            <el-table-column prop="createdTime" label="下单时间" width="120" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
import { ref, onMounted, nextTick } from 'vue'
import { OfficeBuilding, CircleCheck, DocumentChecked, Tickets } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'

const router = useRouter()
const roomTypeChartRef = ref(null)
const occupancyTrendChartRef = ref(null)

const statistics = ref({
  totalHotels: 0,
  availableRooms: 0,
  occupiedRooms: 0,
  totalOrders: 0
})

const hotHotels = ref([
  { name: '北京国际大酒店', location: '北京市朝阳区', orderCount: 256 },
  { name: '上海外滩希尔顿', location: '上海市黄浦区', orderCount: 242 },
  { name: '广州花园酒店', location: '广州市越秀区', orderCount: 228 },
  { name: '深圳福田香格里拉', location: '深圳市福田区', orderCount: 215 },
  { name: '杭州西湖索菲特', location: '杭州市上城区', orderCount: 198 },
  { name: '成都天府丽都喜来登', location: '成都市青羊区', orderCount: 187 },
  { name: '三亚亚特兰蒂斯', location: '三亚市海棠区', orderCount: 176 },
  { name: '西安威斯汀', location: '西安市雁塔区', orderCount: 165 },
  { name: '南京金陵饭店', location: '南京市鼓楼区', orderCount: 154 },
  { name: '武汉万达瑞华', location: '武汉市武昌区', orderCount: 143 }
])

const newOrders = ref([
  { orderNo: 'ORD2025051901', hotelName: '北京国际大酒店', roomType: '豪华大床房', createdTime: '2025-05-19 14:30' },
  { orderNo: 'ORD2025051902', hotelName: '上海外滩希尔顿', roomType: '行政双床房', createdTime: '2025-05-19 13:25' },
  { orderNo: 'ORD2025051903', hotelName: '广州花园酒店', roomType: '商务套房', createdTime: '2025-05-19 12:15' },
  { orderNo: 'ORD2025051904', hotelName: '深圳福田香格里拉', roomType: '标准大床房', createdTime: '2025-05-19 11:40' }
])

function goTarget(href) {
  window.open(href, '_blank')
}

function initStatistics() {
  statistics.value = {
    totalHotels: 58,
    availableRooms: 342,
    occupiedRooms: 158,
    totalOrders: 89
  }
}

function initRoomTypeChart() {
  if (!roomTypeChartRef.value) return
  const chart = echarts.init(roomTypeChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: '房型分布',
        type: 'pie',
        radius: '60%',
        center: ['60%', '50%'],
        data: [
          { value: 120, name: '标准大床房' },
          { value: 95, name: '豪华双床房' },
          { value: 78, name: '商务套房' },
          { value: 56, name: '行政大床房' },
          { value: 35, name: '总统套房' },
          { value: 16, name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

function initOccupancyTrendChart() {
  if (!occupancyTrendChartRef.value) return
  const chart = echarts.init(occupancyTrendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '入住人数',
        type: 'line',
        smooth: true,
        data: [180, 195, 170, 210, 245, 320, 290],
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.5)'
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.01)'
            }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

function viewAllHotels() {
  router.push('/biz/hotel')
}

function viewNewOrders() {
  router.push('/biz/order')
}

onMounted(() => {
  initStatistics()
  nextTick(() => {
    initRoomTypeChart()
    initOccupancyTrendChart()
  })
})
</script>

<style scoped lang="scss">
.dashboard {
  padding: 20px;

  .dashboard-header {
    margin-bottom: 20px;

    h2 {
      margin-top: 0;
      color: #303133;
    }

    p {
      color: #606266;
      line-height: 1.8;
      margin-bottom: 10px;
    }
  }

  .dashboard-stats {
    margin-bottom: 20px;

    .stat-card {
      transition: all 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      .stat-content {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 10px 0;

        .stat-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          &.hotel-icon {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
          }

          &.available-icon {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: #fff;
          }

          &.occupied-icon {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: #fff;
          }

          &.order-icon {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            color: #fff;
          }
        }

        .stat-info {
          text-align: center;

          .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #303133;
            margin-bottom: 5px;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }
  }

  .dashboard-charts {
    margin-bottom: 20px;

    .chart-card {
      height: 100%;

      .chart-container {
        height: 280px;
        width: 100%;
      }

      .rank-list {
        height: 280px;
        overflow-y: auto;

        .rank-item {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .rank-number {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #e0e0e0;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            margin-right: 12px;

            &.top {
              background: #f56c6c;
            }
          }

          .rank-title {
            flex: 1;
            color: #303133;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .rank-count {
            color: #909399;
            font-size: 12px;
            margin-left: 10px;
          }
        }
      }
    }
  }

  .dashboard-tables {
    .table-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        font-size: 16px;
      }
    }
  }
}

:deep(.el-card__header) {
  padding: 15px 20px;
}
</style>
