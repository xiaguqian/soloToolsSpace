<template>
  <div class="book-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-button @click="goBack"><el-icon><ArrowLeft /></el-icon>返回</el-button>
          <span>书籍目录 - {{ book.name }}</span>
        </div>
      </template>
      
      <div v-if="book" class="book-info">
        <el-row>
          <el-col :span="8">
            <img :src="book.cover" alt="封面" class="cover" />
          </el-col>
          <el-col :span="16">
            <h2>{{ book.name }}</h2>
            <p><strong>作者：</strong>{{ book.author }}</p>
            <p><strong>分类：</strong>{{ book.category }}</p>
            <p><strong>字数：</strong>{{ formatWordCount(book.wordCount) }}</p>
            <p><strong>状态：</strong>
              <el-tag :type="book.isCompleted === 1 ? 'success' : 'warning'">
                {{ book.isCompleted === 1 ? '已完结' : '连载中' }}
              </el-tag>
            </p>
            <p><strong>简介：</strong>{{ book.description }}</p>
          </el-col>
        </el-row>
      </div>
      
      <div class="chapter-section">
        <div class="section-header">
          <span>章节列表</span>
          <div class="batch-actions">
            <el-button size="small" @click="selectAll">全选</el-button>
            <el-button size="small" @click="batchPublish">批量发布</el-button>
            <el-button size="small" type="danger" @click="batchUnpublish">批量下架</el-button>
          </div>
        </div>
        
        <el-table :data="chapters" border>
          <el-table-column width="50">
            <template #default="scope">
              <el-checkbox v-model="scope.row.selected" />
            </template>
          </el-table-column>
          <el-table-column prop="chapterIndex" label="序号" width="80" />
          <el-table-column prop="title" label="章节标题" />
          <el-table-column prop="wordCount" label="字数" width="100" />
          <el-table-column prop="storageType" label="存储方式" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '已发布' : '未发布' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button size="small" @click="editChapter(scope.row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>import { ref, onMounted } from 'vue';
import { ArrowLeft } from '@element-plus/icons-vue';
import { bookApi } from '../api';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const book = ref({});
const chapters = ref([]);
const loadBook = () => {
 const id = route.params.id;
 bookApi.detail(id).then(res => {
 book.value = res.data;
 });
 bookApi.chapters(id).then(res => {
 chapters.value = res.data.map(ch => ({ ...ch, selected: false }));
 }).catch(err => {
 console.error(err);
 });
};
const goBack = () => {
 router.push('/books');
};
const selectAll = () => {
 chapters.value.forEach(ch => ch.selected = true);
};
const batchPublish = () => {
 const selectedIds = chapters.value.filter(ch => ch.selected).map(ch => ch.id);
 if (selectedIds.length === 0)
 return;
 bookApi.batchUpdateChapters(route.params.id, selectedIds, 1).then(() => {
 chapters.value.forEach(ch => {
 if (ch.selected)
 ch.status = 1;
 });
 }).catch(err => {
 console.error(err);
 });
};
const batchUnpublish = () => {
 const selectedIds = chapters.value.filter(ch => ch.selected).map(ch => ch.id);
 if (selectedIds.length === 0)
 return;
 bookApi.batchUpdateChapters(route.params.id, selectedIds, 0).then(() => {
 chapters.value.forEach(ch => {
 if (ch.selected)
 ch.status = 0;
 });
 }).catch(err => {
 console.error(err);
 });
};
const editChapter = (chapter) => {
 alert(`编辑章节: ${chapter.title}`);
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
 loadBook();
});
</script>

<style>
.book-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.book-info {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.cover {
  width: 150px;
  height: 200px;
  object-fit: cover;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.batch-actions {
  display: flex;
  gap: 10px;
}
</style>