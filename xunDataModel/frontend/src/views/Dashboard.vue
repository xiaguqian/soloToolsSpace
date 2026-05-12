<template>
  <div class="page-card">
    <div class="page-header">
      <div class="page-title">仪表盘</div>
    </div>
    
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <div style="text-align: center">
            <div style="font-size: 32px; color: #409eff; font-weight: bold">{{ stats.total_requests || 0 }}</div>
            <div style="color: #909399; margin-top: 8px">总请求次数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div style="text-align: center">
            <div style="font-size: 32px; color: #67c23a; font-weight: bold">{{ stats.today_requests || 0 }}</div>
            <div style="color: #909399; margin-top: 8px">今日请求次数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div style="text-align: center">
            <div style="font-size: 32px; color: #e6a23c; font-weight: bold">{{ modelCount.total || 0 }}</div>
            <div style="color: #909399; margin-top: 8px">模型总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div style="text-align: center">
            <div style="font-size: 32px; color: #f56c6c; font-weight: bold">{{ modelCount.enabled || 0 }}</div>
            <div style="color: #909399; margin-top: 8px">已启用模型</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card style="margin-top: 20px">
      <template #header>
        <div style="font-weight: 600">快速开始</div>
      </template>
      <el-steps :active="0" finish-status="success">
        <el-step title="1. 录入模型" description="在模型管理中添加您的AI模型配置" />
        <el-step title="2. 测试连接" description="使用测试功能验证模型配置是否正确" />
        <el-step title="3. 启用模型" description="启用模型后可通过API网关调用" />
        <el-step title="4. 调用API" description="通过API网关统一调用您的模型" />
      </el-steps>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLogStats } from '@/api/logs'
import { getModels } from '@/api/models'

const stats = ref({})
const modelCount = ref({ total: 0, enabled: 0 })

const fetchData = async () => {
  try {
    const [statsRes, modelsRes] = await Promise.all([
      getLogStats(),
      getModels({ limit: 1000 })
    ])
    stats.value = statsRes.data
    modelCount.value.total = modelsRes.data.total
    modelCount.value.enabled = modelsRes.data.items.filter(m => m.is_enabled).length
  } catch (error) {
    console.error(error)
  }
}

onMounted(fetchData)
</script>
