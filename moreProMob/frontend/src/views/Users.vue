<template>
  <div class="users">
    <div class="toolbar">
      <div class="search-box">
        <el-input v-model="searchForm.keyword" placeholder="搜索手机号或昵称" class="search-input" />
        <el-button type="primary" @click="loadUsers">搜索</el-button>
      </div>
    </div>
    
    <el-table :data="users" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="points" label="积分" width="100" />
      <el-table-column prop="tags" label="标签" />
      <el-table-column prop="created_at" label="注册时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="text" @click="addPoints(scope.row)">添加积分</el-button>
          <el-button type="text" @click="editUser(scope.row)">编辑</el-button>
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
    
    <el-dialog title="添加积分" :visible.sync="showPointsModal">
      <el-form :model="pointsForm" label-width="100px">
        <el-form-item label="用户">
          <span>{{ pointsForm.nickname }} ({{ pointsForm.phone }})</span>
        </el-form-item>
        <el-form-item label="当前积分">
          <span>{{ pointsForm.currentPoints }}</span>
        </el-form-item>
        <el-form-item label="添加积分">
          <el-input v-model="pointsForm.points" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPointsModal = false">取消</el-button>
        <el-button type="primary" @click="savePoints">保存</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="编辑用户" :visible.sync="showEditModal">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="积分">
          <el-input v-model="editForm.points" type="number" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="editForm.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditModal = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi } from '../api'

const users = ref([])
const showPointsModal = ref(false)
const showEditModal = ref(false)
const searchForm = reactive({
  keyword: ''
})
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})
const pointsForm = reactive({
  userId: '',
  nickname: '',
  phone: '',
  currentPoints: 0,
  points: 0
})
const editForm = reactive({
  id: '',
  phone: '',
  nickname: '',
  points: 0,
  tags: ''
})

const loadUsers = async () => {
  try {
    const res = await userApi.list({
      page: pagination.page,
      limit: pagination.limit,
      keyword: searchForm.keyword
    })
    if (res.code === 200) {
      users.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    ElMessage.error('加载失败')
  }
}

const addPoints = (row) => {
  pointsForm.userId = row.id
  pointsForm.nickname = row.nickname
  pointsForm.phone = row.phone
  pointsForm.currentPoints = row.points
  pointsForm.points = 0
  showPointsModal.value = true
}

const savePoints = async () => {
  if (pointsForm.points <= 0) {
    ElMessage.error('请输入有效的积分数量')
    return
  }
  
  try {
    const res = await userApi.addPoints(pointsForm.userId, pointsForm.points)
    if (res.code === 200) {
      ElMessage.success('积分添加成功')
      showPointsModal.value = false
      loadUsers()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const editUser = (row) => {
  editForm.id = row.id
  editForm.phone = row.phone
  editForm.nickname = row.nickname
  editForm.points = row.points
  editForm.tags = row.tags || ''
  showEditModal.value = true
}

const saveUser = async () => {
  try {
    const res = await userApi.update(editForm.id, {
      nickname: editForm.nickname,
      points: editForm.points,
      tags: editForm.tags
    })
    if (res.code === 200) {
      ElMessage.success('保存成功')
      showEditModal.value = false
      loadUsers()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleSizeChange = (val) => {
  pagination.limit = val
  loadUsers()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  loadUsers()
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users {
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
  width: 300px;
}

@media (max-width: 768px) {
  .search-input {
    width: 100%;
  }
}
</style>