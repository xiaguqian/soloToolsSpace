<template>
  <div class="app-container">
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索模型名称..."
        class="search-input"
        @keyup.enter="loadShortcuts"
      >
        <template #append>
          <el-button @click="loadShortcuts">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
      <el-button type="primary" @click="openAddModal">
        <el-icon><Plus /></el-icon>
        添加快捷入口
      </el-button>
    </div>

    <el-table :data="shortcuts" border stripe class="data-table">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="modelName" label="模型名称" min-width="150" />
      <el-table-column prop="shortcutTypeLabel" label="入口类型" width="120" />
      <el-table-column prop="name" label="入口名称" min-width="100" />
      <el-table-column prop="url" label="链接地址" min-width="200" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
      <el-table-column prop="isActive" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.isActive ? 'success' : 'danger'">
            {{ scope.row.isActive ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="editShortcut(scope.row)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button size="small" type="danger" @click="deleteShortcut(scope.row)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="isEditing ? '编辑快捷入口' : '添加快捷入口'" :visible.sync="modalVisible" width="500px">
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="关联模型" prop="modelId">
          <el-select v-model="form.modelId" placeholder="请选择模型">
            <el-option v-for="model in models" :key="model.id" :label="model.name" :value="model.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="入口类型" prop="shortcutType">
          <el-select v-model="form.shortcutType" placeholder="请选择类型">
            <el-option label="官网入口" value="official" />
            <el-option label="文档入口" value="documentation" />
            <el-option label="API文档" value="api_reference" />
            <el-option label="价格页面" value="pricing" />
            <el-option label="状态页面" value="status" />
          </el-select>
        </el-form-item>
        <el-form-item label="链接地址" prop="url">
          <el-input v-model="form.url" placeholder="请输入链接地址" />
        </el-form-item>
        <el-form-item label="入口名称">
          <el-input v-model="form.name" placeholder="请输入入口名称（可选）" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述（可选）" />
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" @click="saveShortcut">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>import { ref, onMounted } from 'vue';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getShortcuts, createShortcut, updateShortcut, deleteShortcut } from '@/api/shortcuts';
import { getModels } from '@/api/models';
const shortcuts = ref([]);
const models = ref([]);
const searchQuery = ref('');
const modalVisible = ref(false);
const isEditing = ref(false);
const form = ref({
 id: null,
 modelId: '',
 shortcutType: '',
 url: '',
 name: '',
 description: '',
 isActive: true
});
const rules = {
 modelId: [{ required: true, message: '请选择模型', trigger: 'change' }],
 shortcutType: [{ required: true, message: '请选择入口类型', trigger: 'change' }],
 url: [{ required: true, message: '请输入链接地址', trigger: 'blur' }]
};
const formRef = ref(null);
const typeLabels = {
 official: '官网入口',
 documentation: '文档入口',
 api_reference: 'API文档',
 pricing: '价格页面',
 status: '状态页面'
};
onMounted(() => {
 loadShortcuts();
 loadModels();
});
async function loadShortcuts() {
 try {
 const response = await getShortcuts();
 shortcuts.value = response.data.items.map(item => ({
 ...item,
 modelName: getModelName(item.modelId),
 shortcutTypeLabel: typeLabels[item.shortcut_type] || item.shortcut_type,
 isActive: item.is_active,
 createdAt: formatDate(item.created_at)
 }));
 }
 catch (error) {
 ElMessage.error('加载快捷入口失败');
 }
}
async function loadModels() {
 try {
 const response = await getModels({ limit: 100 });
 models.value = response.data.items;
 }
 catch (error) {
 ElMessage.error('加载模型列表失败');
 }
}
function getModelName(modelId) {
 const model = models.value.find(m => m.id === modelId);
 return model ? model.name : '未知模型';
}
function formatDate(dateStr) {
 if (!dateStr)
 return '';
 const date = new Date(dateStr);
 return date.toLocaleString('zh-CN', {
 year: 'numeric',
 month: '2-digit',
 day: '2-digit',
 hour: '2-digit',
 minute: '2-digit',
 second: '2-digit'
 });
}
function openAddModal() {
 isEditing.value = false;
 form.value = {
 id: null,
 modelId: '',
 shortcutType: '',
 url: '',
 name: '',
 description: '',
 isActive: true
 };
 modalVisible.value = true;
}
function editShortcut(row) {
 isEditing.value = true;
 form.value = {
 id: row.id,
 modelId: row.modelId,
 shortcutType: row.shortcut_type,
 url: row.url,
 name: row.name,
 description: row.description,
 isActive: row.isActive
 };
 modalVisible.value = true;
}
async function saveShortcut() {
 if (!formRef.value)
 return;
 formRef.value.validate(async (valid) => {
 if (valid) {
 try {
 const data = {
 model_id: form.value.modelId,
 shortcut_type: form.value.shortcutType,
 url: form.value.url,
 name: form.value.name || undefined,
 description: form.value.description || undefined,
 is_active: form.value.isActive
 };
 if (isEditing.value) {
 await updateShortcut(form.value.id, data);
 ElMessage.success('更新成功');
 }
 else {
 await createShortcut(data);
 ElMessage.success('添加成功');
 }
 modalVisible.value = false;
 loadShortcuts();
 }
 catch (error) {
 ElMessage.error(isEditing.value ? '更新失败' : '添加失败');
 }
 }
 });
}
async function deleteShortcut(row) {
 try {
 await ElMessageBox.confirm('确定要删除这个快捷入口吗？', '确认删除', {
 type: 'warning'
 });
 await deleteShortcut(row.id);
 ElMessage.success('删除成功');
 loadShortcuts();
 }
 catch (error) {
 if (error !== 'cancel') {
 ElMessage.error('删除失败');
 }
 }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.data-table {
  width: 100%;
}
</style>
