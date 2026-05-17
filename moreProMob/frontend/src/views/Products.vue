<template>
  <div class="products">
    <div class="toolbar">
      <div class="search-box">
        <el-input v-model="searchForm.keyword" placeholder="搜索商品" class="search-input" />
        <el-select v-model="searchForm.category" placeholder="选择分类">
          <el-option label="全部" value="" />
          <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
        </el-select>
        <el-button type="primary" @click="loadProducts">搜索</el-button>
      </div>
      <el-button type="primary" @click="showAddModal = true">添加商品</el-button>
    </div>
    
    <el-table :data="products" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="category" label="分类" />
      <el-table-column prop="price" label="价格" width="100">
        <template #default="scope">¥{{ scope.row.price }}</template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'warning'">
            {{ scope.row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="text" @click="editProduct(scope.row)">编辑</el-button>
          <el-button type="text" @click="toggleStatus(scope.row)">
            {{ scope.row.status === 1 ? '下架' : '上架' }}
          </el-button>
          <el-button type="text" @click="deleteProduct(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination 
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.page"
      :page-sizes="[10, 20, 50]"
      :page-size="pagination.limit"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
    />
    
    <el-dialog :title="editForm.id ? '编辑商品' : '添加商品'" :visible.sync="showAddModal">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="editForm.category" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input v-model="editForm.price" type="number" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input v-model="editForm.stock" type="number" />
        </el-form-item>
        <el-form-item label="描述">
          <el-textarea v-model="editForm.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddModal = false">取消</el-button>
        <el-button type="primary" @click="saveProduct">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { productApi } from '../api'

const products = ref([])
const categories = ref([])
const showAddModal = ref(false)
const searchForm = reactive({
  keyword: '',
  category: ''
})
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})
const editForm = reactive({
  id: '',
  name: '',
  category: '',
  price: '',
  stock: 0,
  description: ''
})

const loadProducts = async () => {
  try {
    const res = await productApi.list({
      page: pagination.page,
      limit: pagination.limit,
      keyword: searchForm.keyword,
      category: searchForm.category
    })
    if (res.code === 200) {
      products.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    ElMessage.error('加载失败')
  }
}

const loadCategories = async () => {
  try {
    const res = await productApi.getCategories()
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    console.error(error)
  }
}

const editProduct = (row) => {
  editForm.id = row.id
  editForm.name = row.name
  editForm.category = row.category
  editForm.price = row.price
  editForm.stock = row.stock
  editForm.description = row.description
  showAddModal.value = true
}

const saveProduct = async () => {
  if (!editForm.name || !editForm.price) {
    ElMessage.error('请填写必填项')
    return
  }
  
  try {
    let res
    if (editForm.id) {
      res = await productApi.update(editForm.id, editForm)
    } else {
      res = await productApi.create(editForm)
    }
    
    if (res.code === 200) {
      ElMessage.success('保存成功')
      showAddModal.value = false
      resetForm()
      loadProducts()
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const resetForm = () => {
  editForm.id = ''
  editForm.name = ''
  editForm.category = ''
  editForm.price = ''
  editForm.stock = 0
  editForm.description = ''
}

const toggleStatus = async (row) => {
  try {
    const res = await productApi.updateStatus(row.id, row.status === 1 ? 0 : 1)
    if (res.code === 200) {
      row.status = row.status === 1 ? 0 : 1
      ElMessage.success('状态更新成功')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deleteProduct = async (id) => {
  if (!confirm('确定删除该商品？')) return
  
  try {
    const res = await productApi.delete(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadProducts()
    }
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleSizeChange = (val) => {
  pagination.limit = val
  loadProducts()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  loadProducts()
}

onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>

<style scoped>
.products {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  width: 200px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .search-box {
    flex-wrap: wrap;
  }
  
  .search-input {
    width: 100%;
  }
}
</style>