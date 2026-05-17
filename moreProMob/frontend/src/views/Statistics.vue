<template>
  <div class="statistics">
    <div class="period-select">
      <span>统计周期:</span>
      <el-radio-group v-model="period" @change="loadData">
        <el-radio label="day">按日</el-radio>
        <el-radio label="week">按周</el-radio>
        <el-radio label="month">按月</el-radio>
      </el-radio-group>
    </div>
    
    <div class="stats-section">
      <div class="chart-card">
        <h3>订单趋势</h3>
        <div class="chart-container">
          <div class="chart-bars">
            <div v-for="(item, index) in orderTrend" :key="index" class="bar-item">
              <div class="bar-wrapper">
                <div class="bar" :style="{ height: getBarHeight(item.count) + '%' }"></div>
              </div>
              <div class="bar-label">{{ getLabel(item) }}</div>
              <div class="bar-value">订单: {{ item.count }}</div>
              <div class="bar-amount">金额: ¥{{ item.amount?.toFixed(0) || 0 }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chart-card">
        <h3>商品销量排行</h3>
        <div class="ranking-list">
          <div v-for="(item, index) in productRanking" :key="item.id" class="ranking-item">
            <span class="rank">{{ index + 1 }}</span>
            <span class="name">{{ item.name }}</span>
            <span class="sales">销量: {{ item.sales || 0 }}</span>
            <span class="price">¥{{ item.price }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { statisticsApi } from '../api'

const period = ref('day')
const orderTrend = ref([])
const productRanking = ref([])

const loadData = async () => {
  try {
    const [trendRes, rankingRes] = await Promise.all([
      statisticsApi.orderTrend({ period: period.value }),
      statisticsApi.productRanking({ limit: 10 })
    ])
    
    if (trendRes.code === 200) {
      orderTrend.value = trendRes.data
    }
    
    if (rankingRes.code === 200) {
      productRanking.value = rankingRes.data
    }
  } catch (error) {
    console.error('加载数据失败', error)
  }
}

const getBarHeight = (count) => {
  const max = Math.max(...orderTrend.value.map(item => item.count || 0), 1)
  return (count / max) * 100
}

const getLabel = (item) => {
  if (period.value === 'day') return item.date?.slice(5) || ''
  if (period.value === 'week') return '第' + item.week?.split('-')[1] + '周'
  return item.month || ''
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.statistics {
  padding: 20px;
}

.period-select {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
}

.period-select span {
  font-weight: bold;
}

.stats-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chart-card h3 {
  margin-bottom: 20px;
  font-size: 16px;
  color: #333;
}

.chart-container {
  height: 250px;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200px;
  padding-top: 20px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar-wrapper {
  width: 30px;
  height: 150px;
  background: #f0f0f0;
  border-radius: 4px;
  display: flex;
  align-items: flex-end;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, #1890ff 0%, #096dd9 100%);
  border-radius: 4px;
  transition: height 0.3s;
}

.bar-label {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.bar-value, .bar-amount {
  font-size: 11px;
  color: #999;
}

.ranking-list {
  max-height: 300px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.ranking-item:last-child {
  border-bottom: none;
}

.rank {
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  margin-right: 12px;
}

.ranking-item:nth-child(1) .rank {
  background: #ffd700;
  color: #333;
}

.ranking-item:nth-child(2) .rank {
  background: #c0c0c0;
  color: #333;
}

.ranking-item:nth-child(3) .rank {
  background: #cd7f32;
  color: #fff;
}

.name {
  flex: 1;
  font-size: 14px;
}

.sales {
  margin-right: 15px;
  font-size: 13px;
  color: #666;
}

.price {
  font-size: 13px;
  color: #1890ff;
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .bar-wrapper {
    width: 20px;
  }
  
  .bar-label, .bar-value, .bar-amount {
    font-size: 10px;
  }
}
</style>