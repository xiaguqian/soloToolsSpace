<template>
  <div class="book-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>书籍列表</span>
          <el-input 
            v-model="keyword" 
            placeholder="搜索书籍名称" 
            class="search-input"
            @keyup.enter="loadBooks"
          >
            <template #append>
              <el-button @click="loadBooks"><el-icon><Search /></el-icon></template>
            </template>
          </el-input>
        </div>
      </template>
      
      <el-table :data="books" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="书籍名称" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="wordCount" label="字数" width="100">
          <template #default="scope">
            {{ formatWordCount(scope.row.wordCount) }}
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100" />
        <el-table-column prop="collectCount" label="收藏量" width="100" />
        <el-table-column prop="isCompleted" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isCompleted === 1 ? 'success' : 'warning'">
              {{ scope.row.isCompleted === 1 ? '已完结' : '连载中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="审核状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '已发布' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row.id)">查看目录</el-button>
            <el-button size="small" @click="toggleStatus(scope.row)">
              {{ scope.row.status === 1 ? '下架' : '发布' }}
            </el-button>
            <el-button size="small" type="danger" @click="deleteBook(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination 
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-sizes="[10, 20, 50]"
        :page-size="size"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </el-card>
  </div>
</template>

<script setup>import { ref, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { bookApi } from '../api';
import { useRouter } from 'vue-router';
const router = useRouter();
const books = ref([]);
const page = ref(1);
const size = ref(10);
const total = ref(0);
const keyword = ref('');
const loadBooks = () => {
 bookApi.list({ page: page.value, size: size.value, keyword: keyword.value }).then(res => {
 books.value = res.data.list;
 total.value = res.data.total;
 }).catch(err => {
 console.error(err);
 });
};
const handleSizeChange = (val) => {
 size.value = val;
 loadBooks();
};
const handleCurrentChange = (val) => {
 page.value = val;
 loadBooks();
};
const viewDetail = (id) => {
 router.push(`/books/${id}`);
};
const toggleStatus = (row) => {
 const newStatus = row.status === 1 ? 0 : 1;
 bookApi.updateStatus(row.id, newStatus).then(() => {
 row.status = newStatus;
 }).catch(err => {
 console.error(err);
 });
};
const deleteBook = (row) => {
 bookApi.delete(row.id).then(() => {
 loadBooks();
 }).catch(err => {
 console.error(err);
 });
};
const formatWordCount = (count) => {
 if (!count)
 return '0';
 if (count >= 10000) {
 return (count / 10000).toFixed(1) + '万';
 }
 return count.toString();
};
onMounted(() => {
 loadBooks();
});
</script>

<style>
.book-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  width: 300px;
}
</style>