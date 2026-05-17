<template>
  <div class="category-page">
    <div class="page-header">
      <el-button type="primary" @click="openAddModal">添加分类</el-button>
    </div>
    <el-table :data="categoryList" border class="category-table">
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="sort_order" label="排序" />
      <el-table-column prop="created_at" label="创建时间" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="text" @click="openEditModal(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog :title="isEdit ? '编辑分类' : '添加分类'" :visible.sync="showModal" width="400px">
      <el-form :model="form" label-width="100px" class="modal-form">
        <el-form-item label="分类名称">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序序号">
          <el-input v-model="form.sort_order" type="number" placeholder="请输入排序序号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showModal = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">{{ isEdit ? '修改' : '添加' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { category as categoryApi } from '../utils/api'

const categoryList = ref([])
const showModal = ref(false)
const isEdit = ref(false)

const form = reactive({
  id: '',
  name: '',
  sort_order: 0
})

const loadCategories = async () => {
  try {
    const res = await categoryApi.list()
    if (res.code === 200) {
      categoryList.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  }
}

const openAddModal = () => {
  isEdit.value = false
  Object.assign(form, {
    id: '',
    name: '',
    sort_order: 0
  })
  showModal.value = true
}

const openEditModal = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    name: row.name,
    sort_order: row.sort_order
  })
  showModal.value = true
}

const handleSubmit = async () => {
  if (!form.name) {
    ElMessage.warning('请填写分类名称')
    return
  }
  
  try {
    let res
    if (isEdit.value) {
      res = await categoryApi.update(form.id, form)
    } else {
      res = await categoryApi.add(form)
    }
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      showModal.value = false
      loadCategories()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (row) => {
  if (!confirm(`确定要删除分类「${row.name}」吗？`)) return
  
  try {
    const res = await categoryApi.delete(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadCategories()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.category-page {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.page-header {
  margin-bottom: 20px;
}

.category-table {
  margin-bottom: 20px;
}

.modal-form {
  padding: 20px 0;
}
</style>
