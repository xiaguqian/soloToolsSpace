<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon orders">
          <el-icon><component :is="ShoppingBag" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.todayOrders }}</div>
          <div class="stat-label">今日订单</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon amount">
          <el-icon><component :is="Wallet" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">¥{{ stats.todayAmount.toFixed(2) }}</div>
          <div class="stat-label">今日交易额</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon users">
          <el-icon><component :is="Users" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalUsers }}</div>
          <div class="stat-label">用户总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon products">
          <el-icon><component :is="Package" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalProducts }}</div>
          <div class="stat-label">商品总数</div>
        </div>
      </div>
    </div>
    
    <div class="charts-section">
      <div class="chart-card">
        <h3>订单趋势</h3>
        <div class="chart">
          <canvas ref="trendChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ShoppingBag, Wallet, Users, Package } from '@element-plus/icons-vue'
import { statisticsApi } from '../api'

const stats = ref({
  todayOrders: 0,
  todayAmount: 0,
  totalOrders: 0,
  totalAmount: 0,
  totalUsers: 0,
  totalProducts: 0
})

const loadStats = async () => {
  try {
    const res = await statisticsApi.dashboard()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载数据失败', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
}

.stat-icon.orders {
  background: #e6f7ff;
  color: #1890ff;
}

.stat-icon.amount {
  background: #f6ffed;
  color: #52c41a;
}

.stat-icon.users {
  background: #fff7e6;
  color: #fa8c16;
}

.stat-icon.products {
  background: #f9f0ff;
  color: #722ed1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr;
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

.chart {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>