<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-size: 16px; font-weight: bold">数据定义管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增数据定义
          </el-button>
        </div>
      </template>
      
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="display_name" label="显示名称" width="150" />
        <el-table-column prop="code_name" label="代码名称" width="150" />
        <el-table-column prop="category_name" label="分类" width="120" />
        <el-table-column label="类型" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.is_original" type="success">原始数据</el-tag>
            <el-tag v-else type="warning">指标数据</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否已定义" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_defined ? 'success' : 'info'">
              {{ scope.row.is_defined ? '已定义' : '未定义' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_enabled" label="状态" width="100">
          <template #default="scope">
            <el-switch
              :model-value="scope.row.is_enabled === 1"
              @change="handleToggleStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="350" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              v-if="!scope.row.is_defined" 
              link type="success" 
              @click="handleDefine(scope.row)"
            >
              完成定义
            </el-button>
            <el-button 
              v-if="scope.row.is_defined" 
              link type="warning" 
              @click="handleManageData(scope.row)"
            >
              数据管理
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog
      v-model="dialogVisible"
      :title="formData.id ? '编辑数据定义' : '新增数据定义'"
      width="900px"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="formData" label-width="120px">
            <el-form-item label="显示名称" required>
              <el-input v-model="formData.display_name" placeholder="请输入显示名称" />
            </el-form-item>
            <el-form-item label="代码名称" required>
              <el-input v-model="formData.code_name" placeholder="请输入代码名称（将用作表名）" />
            </el-form-item>
            <el-form-item label="所属分类">
              <el-select v-model="formData.category_id" placeholder="请选择分类" style="width: 100%" clearable>
                <el-option
                  v-for="cat in categories"
                  :key="cat.id"
                  :label="cat.category_name"
                  :value="cat.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="formData.description" type="textarea" placeholder="请输入描述" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="属性定义" name="attributes">
          <div style="margin-bottom: 10px">
            <el-button type="primary" size="small" @click="addAttribute">
              <el-icon><Plus /></el-icon>
              添加属性
            </el-button>
          </div>
          <el-table :data="formData.attributes" style="width: 100%" border>
            <el-table-column label="属性代码" width="140">
              <template #default="scope">
                <el-input v-model="scope.row.attribute_code" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="属性名称" width="140">
              <template #default="scope">
                <el-input v-model="scope.row.attribute_name" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="属性类型" width="140">
              <template #default="scope">
                <el-select v-model="scope.row.attribute_type" size="small" style="width: 100%">
                  <el-option label="维度" value="dimension" />
                  <el-option label="数据定义" value="data_definition" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="关联维度/数据定义">
              <template #default="scope">
                <el-select 
                  v-if="scope.row.attribute_type === 'dimension'" 
                  v-model="scope.row.dimension_id" 
                  size="small" 
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="dim in dimensions"
                    :key="dim.id"
                    :label="`${dim.dimension_name} (${dim.dimension_code})`"
                    :value="dim.id"
                  />
                </el-select>
                <el-select 
                  v-else 
                  v-model="scope.row.referenced_data_definition_id" 
                  size="small" 
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="dd in definedDataDefinitions"
                    :key="dd.id"
                    :label="`${dd.display_name} (${dd.code_name})`"
                    :value="dd.id"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="排序" width="80">
              <template #default="scope">
                <el-input-number v-model="scope.row.sort_order" size="small" :min="0" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button link type="danger" @click="removeAttribute(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="索引定义" name="indexes">
          <div style="margin-bottom: 10px">
            <el-button type="primary" size="small" @click="addIndex">
              <el-icon><Plus /></el-icon>
              添加索引
            </el-button>
          </div>
          <el-table :data="formData.indexes" style="width: 100%" border>
            <el-table-column label="属性代码">
              <template #default="scope">
                <el-select v-model="scope.row.attribute_code" size="small" style="width: 100%" clearable>
                  <el-option
                    v-for="attr in formData.attributes"
                    :key="attr.attribute_code"
                    :label="`${attr.attribute_name} (${attr.attribute_code})`"
                    :value="attr.attribute_code"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="索引名称" width="200">
              <template #default="scope">
                <el-input v-model="scope.row.index_name" size="small" placeholder="可选" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button link type="danger" @click="removeIndex(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="dataDialogVisible"
      :title="`数据管理 - ${currentDD?.display_name}`"
      width="1100px"
    >
      <template v-if="currentDD">
        <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center">
          <el-input 
            v-model="filterText" 
            placeholder="搜索..." 
            style="width: 300px" 
            clearable
            @clear="loadDynamicData"
            @keyup.enter="loadDynamicData"
          >
            <template #append>
              <el-icon @click="loadDynamicData"><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleAddData">
            <el-icon><Plus /></el-icon>
            新增数据
          </el-button>
        </div>
        
        <el-table :data="dynamicDataList" style="width: 100%" border>
          <el-table-column
            v-for="col in dynamicColumns"
            :key="col.column_code"
            :prop="col.column_code"
            :label="col.attribute_name"
            show-overflow-tooltip
          />
          <el-table-column prop="created_at" label="创建时间" width="180" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button link type="primary" @click="handleEditData(scope.row)">编辑</el-button>
              <el-button link type="danger" @click="handleDeleteData(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div style="margin-top: 15px; text-align: right">
          <el-pagination
            v-model:current-page="dynamicPage"
            :page-size="dynamicPageSize"
            :total="dynamicTotal"
            layout="total, sizes, prev, pager, next"
            :page-sizes="[10, 20, 50, 100]"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="dataFormVisible"
      :title="editingData ? '编辑数据' : '新增数据'"
      width="600px"
    >
      <el-form :model="dataForm" label-width="120px">
        <el-form-item 
          v-for="col in dynamicColumns" 
          :key="col.column_code"
          :label="col.attribute_name"
        >
          <el-date-picker
            v-if="col.value_type === 'date'"
            v-model="dataForm[col.column_code]"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
          <el-input-number
            v-else-if="col.value_type === 'number'"
            v-model="dataForm[col.column_code]"
            :precision="2"
            style="width: 100%"
          />
          <el-input
            v-else
            v-model="dataForm[col.column_code]"
            placeholder="请输入值"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveData">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { dataDefinitionApi, categoryApi, dimensionApi } from '@/api'

const tableData = ref([])
const categories = ref([])
const dimensions = ref([])
const definedDataDefinitions = ref([])
const dialogVisible = ref(false)
const activeTab = ref('basic')

const formData = reactive({
  id: null,
  display_name: '',
  code_name: '',
  description: '',
  category_id: null,
  attributes: [],
  indexes: []
})

const dataDialogVisible = ref(false)
const currentDD = ref(null)
const dynamicColumns = ref([])
const dynamicDataList = ref([])
const dynamicPage = ref(1)
const dynamicPageSize = ref(20)
const dynamicTotal = ref(0)
const filterText = ref('')

const dataFormVisible = ref(false)
const editingData = ref(null)
const dataForm = reactive({})

const loadData = async () => {
  try {
    const res = await dataDefinitionApi.list()
    if (res.data.code === 200) {
      tableData.value = res.data.data
      definedDataDefinitions.value = res.data.data.filter(d => d.is_defined)
    }
  } catch (err) {
    ElMessage.error('加载数据失败')
    console.error(err)
  }
}

const loadCategories = async () => {
  try {
    const res = await categoryApi.list({ is_enabled: 1 })
    if (res.data.code === 200) {
      categories.value = res.data.data
    }
  } catch (err) {
    console.error(err)
  }
}

const loadDimensions = async () => {
  try {
    const res = await dimensionApi.list({ is_enabled: 1 })
    if (res.data.code === 200) {
      dimensions.value = res.data.data
    }
  } catch (err) {
    console.error(err)
  }
}

const handleAdd = () => {
  formData.id = null
  formData.display_name = ''
  formData.code_name = ''
  formData.description = ''
  formData.category_id = null
  formData.attributes = []
  formData.indexes = []
  activeTab.value = 'basic'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  formData.id = row.id
  formData.display_name = row.display_name
  formData.code_name = row.code_name
  formData.description = row.description || ''
  formData.category_id = row.category_id
  formData.attributes = row.attributes ? JSON.parse(JSON.stringify(row.attributes)) : []
  formData.indexes = row.indexes ? JSON.parse(JSON.stringify(row.indexes)) : []
  activeTab.value = 'basic'
  dialogVisible.value = true
}

const addAttribute = () => {
  formData.attributes.push({
    attribute_code: '',
    attribute_name: '',
    attribute_type: 'dimension',
    dimension_id: null,
    referenced_data_definition_id: null,
    sort_order: formData.attributes.length
  })
}

const removeAttribute = (index) => {
  formData.attributes.splice(index, 1)
}

const addIndex = () => {
  formData.indexes.push({
    attribute_code: '',
    index_name: '',
    sort_order: formData.indexes.length
  })
}

const removeIndex = (index) => {
  formData.indexes.splice(index, 1)
}

const handleSave = async () => {
  if (!formData.display_name || !formData.code_name) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  try {
    if (formData.id) {
      const res = await dataDefinitionApi.update(formData.id, {
        display_name: formData.display_name,
        description: formData.description,
        category_id: formData.category_id,
        attributes: formData.attributes,
        indexes: formData.indexes
      })
      if (res.data.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        loadData()
      }
    } else {
      const res = await dataDefinitionApi.create({
        display_name: formData.display_name,
        code_name: formData.code_name,
        description: formData.description,
        category_id: formData.category_id,
        attributes: formData.attributes,
        indexes: formData.indexes
      })
      if (res.data.code === 200) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        loadData()
      }
    }
  } catch (err) {
    ElMessage.error('保存失败')
    console.error(err)
  }
}

const handleDefine = (row) => {
  ElMessageBox.confirm('确定要完成定义并创建数据表吗？此操作后属性将不可修改。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await dataDefinitionApi.define(row.id)
      if (res.data.code === 200) {
        ElMessage.success('定义成功，数据表已创建')
        loadData()
      }
    } catch (err) {
      ElMessage.error('定义失败')
      console.error(err)
    }
  }).catch(() => {})
}

