<template>
  <div class="page-container">
    <van-nav-bar title="数据看板" />
    <van-grid :column-num="2" class="stats-grid">
      <van-grid-item icon="orders-o" text="今日订单">
        <div class="stat-value">{{ todayStats.total_count }}</div>
      </van-grid-item>
      <van-grid-item icon="wallet" text="今日营业额">
        <div class="stat-value">¥{{ todayStats.revenue.toFixed(2) }}</div>
      </van-grid-item>
      <van-grid-item icon="map-marker-o" text="堂食订单">
        <div class="stat-value">{{ todayStats.dine_in_count }}</div>
      </van-grid-item>
      <van-grid-item icon="truck" text="外卖订单">
        <div class="stat-value">{{ todayStats.takeout_count }}</div>
      </van-grid-item>
    </van-grid>
    
    <van-card title="热销商品">
      <van-list v-model="loading" :finished="finished" finished-text="" :immediate-check="false">
        <div v-for="(item, index) in hotProducts" :key="item.product_name" class="hot-item">
          <span class="rank">{{ index + 1 }}</span>
          <span class="name">{{ item.product_name }}</span>
          <span class="count">{{ item.total_quantity }}份</span>
        </div>
      </van-list>
    </van-card>
    
    <van-card title="近7天订单趋势">
      <div ref="chartRef" class="chart"></div>
    </van-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { showToast } from 'vant'
import { statistics } from '../utils/api'
import * as echarts from 'echarts'

const todayStats = ref({
  total_count: 0,
  dine_in_count: 0,
  takeout_count: 0,
  revenue: 0
})

const hotProducts = ref([])
const loading = ref(false)
const finished = ref(false)
const chartRef = ref(null)

const loadTodayStats = async () => {
  try {
    const res = await statistics.today()
    if (res.code === 200) {
      todayStats.value = res.data
    }
  } catch (error) {
    showToast('获取数据失败')
  }
}

const loadHotProducts = async () => {
  try {
    const res = await statistics.hotProducts()
    if (res.code === 200) {
      hotProducts.value = res.data
      finished.value = true
    }
  } catch (error) {
    showToast('获取热销商品失败')
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
    showToast('获取趋势数据失败')
  }
}

const renderChart = (data) => {
  const chart = echarts.init(chartRef.value)
  const dates = data.map(item => item.date.substring(5))
  const counts = data.map(item => item.count)
  
  chart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10
      }
    },
    series: [{
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
.stats-grid {
  margin: 15px;
}

:deep(.van-grid-item__icon) {
  font-size: 28px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
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
  background: #f56c6c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-right: 12px;
}

.name {
  flex: 1;
  font-size: 14px;
}

.count {
  font-size: 14px;
  color: #67c23a;
  font-weight: bold;
}

.chart {
  height: 200px;
}
</style>
