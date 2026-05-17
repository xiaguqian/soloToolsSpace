<template>
  <div class="product-page">
    <div class="page-header">
      <div class="search-bar">
        <el-input v-model="keyword" placeholder="搜索商品名称" class="search-input" />
        <el-select v-model="categoryId" placeholder="选择分类" class="category-select">
          <el-option label="全部" :value="''" />
          <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
        <el-select v-model="status" placeholder="状态" class="status-select">
          <el-option label="全部" :value="''" />
          <el-option label="上架" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
        <el-button type="primary" @click="loadProducts">搜索</el-button>
      </div>
      <div class="action-bar">
        <el-button type="success" @click="handleBatchOnline" :disabled="selectedIds.length === 0">批量上架</el-button>
        <el-button type="warning" @click="handleBatchOffline" :disabled="selectedIds.length === 0">批量下架</el-button>
        <el-button type="primary" @click="openAddModal">添加商品</el-button>
      </div>
    </div>
    <el-table :data="productList" border :selection-change="handleSelectionChange" class="product-table">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="category_name" label="分类" />
      <el-table-column prop="price" label="价格" formatter="formatPrice" />
      <el-table-column prop="stock" label="库存">
        <template #default="scope">
          <span>{{ scope.row.stock === -1 ? '无限' : scope.row.stock }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="text" @click="openEditModal(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleToggleStatus(scope.row)">
            {{ scope.row.status === 1 ? '下架' : '上架' }}
          </el-button>
          <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination 
      :current-page="page" 
      :page-size="pageSize" 
      :total="total" 
      @current-change="handlePageChange"
      layout="prev, pager, next, jumper, ->, total"
    />
    
    <el-dialog :title="isEdit ? '编辑商品' : '添加商品'" :visible.sync="showModal" width="600px">
      <el-form :model="form" label-width="100px" class="modal-form">
        <el-form-item label="商品名称">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="所属分类">
          <el-select v-model="form.category_id" placeholder="请选择分类">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品价格">
          <el-input v-model="form.price" type="number" placeholder="请输入商品价格" />
        </el-form-item>
        <el-form-item label="库存数量">
          <el-input v-model="form.stock" type="number" placeholder="-1表示无限库存" />
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input v-model="form.description" type="textarea" placeholder="请输入商品描述" />
        </el-form-item>
        <el-form-item label="商品状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
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
import { product as productApi, category as categoryApi } from '../utils/api'

const keyword = ref('')
const categoryId = ref('')
const status = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const productList = ref([])
const categories = ref([])
const selectedIds = ref([])
const showModal = ref(false)
const isEdit = ref(false)

const form = reactive({
  id: '',
  name: '',
  category_id: '',
  price: '',
  stock: -1,
  status: 1,
  description: ''
})

const loadProducts = async () => {
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
      categoryId: categoryId.value || undefined,
      status: status.value !== '' ? status.value : undefined
    }
    const res = await productApi.list(params)
    if (res.code === 200) {
      productList.value = res.data.list
      total.value = res.data.total
      page.value = res.data.page
    }
  } catch (error) {
    ElMessage.error('获取商品列表失败')
  }
}

const loadCategories = async () => {
  try {
    const res = await categoryApi.list()
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取分类失败')
  }
}

const handleSelectionChange = (val) => {
  selectedIds.value = val.map(item => item.id)
}

const handlePageChange = (val) => {
  page.value = val
  loadProducts()
}

const openAddModal = () => {
  isEdit.value = false
  Object.assign(form, {
    id: '',
    name: '',
    category_id: '',
    price: '',
    stock: -1,
    status: 1,
    description: ''
  })
  showModal.value = true
}

const openEditModal = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    name: row.name,
    category_id: row.category_id,
    price: row.price,
    stock: row.stock,
    status: row.status,
    description: row.description
  })
  showModal.value = true
}

const handleSubmit = async () => {
  if (!form.name || !form.category_id || !form.price) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  try {
    let res
    if (isEdit.value) {
      res = await productApi.update(form.id, form)
    } else {
      res = await productApi.add(form)
    }
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      showModal.value = false
      loadProducts()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleToggleStatus = async (row) => {
  try {
    const res = await productApi.update(row.id, { status: row.status === 1 ? 0 : 1 })
    if (res.code === 200) {
      ElMessage.success(row.status === 1 ? '下架成功' : '上架成功')
      loadProducts()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (row) => {
  if (!confirm(`确定要删除商品「${row.name}」吗？`)) return
  
  try {
    const res = await productApi.delete(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadProducts()
    }
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleBatchOnline = async () => {
  try {
    const res = await productApi.batchStatus({ ids: selectedIds.value, status: 1 })
    if (res.code === 200) {
      ElMessage.success('批量上架成功')
      selectedIds.value = []
      loadProducts()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleBatchOffline = async () => {
  try {
    const res = await productApi.batchStatus({ ids: selectedIds.value, status: 0 })
    if (res.code === 200) {
      ElMessage.success('批量下架成功')
      selectedIds.value = []
      loadProducts()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>

<style scoped>
.product-page {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 200px;
}

.category-select, .status-select {
  width: 150px;
}

.action-bar {
  display: flex;
  gap: 10px;
}

.product-table {
  margin-bottom: 20px;
}

.modal-form {
  padding: 20px 0;
}
</style>
