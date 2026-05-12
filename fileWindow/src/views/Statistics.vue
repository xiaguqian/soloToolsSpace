<template>
  <div class="statistics-container">
    <div class="header">
      <el-button @click="$router.push('/')" :icon="ArrowLeft" circle />
      <h2>数据统计</h2>
    </div>

    <div class="content">
      <el-tabs v-model="activeTab" class="custom-tabs">
        <el-tab-pane label="目录集统计" name="directories">
          <div class="chart-section">
            <h3>目录集点击次数</h3>
            <div ref="dirSetChartRef" class="chart-container"></div>
          </div>
          
          <div class="chart-section">
            <h3>目录项点击次数</h3>
            <div ref="dirItemChartRef" class="chart-container"></div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="文件集统计" name="files">
          <div class="chart-section">
            <h3>文件集点击次数</h3>
            <div ref="fileSetChartRef" class="chart-container"></div>
          </div>
          
          <div class="chart-section">
            <h3>文件项点击次数</h3>
            <div ref="fileItemChartRef" class="chart-container"></div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useStore } from '../store'
import * as echarts from 'echarts'
import { ArrowLeft } from '@element-plus/icons-vue'

const store = useStore()
const activeTab = ref('directories')
const dirSetChartRef = ref(null)
const dirItemChartRef = ref(null)
const fileSetChartRef = ref(null)
const fileItemChartRef = ref(null)

let dirSetChart = null
let dirItemChart = null
let fileSetChart = null
let fileItemChart = null

const directorySetStats = computed(() => {
  const sets = store.state.config?.directorySets || []
  const stats = store.state.stats?.directorySets || {}
  return sets.map(set => ({
    name: set.name,
    value: stats[set.id] || 0
  })).filter(item => item.value > 0)
})

const directoryItemStats = computed(() => {
  const sets = store.state.config?.directorySets || []
  const stats = store.state.stats?.directoryItems || {}
  const items = []
  sets.forEach(set => {
    (set.items || []).forEach(item => {
      const count = stats[item.id] || 0
      if (count > 0) {
        items.push({
          name: item.alias || item.name,
          value: count
        })
      }
    })
  })
  return items.sort((a, b) => b.value - a.value).slice(0, 15)
})

const fileSetStats = computed(() => {
  const sets = store.state.config?.fileSets || []
  const stats = store.state.stats?.fileSets || {}
  return sets.map(set => ({
    name: set.name,
    value: stats[set.id] || 0
  })).filter(item => item.value > 0)
})

const fileItemStats = computed(() => {
  const sets = store.state.config?.fileSets || []
  const stats = store.state.stats?.fileItems || {}
  const items = []
  sets.forEach(set => {
    (set.items || []).forEach(item => {
      const count = stats[item.id] || 0
      if (count > 0) {
        items.push({
          name: item.alias || item.name,
          value: count
        })
      }
    })
  })
  return items.sort((a, b) => b.value - a.value).slice(0, 15)
})

function getChartOption(data, title) {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: {
        rotate: 30,
        interval: 0,
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '点击次数'
    },
    series: [
      {
        name: '点击次数',
        type: 'bar',
        data: data.map(d => d.value),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }
}

function initChart(chartRef, data, title) {
  if (!chartRef) return null
  
  const chart = echarts.init(chartRef)
  
  if (data.length > 0) {
    chart.setOption(getChartOption(data, title))
  } else {
    chart.setOption({
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#909399',
          fontSize: 16
        }
      }
    })
  }
  
  return chart
}

function updateCharts() {
  nextTick(() => {
    if (activeTab.value === 'directories') {
      if (dirSetChart) dirSetChart.dispose()
      if (dirItemChart) dirItemChart.dispose()
      
      dirSetChart = initChart(dirSetChartRef.value, directorySetStats.value, '目录集点击次数')
      dirItemChart = initChart(dirItemChartRef.value, directoryItemStats.value, '目录项点击次数')
    } else {
      if (fileSetChart) fileSetChart.dispose()
      if (fileItemChart) fileItemChart.dispose()
      
      fileSetChart = initChart(fileSetChartRef.value, fileSetStats.value, '文件集点击次数')
      fileItemChart = initChart(fileItemChartRef.value, fileItemStats.value, '文件项点击次数')
    }
  })
}

watch(activeTab, () => {
  updateCharts()
})

watch(() => store.state.stats, () => {
  updateCharts()
}, { deep: true })

onMounted(() => {
  const handleResize = () => {
    dirSetChart?.resize()
    dirItemChart?.resize()
    fileSetChart?.resize()
    fileItemChart?.resize()
  }
  window.addEventListener('resize', handleResize)
  
  updateCharts()
})
</script>

<style scoped>
.statistics-container {
  height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  gap: 16px;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.custom-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.chart-section {
  margin-bottom: 24px;
}

.chart-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.chart-container {
  height: 300px;
  width: 100%;
}
</style>
