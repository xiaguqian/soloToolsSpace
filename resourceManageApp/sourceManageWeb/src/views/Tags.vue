<template>
  <div class="tags-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>标签管理</span>
          <el-button type="primary" @click="showCreateDialog = true">新建标签</el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="标签类型">
          <el-select v-model="searchForm.tagType" placeholder="全部" clearable style="width: 150px">
            <el-option label="公共标签" value="public" />
            <el-option label="私有标签" value="private" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="搜索标签名" clearable style="width: 200px" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table
        :data="tagList"
        v-loading="loading"
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="tag_name" label="标签名称" min-width="150" />
        <el-table-column prop="tag_type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.tag_type === 'public' ? 'success' : 'info'" size="small">
              {{ row.tag_type === 'public' ? '公共标签' : '私有标签' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user_count" label="使用人数" width="100" />
        <el-table-column prop="usage_count" label="使用次数" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              size="small" 
              :disabled="row.tag_type === 'public'"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              link 
              size="small" 
              :disabled="row.tag_type === 'public'"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="searchForm.page"
        v-model:page-size="searchForm.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end; display: flex"
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </el-card>
    
    <el-dialog v-model="showCreateDialog" title="新建标签" width="500px">
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-position="left" label-width="80px">
        <el-form-item label="标签名称" prop="tagName">
          <el-input v-model="createForm.tagName" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签类型" prop="tagType">
          <el-radio-group v-model="createForm.tagType">
            <el-radio value="private">私有标签</el-radio>
            <el-radio v-if="userStore.isSystemUser" value="public">公共标签</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标签颜色">
          <el-color-picker v-model="createForm.color" show-alpha />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="showEditDialog" title="编辑标签" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-position="left" label-width="80px">
        <el-form-item label="标签名称" prop="tagName">
          <el-input v-model="editForm.tagName" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签颜色">
          <el-color-picker v-model="editForm.color" show-alpha />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="editing" @click="handleUpdate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTagList, createTag, updateTag, deleteTag } from '@/api/tag'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const loading = ref(false)
const creating = ref(false)
const editing = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)

const createFormRef = ref(null)
const editFormRef = ref(null)

const tagList = ref([])
const total = ref(0)

const searchForm = reactive({
  page: 1,
  pageSize: 10,
  tagType: '',
  keyword: ''
})

const createForm = reactive({
  tagName: '',
  tagType: 'private',
  color: ''
})

const editForm = reactive({
  id: null,
  tagName: '',
  color: ''
})

const createRules = {
  tagName: [{ required: true, message: '请输入标签名称', trigger: 'blur' }]
}

const editRules = {
  tagName: [{ required: true, message: '请输入标签名称', trigger: 'blur' }]
}

const handleSearch = async () => {
  try {
    loading.value = true
    const params = {
      page: searchForm.page,
      pageSize: searchForm.pageSize
    }
    
    if (searchForm.tagType) params.tagType = searchForm.tagType
    if (searchForm.keyword) params.keyword = searchForm.keyword
    
    const res = await getTagList(params)
    tagList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('Search tags error:', error)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchForm.page = 1
  searchForm.pageSize = 10
  searchForm.tagType = ''
  searchForm.keyword = ''
  handleSearch()
}

const handleCreate = async () => {
  if (!createFormRef.value) return
  
  try {
    await createFormRef.value.validate()
    creating.value = true
    
    await createTag({
      tagName: createForm.tagName,
      tagType: createForm.tagType,
      color: createForm.color
    })
    
    ElMessage.success('标签创建成功')
    showCreateDialog.value = false
    createForm.tagName = ''
    createForm.tagType = 'private'
    createForm.color = ''
    handleSearch()
  } catch (error) {
    console.error('Create tag error:', error)
  } finally {
    creating.value = false
  }
}

const handleEdit = (row) => {
  editForm.id = row.id
  editForm.tagName = row.tag_name
  editForm.color = row.color || ''
  showEditDialog.value = true
}

const handleUpdate = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    editing.value = true
    
    await updateTag(editForm.id, {
      tagName: editForm.tagName,
      color: editForm.color
    })
    
    ElMessage.success('标签更新成功')
    showEditDialog.value = false
    handleSearch()
  } catch (error) {
    console.error('Update tag error:', error)
  } finally {
    editing.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除标签"${row.tag_name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteTag(row.id)
    ElMessage.success('删除成功')
    handleSearch()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete tag error:', error)
    }
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}
</style>
