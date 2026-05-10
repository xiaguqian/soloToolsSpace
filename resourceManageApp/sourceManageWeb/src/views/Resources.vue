<template>
  <div class="resources-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>资源列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="showBatchTagDialog = true" :disabled="selectedResources.length === 0">
              批量打标
            </el-button>
          </div>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="来源系统">
          <el-select v-model="searchForm.sourceSystem" placeholder="全部" clearable style="width: 150px">
            <el-option label="DAMM系统" value="DAMM" />
            <el-option label="其他系统" value="OTHER" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="访问权限">
          <el-select v-model="searchForm.accessPermission" placeholder="全部" clearable style="width: 150px">
            <el-option label="公开" value="public" />
            <el-option label="私有" value="private" />
            <el-option v-if="userStore.isSystemUser" label="系统私有" value="manage" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="文件类型">
          <el-select v-model="searchForm.fileType" placeholder="全部" clearable style="width: 150px">
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
            <el-option label="文档" value="textfile" />
            <el-option label="其他" value="exefile" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标签">
          <el-select
            v-model="searchForm.tagIds"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="选择标签"
            style="width: 300px"
            :remote-method="remoteSearchTags"
            :loading="tagLoading"
          >
            <el-option
              v-for="tag in tagOptions"
              :key="tag.id"
              :label="tag.tag_name"
              :value="tag.id"
            >
              <span>{{ tag.tag_name }}</span>
              <el-tag :type="tag.tag_type === 'public' ? 'success' : 'info'" size="small">
                {{ tag.tag_type === 'public' ? '公共' : '私有' }}
              </el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table
        :data="resourceList"
        v-loading="loading"
        style="width: 100%; margin-top: 20px"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="original_name" label="文件名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="source_system" label="来源系统" width="120" />
        <el-table-column prop="access_permission" label="访问权限" width="120">
          <template #default="{ row }">
            <el-tag :type="getPermissionType(row.access_permission)" size="small">
              {{ getPermissionText(row.access_permission) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="file_type" label="文件类型" width="100" />
        <el-table-column label="大小" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.file_size) }}
          </template>
        </el-table-column>
        <el-table-column prop="download_count" label="下载次数" width="100" />
        <el-table-column label="标签" min-width="150">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags || []"
              :key="tag.id"
              :type="tag.tag_type === 'public' ? 'success' : 'info'"
              size="small"
              class="tag-item"
              closable
              @close="handleRemoveTag(row, tag)"
            >
              {{ tag.tag_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handlePreview(row)">预览</el-button>
            <el-button type="primary" link size="small" @click="handleDownload(row)">下载</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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
    
    <el-dialog v-model="showBatchTagDialog" title="批量打标" width="600px">
      <el-form :model="batchTagForm" label-position="left" label-width="100px">
        <el-form-item label="选择标签">
          <el-select
            v-model="batchTagForm.tagNames"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入标签名称，按回车添加"
            style="width: 100%"
          >
            <el-option
              v-for="tag in existingTags"
              :key="tag.id"
              :label="tag.tag_name"
              :value="tag.tag_name"
            />
          </el-select>
          <div class="form-tip">提示：可以直接输入新标签名称，按回车键添加</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBatchTagDialog = false">取消</el-button>
        <el-button type="primary" :loading="tagging" @click="handleBatchTag">确认</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="showPreviewDialog" title="文件预览" width="80%">
      <div v-if="previewResource" class="preview-content">
        <template v-if="previewResource.file_type === 'image'">
          <img :src="getPreviewUrl(previewResource.file_id)" style="max-width: 100%; max-height: 70vh" />
        </template>
        <template v-else-if="previewResource.file_type === 'video'">
          <video :src="getPreviewUrl(previewResource.file_id)" controls style="max-width: 100%; max-height: 70vh" />
        </template>
        <template v-else>
          <div class="no-preview">
            <el-icon :size="80"><Document /></el-icon>
            <p>该文件类型不支持预览</p>
            <p>文件名: {{ previewResource.original_name }}</p>
          </div>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getResourceListByTags, deleteResource, previewFile } from '@/api/resource'
import { getTagList, batchTagResources, removeTagFromResource } from '@/api/tag'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const loading = ref(false)
const tagging = ref(false)
const tagLoading = ref(false)
const showBatchTagDialog = ref(false)
const showPreviewDialog = ref(false)
const previewResource = ref(null)

const resourceList = ref([])
const selectedResources = ref([])
const total = ref(0)
const tagOptions = ref([])
const existingTags = ref([])

const searchForm = reactive({
  page: 1,
  pageSize: 10,
  sourceSystem: '',
  accessPermission: '',
  fileType: '',
  tagIds: []
})

const batchTagForm = reactive({
  tagNames: []
})

const remoteSearchTags = async (query) => {
  if (!query) {
    tagOptions.value = []
    return
  }
  
  try {
    tagLoading.value = true
    const res = await getTagList({ keyword: query, pageSize: 20 })
    tagOptions.value = res.data.list
  } catch (error) {
    console.error('Search tags error:', error)
  } finally {
    tagLoading.value = false
  }
}

const loadExistingTags = async () => {
  try {
    const res = await getTagList({ pageSize: 100 })
    existingTags.value = res.data.list
  } catch (error) {
    console.error('Load tags error:', error)
  }
}

const handleSearch = async () => {
  try {
    loading.value = true
    const params = {
      page: searchForm.page,
      pageSize: searchForm.pageSize
    }
    
    if (searchForm.sourceSystem) params.sourceSystem = searchForm.sourceSystem
    if (searchForm.accessPermission) params.accessPermission = searchForm.accessPermission
    if (searchForm.fileType) params.fileType = searchForm.fileType
    if (searchForm.tagIds && searchForm.tagIds.length > 0) {
      params.tagIds = searchForm.tagIds.join(',')
    }
    
    const res = await getResourceListByTags(params)
    resourceList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('Search resources error:', error)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchForm.page = 1
  searchForm.pageSize = 10
  searchForm.sourceSystem = ''
  searchForm.accessPermission = ''
  searchForm.fileType = ''
  searchForm.tagIds = []
  handleSearch()
}

const handleSelectionChange = (selection) => {
  selectedResources.value = selection
}

const handleBatchTag = async () => {
  if (batchTagForm.tagNames.length === 0) {
    ElMessage.warning('请输入标签')
    return
  }
  
  try {
    tagging.value = true
    const resourceIds = selectedResources.value.map(r => r.id)
    await batchTagResources({
      resourceIds,
      tagNames: batchTagForm.tagNames
    })
    
    ElMessage.success('批量打标成功')
    showBatchTagDialog.value = false
    batchTagForm.tagNames = []
    handleSearch()
  } catch (error) {
    console.error('Batch tag error:', error)
  } finally {
    tagging.value = false
  }
}

const handleRemoveTag = async (row, tag) => {
  try {
    await ElMessageBox.confirm(`确定要移除标签"${tag.tag_name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await removeTagFromResource(row.id, tag.id)
    ElMessage.success('移除标签成功')
    handleSearch()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Remove tag error:', error)
    }
  }
}

const handlePreview = (row) => {
  previewResource.value = row
  showPreviewDialog.value = true
}

const handleDownload = (row) => {
  const token = localStorage.getItem('token')
  const downloadUrl = `/api/resources/${row.file_id}/download`
  
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = row.original_name
  
  if (token) {
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${token}`)
    
    fetch(downloadUrl, { headers, method: 'GET' })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = row.original_name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      })
  } else {
    link.click()
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该资源吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteResource(row.file_id)
    ElMessage.success('删除成功')
    handleSearch()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete resource error:', error)
    }
  }
}

const getPermissionType = (permission) => {
  const types = {
    public: 'success',
    private: 'info',
    manage: 'danger'
  }
  return types[permission] || 'info'
}

const getPermissionText = (permission) => {
  const texts = {
    public: '公开',
    private: '私有',
    manage: '系统私有'
  }
  return texts[permission] || permission
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const getPreviewUrl = (fileId) => {
  const token = localStorage.getItem('token')
  const url = previewFile(fileId)
  return token ? `${url}?token=${token}` : url
}

onMounted(() => {
  handleSearch()
  loadExistingTags()
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

.tag-item {
  margin-right: 4px;
  margin-bottom: 4px;
}

.no-preview {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.no-preview p {
  margin-top: 15px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
