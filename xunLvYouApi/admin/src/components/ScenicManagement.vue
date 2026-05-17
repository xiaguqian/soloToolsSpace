<template>
  <div>
    <el-button type="primary" @click="openCreateModal">新增景点</el-button>
    <el-input v-model="keyword" placeholder="搜索景点名称" style="width: 300px; margin-left: 20px" @keyup.enter="loadScenicList" />
    <el-table :data="scenicList" border style="width: 100%; margin-top: 20px">
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="type" label="类型">
        <template #default="scope">
          {{ typeMap[scope.row.type] }}
        </template>
      </el-table-column>
      <el-table-column prop="is_paid" label="是否收费">
        <template #default="scope">
          {{ scope.row.is_paid ? '收费' : '免费' }}
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="rating" label="评分" />
      <el-table-column prop="view_count" label="浏览量" />
      <el-table-column prop="address" label="地址" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="openEditModal(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteScenic(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page" :page-sizes="[10, 20, 50]" :page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next, jumper" />
    
    <el-dialog :title="isEdit ? '编辑景点' : '新增景点'" :visible.sync="dialogVisible" width="600px">
      <el-form :model="scenicForm" label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="scenicForm.name" />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-input v-model="scenicForm.cover_image" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="scenicForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="scenicForm.type">
            <el-option label="文化" value="culture" />
            <el-option label="自然" value="nature" />
            <el-option label="娱乐" value="amusement" />
            <el-option label="历史" value="historical" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否收费">
          <el-switch v-model="scenicForm.is_paid" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input v-model.number="scenicForm.price" type="number" />
        </el-form-item>
        <el-form-item label="评分">
          <el-input v-model.number="scenicForm.rating" type="number" step="0.1" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="scenicForm.address" />
        </el-form-item>
        <el-form-item label="开放时间">
          <el-input v-model="scenicForm.open_time" />
        </el-form-item>
        <el-form-item label="纬度">
          <el-input v-model.number="scenicForm.latitude" type="number" step="0.0001" />
        </el-form-item>
        <el-form-item label="经度">
          <el-input v-model.number="scenicForm.longitude" type="number" step="0.0001" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveScenic">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'

const scenicList = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const keyword = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)

const typeMap = {
  culture: '文化',
  nature: '自然',
  amusement: '娱乐',
  historical: '历史'
}

const scenicForm = reactive({
  id: '',
  name: '',
  cover_image: '',
  description: '',
  type: 'culture',
  is_paid: false,
  price: 0,
  rating: 0,
  address: '',
  open_time: '',
  latitude: 0,
  longitude: 0
})

const loadScenicList = async () => {
  try {
    const response = await axios.get('/api/admin/scenic/list', {
      params: { page: page.value, pageSize: page.value, keyword: keyword.value }
    })
    scenicList.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    console.error(error)
  }
}

const openCreateModal = () => {
  isEdit.value = false
  Object.keys(scenicForm).forEach(key => {
    scenicForm[key] = key === 'type' ? 'culture' : key === 'is_paid' ? false : key === 'price' || key === 'rating' ? 0 : ''
  })
  dialogVisible.value = true
}

const openEditModal = (row) => {
  isEdit.value = true
  Object.assign(scenicForm, row)
  dialogVisible.value = true
}

const saveScenic = async () => {
  try {
    if (isEdit.value) {
      await axios.post('/api/admin/scenic/update', scenicForm)
    } else {
      await axios.post('/api/admin/scenic/create', scenicForm)
    }
    dialogVisible.value = false
    loadScenicList()
  } catch (error) {
    console.error(error)
  }
}

const deleteScenic = async (id) => {
  if (confirm('确定删除该景点吗？')) {
    try {
      await axios.post('/api/admin/scenic/delete', { id })
      loadScenicList()
    } catch (error) {
      console.error(error)
    }
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadScenicList()
}

const handleCurrentChange = (val) => {
  page.value = val
  loadScenicList()
}

onMounted(() => {
  loadScenicList()
})
</script>