<template>
  <div>
    <el-select v-model="statusFilter" placeholder="选择状态" style="width: 150px; margin-right: 20px">
      <el-option label="全部" value="" />
      <el-option label="正常" value="active" />
      <el-option label="置顶" value="top" />
      <el-option label="下线" value="offline" />
    </el-select>
    <el-input v-model="keyword" placeholder="搜索笔记标题" style="width: 300px" @keyup.enter="loadNoteList" />
    <el-table :data="noteList" border style="width: 100%; margin-top: 20px">
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="statusTagType(scope.row.status)">
            {{ statusMap[scope.row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="likeCount" label="点赞数" />
      <el-table-column prop="commentCount" label="评论数" />
      <el-table-column prop="favoriteCount" label="收藏数" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" v-if="scope.row.status !== 'top'" @click="setTop(scope.row.id)">置顶</el-button>
          <el-button size="small" type="warning" v-if="scope.row.status === 'top'" @click="activateNote(scope.row.id)">取消置顶</el-button>
          <el-button size="small" type="danger" v-if="scope.row.status !== 'offline'" @click="offlineNote(scope.row.id)">下线</el-button>
          <el-button size="small" type="success" v-if="scope.row.status === 'offline'" @click="activateNote(scope.row.id)">上线</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page" :page-sizes="[10, 20, 50]" :page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next, jumper" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const noteList = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const keyword = ref('')
const statusFilter = ref('')

const statusMap = {
  active: '正常',
  top: '置顶',
  offline: '下线'
}

const statusTagType = (status) => {
  switch (status) {
    case 'active': return 'success'
    case 'top': return 'warning'
    case 'offline': return 'danger'
    default: return ''
  }
}

const loadNoteList = async () => {
  try {
    const response = await axios.get('/api/admin/note/list', {
      params: { page: page.value, pageSize: pageSize.value, keyword: keyword.value, status: statusFilter.value }
    })
    noteList.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    console.error(error)
  }
}

const setTop = async (id) => {
  try {
    await axios.post('/api/admin/note/top', { id })
    loadNoteList()
  } catch (error) {
    console.error(error)
  }
}

const offlineNote = async (id) => {
  if (confirm('确定将该笔记下线吗？')) {
    try {
      await axios.post('/api/admin/note/offline', { id })
      loadNoteList()
    } catch (error) {
      console.error(error)
    }
  }
}

const activateNote = async (id) => {
  try {
    await axios.post('/api/admin/note/activate', { id })
    loadNoteList()
  } catch (error) {
    console.error(error)
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  loadNoteList()
}

const handleCurrentChange = (val) => {
  page.value = val
  loadNoteList()
}

onMounted(() => {
  loadNoteList()
})
</script>