const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.is_enabled === 1 ? 0 : 1
    const res = await dataDefinitionApi.update(row.id, { is_enabled: newStatus })
    if (res.data.code === 200) {
      ElMessage.success('状态更新成功')
      loadData()
    }
  } catch (err) {
    ElMessage.error('状态更新失败')
    console.error(err)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该数据定义吗？关联的数据表也会被删除。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await dataDefinitionApi.delete(row.id)
      if (res.data.code === 200) {
        ElMessage.success('删除成功')
        loadData()
      }
    } catch (err) {
      ElMessage.error('删除失败')
      console.error(err)
    }
  }).catch(() => {})
}

const handleManageData = async (row) => {
  currentDD.value = row
  try {
    const res = await dataDefinitionApi.getColumns(row.id)
    if (res.data.code === 200) {
      dynamicColumns.value = res.data.data
    }
  } catch (err) {
    console.error(err)
  }
  dynamicPage.value = 1
  filterText.value = ''
  await loadDynamicData()
  dataDialogVisible.value = true
}

const loadDynamicData = async () => {
  if (!currentDD.value) return
  
  try {
    const params = {
      page: dynamicPage.value,
      page_size: dynamicPageSize.value
    }
    
    if (filterText.value) {
      const filterObj = {}
      if (dynamicColumns.value.length > 0) {
        filterObj[dynamicColumns.value[0].column_code] = filterText.value
      }
      params.filters = JSON.stringify(filterObj)
    }
    
    const res = await dataDefinitionApi.getData(currentDD.value.id, params)
    if (res.data.code === 200) {
      dynamicDataList.value = res.data.data.list
      dynamicTotal.value = res.data.data.total
    }
  } catch (err) {
    ElMessage.error('加载数据失败')
    console.error(err)
  }
}

