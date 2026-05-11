<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-size: 16px; font-weight: bold">维度管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增维度
          </el-button>
        </div>
      </template>
      
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="dimension_code" label="维度代码" width="150" />
        <el-table-column prop="dimension_name" label="维度名称" width="150" />
        <el-table-column prop="value_type" label="值类型" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.value_type === 'string'" type="info">字符</el-tag>
            <el-tag v-else-if="scope.row.value_type === 'number'" type="success">数值</el-tag>
            <el-tag v-else type="warning">日期</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_enabled" label="状态" width="100">
          <template #default="scope">
            <el-switch
              :model-value="scope.row.is_enabled === 1"
              @change="handleToggleStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog
      v-model="dialogVisible"
      :title="formData.id ? '编辑维度' : '新增维度'"
      width="500px"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="维度代码" required>
          <el-input v-model="formData.dimension_code" placeholder="请输入维度代码" />
        </el-form-item>
        <el-form-item label="维度名称" required>
          <el-input v-model="formData.dimension_name" placeholder="请输入维度名称" />
        </el-form-item>
        <el-form-item label="值类型" required>
          <el-select v-model="formData.value_type" placeholder="请选择值类型" style="width: 100%">
            <el-option label="字符" value="string" />
            <el-option label="数值" value="number" />
            <el-option label="日期" value="date" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { dimensionApi } from '@/api'

const tableData = ref([])
const dialogVisible = ref(false)
const formData = reactive({
  id: null,
  dimension_code: '',
  dimension_name: '',
  value_type: 'string',
  description: ''
})

const loadData = async () => {
  try {
    const res = await dimensionApi.list()
    if (res.data.code === 200) {
      tableData.value = res.data.data
    }
  } catch (err) {
    ElMessage.error('加载数据失败')
    console.error(err)
  }
}

const handleAdd = () => {
  formData.id = null
  formData.dimension_code = ''
  formData.dimension_name = ''
  formData.value_type = 'string'
  formData.description = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  formData.id = row.id
  formData.dimension_code = row.dimension_code
  formData.dimension_name = row.dimension_name
  formData.value_type = row.value_type
  formData.description = row.description || ''
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formData.dimension_code || !formData.dimension_name) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  try {
    if (formData.id) {
      const res = await dimensionApi.update(formData.id, {
        dimension_name: formData.dimension_name,
        value_type: formData.value_type,
        description: formData.description
      })
      if (res.data.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        loadData()
      }
    } else {
      const res = await dimensionApi.create({
        dimension_code: formData.dimension_code,
        dimension_name: formData.dimension_name,
        value_type: formData.value_type,
        description: formData.description
      })
      if (res.data.code === 200) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        loadData()
      }
    }
  } catch (err) {
    ElMessage.error('保存失败')
    console.error(err)
  }
}

const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.is_enabled === 1 ? 0 : 1
    const res = await dimensionApi.update(row.id, { is_enabled: newStatus })
    if (res.data.code === 200) {
      ElMessage.success('状态更新成功')
      loadData()
    }
  } catch (err) {
    ElMessage.error('状态更新失败')
    console.error(err)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该维度吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await dimensionApi.delete(row.id)
      if (res.data.code === 200) {
        ElMessage.success('删除成功')
        loadData()
      }
    } catch (err) {
      ElMessage.error('删除失败')
      console.error(err)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>
