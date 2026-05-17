<template>
  <div class="dashboard">
    <div class="stats-row">
      <el-card class="stat-card">
        <div class="stat-icon order-icon">
          <el-icon><component :is="icons.ShoppingCart" /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-value">{{ todayStats.total_count }}</p>
          <p class="stat-label">今日订单</p>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon dine-icon">
          <el-icon><component :is="icons.Dining" /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-value">{{ todayStats.dine_in_count }}</p>
          <p class="stat-label">堂食订单</p>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon takeout-icon">
          <el-icon><component :is="icons.Truck" /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-value">{{ todayStats.takeout_count }}</p>
          <p class="stat-label">外卖订单</p>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-icon money-icon">
          <el-icon><component :is="icons.Wallet" /></el-icon>
        </div>
        <div class="stat-info">
          <p class="stat-value">¥{{ todayStats.revenue.toFixed(2) }}</p>
          <p class="stat-label">今日营业额</p>
        </div>
      </el-card>
    </div>
    <div class="charts-row">
      <el-card class="chart-card">
        <template #header>
          <span>近7天订单趋势</span>
        </template>
        <div ref="trendChart" class="chart"></div>
      </el-card>
      <el-card class="chart-card">
        <template #header>
          <span>热销商品排行</span>
        </template>
        <div class="hot-list">
          <div v-for="(item, index) in hotProducts" :key="item.product_name" class="hot-item">
            <span class="rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
            <span class="name">{{ item.product_name }}</span>
            <span class="count">{{ item.total_quantity }}份</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Wallet, Ship, Food } from '@element-plus/icons-vue'
import { statistics } from '../utils/api'
import * as echarts from 'echarts'

const icons = { ShoppingCart, Wallet, Truck: Ship, Dining: Food }

const todayStats = ref({
  total_count: 0,
  dine_in_count: 0,
  takeout_count: 0,
  revenue: 0
})

const hotProducts = ref([])
const trendChart = ref(null)

const loadTodayStats = async () => {
  try {
    const res = await statistics.today()
    if (res.code === 200) {
      todayStats.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取今日统计失败')
  }
}

const loadHotProducts = async () => {
  try {
    const res = await statistics.hotProducts()
    if (res.code === 200) {
      hotProducts.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取热销商品失败')
  }
}

const loadTrend = async () => {
  try {
    const res = await statistics.trend()
    if (res.code === 200) {
      nextTick(() => {
        renderChart(res.data)
      })
    }
  } catch (error) {
    ElMessage.error('获取趋势数据失败')
  }
}

const renderChart = (data) => {
  const chart = echarts.init(trendChart.value)
  const dates = data.map(item => item.date)
  const counts = data.map(item => item.count)
  
  chart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        formatter: (value) => {
          return value.substring(5)
        }
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '订单数',
      type: 'line',
      smooth: true,
      data: counts,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(52, 152, 219, 0.3)' },
          { offset: 1, color: 'rgba(52, 152, 219, 0.05)' }
        ])
      },
      lineStyle: {
        color: '#3498db'
      },
      itemStyle: {
        color: '#3498db'
      }
    }]
  })
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

onMounted(() => {
  loadTodayStats()
  loadHotProducts()
  loadTrend()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: white;
}

.order-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dine-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.takeout-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.money-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin: 5px 0 0;
}

.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.chart-card {
  height: 350px;
}

.chart {
  height: calc(100% - 48px);
}

.hot-list {
  padding: 10px;
}

.hot-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.hot-item:last-child {
  border-bottom: none;
}

.rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
  margin-right: 12px;
}

.rank-1 {
  background: #f5576c;
}

.rank-2 {
  background: #667eea;
}

.rank-3 {
  background: #4facfe;
}

.rank-4, .rank-5 {
  background: #909399;
}

.name {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.count {
  font-size: 14px;
  color: #67c23a;
  font-weight: bold;
}
</style>
