<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-size: 16px; font-weight: bold">数据概览</span>
          <div>
            <el-select
              v-model="selectedQueryId"
              placeholder="选择查询语句"
              style="width: 300px; margin-right: 10px"
              @change="handleQueryChange"
            >
              <el-option
                v-for="qs in queryStatements"
                :key="qs.id"
                :label="qs.query_name"
                :value="qs.id"
              />
            </el-select>
            <el-select
              v-model="chartType"
              style="width: 150px; margin-right: 10px"
              @change="renderChart"
            >
              <el-option label="表格" value="table" />
              <el-option label="饼图" value="pie" />
              <el-option label="折线图" value="line" />
              <el-option label="柱状图" value="bar" />
            </el-select>
            <el-button type="primary" @click="loadData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <div v-if="chartType === 'table'">
        <el-table :data="chartData" style="width: 100%" border>
          <el-table-column
            v-for="col in columns"
            :key="col"
            :prop="col"
            :label="col"
            show-overflow-tooltip
          />
        </el-table>
        <el-empty v-if="!chartData || chartData.length === 0" description="暂无数据" />
      </div>
      
      <div v-else style="height: 500px">
        <div ref="chartRef" style="width: 100%; height: 100%"></div>
        <el-empty v-if="!chartData || chartData.length === 0" description="暂无数据" style="margin-top: -300px" />
      </div>
    </el-card>
    
    <el-card style="margin-top: 20px" v-if="chartType === 'pie'">
      <template #header>
        <span>饼图配置</span>
      </template>
      <el-form inline>
        <el-form-item label="标签字段">
          <el-select v-model="pieConfig.labelField" placeholder="选择字段" @change="renderChart">
            <el-option v-for="col in columns" :key="col" :label="col" :value="col" />
          </el-select>
        </el-form-item>
        <el-form-item label="数值字段">
          <el-select v-model="pieConfig.valueField" placeholder="选择字段" @change="renderChart">
            <el-option v-for="col in columns" :key="col" :label="col" :value="col" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示模式">
          <el-select v-model="pieConfig.displayMode" @change="renderChart">
            <el-option label="仅数值" value="value" />
            <el-option label="仅比例" value="percent" />
            <el-option label="数值和比例" value="both" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card style="margin-top: 20px" v-if="chartType === 'bar'">
      <template #header>
        <span>柱状图配置</span>
      </template>
      <el-form inline>
        <el-form-item label="X轴字段">
          <el-select v-model="barConfig.xField" placeholder="选择字段" @change="renderChart">
            <el-option v-for="col in columns" :key="col" :label="col" :value="col" />
          </el-select>
        </el-form-item>
        <el-form-item label="Y轴字段">
          <el-select v-model="barConfig.yFields" multiple placeholder="选择字段" @change="renderChart">
            <el-option v-for="col in columns" :key="col" :label="col" :value="col" />
          </el-select>
        </el-form-item>
        <el-form-item label="分组字段">
          <el-select v-model="barConfig.groupField" placeholder="选择字段（可选）" @change="renderChart" clearable>
            <el-option v-for="col in columns" :key="col" :label="col" :value="col" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card style="margin-top: 20px" v-if="chartType === 'line'">
      <template #header>
        <span>折线图配置</span>
      </template>
      <el-form inline>
        <el-form-item label="X轴字段">
          <el-select v-model="lineConfig.xField" placeholder="选择字段" @change="renderChart">
            <el-option v-for="col in columns" :key="col" :label="col" :value="col" />
          </el-select>
        </el-form-item>
        <el-form-item label="Y轴字段">
          <el-select v-model="lineConfig.yFields" multiple placeholder="选择字段" @change="renderChart">
            <el-option v-for="col in columns" :key="col" :label="col" :value="col" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { queryStatementApi, chartApi } from '@/api'
import * as echarts from 'echarts'

const queryStatements = ref([])
const selectedQueryId = ref(null)
const chartType = ref('table')
const chartData = ref([])
const columns = ref([])
const chartRef = ref(null)
let chartInstance = null

const pieConfig = ref({
  labelField: '',
  valueField: '',
  displayMode: 'both'
})

const barConfig = ref({
  xField: '',
  yFields: [],
  groupField: ''
})

const lineConfig = ref({
  xField: '',
  yFields: []
})

