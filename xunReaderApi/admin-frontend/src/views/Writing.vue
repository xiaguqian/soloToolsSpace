<template>
  <div class="writing">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>写作中心</span>
          <el-button type="primary" @click="createBook">创建新作品</el-button>
        </div>
      </template>
      
      <div class="my-books">
        <h3>我的作品</h3>
        <el-table :data="books" border>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="作品名称" />
          <el-table-column prop="category" label="分类" width="100" />
          <el-table-column prop="wordCount" label="字数" width="100">
            <template #default="scope">
              {{ formatWordCount(scope.row.wordCount) }}
            </template>
          </el-table-column>
          <el-table-column prop="isCompleted" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.isCompleted === 1 ? 'success' : 'warning'">
                {{ scope.row.isCompleted === 1 ? '已完结' : '连载中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button size="small" @click="editBookInfo(scope.row)">编辑信息</el-button>
              <el-button size="small" @click="manageChapters(scope.row)">章节管理</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-dialog title="编辑书籍信息" v-model="bookDialogVisible">
      <el-form :model="editBook" label-width="100px">
        <el-form-item label="书籍名称">
          <el-input v-model="editBook.name" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="editBook.author" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="editBook.category" />
        </el-form-item>
        <el-form-item label="封面地址">
          <el-input v-model="editBook.cover" />
        </el-form-item>
        <el-form-item label="简介">
          <el-textarea v-model="editBook.description" :rows="4" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editBook.isCompleted">
            <el-radio :label="0">连载中</el-radio>
            <el-radio :label="1">已完结</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bookDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBookInfo">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { bookApi } from '../api'

const books = ref([])
const bookDialogVisible = ref(false)
const editBook = ref({})

const loadBooks = () => {
  bookApi.list({ page: 1, size: 100 }).then(res => {
    books.value = res.data.list
  }).catch(err => {
    console.error(err)
  })
}

const createBook = () => {
  editBook.value = {
    name: '',
    author: '',
    category: '',
    cover: '',
    description: '',
    isCompleted: 0
  }
  bookDialogVisible.value = true
}

const editBookInfo = (book) => {
  editBook.value = { ...book }
  bookDialogVisible.value = true
}

const saveBookInfo = () => {
  bookDialogVisible.value = false
  alert('保存成功')
}

const manageChapters = (book) => {
  alert(`管理章节: ${book.name}`)
}

const formatWordCount = (count) => {
  if (!count) return '0'
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

onMounted(() => {
  loadBooks()
})
</script>

<style>
.writing {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.my-books {
  margin-top: 20px;
}
</style>