<template>
  <div class="page-card">
    <div class="page-header">
      <div class="page-title">API网关</div>
    </div>
    
    <el-tabs v-model="activeTab">
      <el-tab-pane label="API列表" name="list">
        <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
          <el-table-column prop="name" label="API名称" min-width="150" />
          <el-table-column prop="path" label="路径" min-width="200" />
          <el-table-column prop="method" label="方法" width="100" />
          <el-table-column prop="description" label="描述" min-width="200" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.is_enabled ? 'success' : 'danger'" effect="plain">
                {{ row.is_enabled ? '已启用' : '已停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right" v-if="isAdmin">
            <template #default="{ row }">
              <el-button v-if="!row.is_enabled" size="small" type="success" link @click="handleToggle(row, true)">启用</el-button>
              <el-button v-else size="small" type="warning" link @click="handleToggle(row, false)">停用</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      
      <el-tab-pane label="在线测试" name="test">
        <el-card>
          <el-form label-width="120px">
            <el-form-item label="路由方式">
              <el-radio-group v-model="testForm.auto_route">
                <el-radio :label="true">自动路由 (优先免费额度)</el-radio>
                <el-radio :label="false">指定模型</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="选择模型" v-if="!testForm.auto_route">
              <el-select v-model="testForm.model_id" placeholder="选择模型" style="width: 300px">
                <el-option v-for="m in enabledModels" :key="m.id" :label="`${m.name} (${m.provider_name})`" :value="m.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="测试消息">
              <el-input v-model="testMessage" type="textarea" :rows="4" placeholder="输入测试消息" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="testLoading" @click="doProxyTest">发送请求</el-button>
            </el-form-item>
          </el-form>
          
          <el-card v-if="proxyResult" style="margin-top: 20px">
            <div style="margin-bottom: 10px">
              <el-tag type="info">模型: {{ proxyResult.model_name }}</el-tag>
              <el-tag type="success" style="margin-left: 10px">耗时: {{ proxyResult.response_time_ms }}ms</el-tag>
              <el-tag :type="proxyResult.status_code === 200 ? 'success' : 'danger'" style="margin-left: 10px">
                状态: {{ proxyResult.status_code }}
              </el-tag>
            </div>
            <pre style="white-space: pre-wrap; word-break: break-all; max-height: 400px; overflow-y: auto; background: #f5f7fa; padding: 15px; border-radius: 4px; margin: 0">{{ JSON.stringify(proxyResult.response, null, 2) }}</pre>
          </el-card>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getGateways, toggleGateway, proxyRequest } from '@/api/gateway'
import { getModels } from '@/api/models'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)

const loading = ref(false)
const tableData = ref([])
const activeTab = ref('list')

const testLoading = ref(false)
const testMessage = ref('你好，请介绍一下自己')
const testForm = reactive({
  auto_route: true,
  model_id: null
})
const proxyResult = ref(null)
const enabledModels = ref([])

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getGateways({ limit: 1000 })
    tableData.value = res.data.items
  } finally {
    loading.value = false
  }
}

const fetchEnabledModels = async () => {
  const res = await getModels({ is_enabled: true, limit: 1000 })
  enabledModels.value = res.data.items
}

const handleToggle = async (row, enable) => {
  await toggleGateway(row.id, enable)
  ElMessage.success(enable ? '已启用' : '已停用')
  await fetchData()
}

const doProxyTest = async () => {
  if (!testForm.auto_route && !testForm.model_id) {
    ElMessage.warning('请选择模型')
    return
  }
  testLoading.value = true
  try {
    const res = await proxyRequest({
      auto_route: testForm.auto_route,
      model_id: testForm.auto_route ? null : testForm.model_id,
      messages: [{ role: 'user', content: testMessage.value }]
    })
    proxyResult.value = res.data
  } finally {
    testLoading.value = false
  }
}

onMounted(() => {
  fetchData()
  fetchEnabledModels()
})
</script>