const handleSizeChange = (val) => {
  dynamicPageSize.value = val
  dynamicPage.value = 1
  loadDynamicData()
}

const handleCurrentChange = (val) => {
  dynamicPage.value = val
  loadDynamicData()
}

const handleAddData = () => {
  editingData.value = null
  Object.keys(dataForm).forEach(key => delete dataForm[key])
  dataFormVisible.value = true
}

const handleEditData = (row) => {
  editingData.value = row
  Object.keys(dataForm).forEach(key => delete dataForm[key])
  dynamicColumns.value.forEach(col => {
    dataForm[col.column_code] = row[col.column_code]
  })
  dataFormVisible.value = true
}

const handleSaveData = async () => {
  try {
    if (editingData.value) {
      const res = await dataDefinitionApi.updateData(
        currentDD.value.id, 
        editingData.value.data_id, 
        { data: { ...dataForm } }
      )
      if (res.data.code === 200) {
        ElMessage.success('更新成功')
        dataFormVisible.value = false
        loadDynamicData()
      }
    } else {
      const res = await dataDefinitionApi.createData(
        currentDD.value.id, 
        { data: { ...dataForm } }
      )
      if (res.data.code === 200) {
        ElMessage.success('创建成功')
        dataFormVisible.value = false
        loadDynamicData()
      }
    }
  } catch (err) {
    ElMessage.error('保存失败')
    console.error(err)
  }
}

const handleDeleteData = (row) => {
  ElMessageBox.confirm('确定要删除该数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await dataDefinitionApi.deleteData(currentDD.value.id, row.data_id)
      if (res.data.code === 200) {
        ElMessage.success('删除成功')
        loadDynamicData()
      }
    } catch (err) {
      ElMessage.error('删除失败')
      console.error(err)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
  loadCategories()
  loadDimensions()
})
</script>