const loadQueryStatements = async () => {
  try {
    const res = await queryStatementApi.list({ is_enabled: 1 })
    if (res.data.code === 200) {
      queryStatements.value = res.data.data
      if (queryStatements.value.length > 0 && !selectedQueryId.value) {
        selectedQueryId.value = queryStatements.value[0].id
        loadData()
      }
    }
  } catch (err) {
    ElMessage.error('加载查询语句失败')
    console.error(err)
  }
}

const loadData = async () => {
  if (!selectedQueryId.value) {
    return
  }
  
  try {
    const res = await chartApi.getData({
      query_statement_id: selectedQueryId.value
    })
    
    if (res.data.code === 200) {
      chartData.value = res.data.data.data || []
      columns.value = res.data.data.columns || []
      
      if (columns.value.length > 0) {
        pieConfig.value.labelField = columns.value[0]
        if (columns.value.length > 1) {
          pieConfig.value.valueField = columns.value[1]
        }
        barConfig.value.xField = columns.value[0]
        lineConfig.value.xField = columns.value[0]
        if (columns.value.length > 1) {
          barConfig.value.yFields = [columns.value[1]]
          lineConfig.value.yFields = [columns.value[1]]
        }
      }
      
      await nextTick()
      renderChart()
    }
  } catch (err) {
    ElMessage.error('加载数据失败')
    console.error(err)
  }
}

const handleQueryChange = () => {
  loadData()
}

const renderChart = async () => {
  await nextTick()
  
  if (!chartRef.value || chartType.value === 'table') {
    return
  }
  
  if (!chartData.value || chartData.value.length === 0) {
    return
  }
  
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  
  let option = {}
  
  if (chartType.value === 'pie') {
    const labelField = pieConfig.value.labelField
    const valueField = pieConfig.value.valueField
    
    if (!labelField || !valueField) {
      return
    }
    
    const pieData = chartData.value.map(item => ({
      name: item[labelField],
      value: Number(item[valueField]) || 0
    }))
    
    let formatter = ''
    if (pieConfig.value.displayMode === 'value') {
      formatter = '{b}: {c}'
    } else if (pieConfig.value.displayMode === 'percent') {
      formatter = '{b}: {d}%'
    } else {
      formatter = '{b}: {c} ({d}%)'
    }
    
    option = {
      tooltip: {
        trigger: 'item',
        formatter: formatter
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '数据分布',
          type: 'pie',
          radius: '50%',
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: formatter
          }
        }
      ]
    }
  } else if (chartType.value === 'bar') {
    const xField = barConfig.value.xField
    const yFields = barConfig.value.yFields
    const groupField = barConfig.value.groupField
    
    if (!xField || yFields.length === 0) {
      return
    }
    
    if (groupField) {
      const groups = [...new Set(chartData.value.map(item => item[groupField]))]
      const xCategories = [...new Set(chartData.value.map(item => item[xField]))]
      
      const series = groups.map(group => {
        const groupData = xCategories.map(xVal => {
          const item = chartData.value.find(d => d[xField] === xVal && d[groupField] === group)
          return item ? (Number(item[yFields[0]]) || 0) : 0
        })
        
        return {
          name: group,
          type: 'bar',
          data: groupData
        }
      })
      
      option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: groups
        },
        xAxis: {
          type: 'category',
          data: xCategories
        },
        yAxis: {
          type: 'value'
        },
        series: series
      }
    } else {
      const xData = chartData.value.map(item => item[xField])
      const series = yFields.map(field => ({
        name: field,
        type: 'bar',
        data: chartData.value.map(item => Number(item[field]) || 0)
      }))
      
      option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: yFields
        },
        xAxis: {
          type: 'category',
          data: xData
        },
        yAxis: {
          type: 'value'
        },
        series: series
      }
    }
  } else if (chartType.value === 'line') {
    const xField = lineConfig.value.xField
    const yFields = lineConfig.value.yFields
    
    if (!xField || yFields.length === 0) {
      return
    }
    
    const xData = chartData.value.map(item => item[xField])
    const series = yFields.map(field => ({
      name: field,
      type: 'line',
      data: chartData.value.map(item => Number(item[field]) || 0),
      smooth: true
    }))
    
    option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: yFields
      },
      xAxis: {
        type: 'category',
        data: xData
      },
      yAxis: {
        type: 'value'
      },
      series: series
    }
  }
  
  chartInstance.setOption(option, true)
}

onMounted(() => {
  loadQueryStatements()
  
  window.addEventListener('resize', () => {
    chartInstance && chartInstance.resize()
  })
})
</script>

<style scoped>
</style>
