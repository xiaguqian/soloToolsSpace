<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-size: 16px; font-weight: bold">分类管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>
      </template>
      
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="category_code" label="分类代码" width="150" />
        <el-table-column prop="category_name" label="分类名称" width="150" />
        <el-table-column prop="description" label="描述" />
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
      :title="formData.id ? '编辑分类' : '新增分类'"
      width="500px"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="分类代码" required>
          <el-input v-model="formData.category_code" placeholder="请输入分类代码" />
        </el-form-item>
        <el-form-item label="分类名称" required>
          <el-input v-model="formData.category_name" placeholder="请输入分类名称" />
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
import { categoryApi } from '@/api'

const tableData = ref([])
const dialogVisible = ref(false)
const formData = reactive({
  id: null,
  category_code: '',
  category_name: '',
  description: ''
})

const loadData = async () => {
  try {
    const res = await categoryApi.list()
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
  formData.category_code = ''
  formData.category_name = ''
  formData.description = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  formData.id = row.id
  formData.category_code = row.category_code
  formData.category_name = row.category_name
  formData.description = row.description || ''
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formData.category_code || !formData.category_name) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  try {
    if (formData.id) {
      const res = await categoryApi.update(formData.id, {
        category_name: formData.category_name,
        description: formData.description
      })
      if (res.data.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        loadData()
      }
    } else {
      const res = await categoryApi.create({
        category_code: formData.category_code,
        category_name: formData.category_name,
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
    const res = await categoryApi.update(row.id, { is_enabled: newStatus })
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
  ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await categoryApi.delete(row.id)
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
