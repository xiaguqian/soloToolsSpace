<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-size: 16px; font-weight: bold">查询语句管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增查询语句
          </el-button>
        </div>
      </template>
      
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="query_name" label="查询名称" width="200" />
        <el-table-column prop="query_type" label="查询类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.query_type === 'single' ? 'info' : 'warning'">
              {{ scope.row.query_type === 'single' ? '单表' : '多表' }}
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
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="success" @click="handleExecute(scope.row)">执行</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog
      v-model="dialogVisible"
      :title="formData.id ? '编辑查询语句' : '新增查询语句'"
      width="1200px"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="formData" label-width="120px">
            <el-form-item label="查询名称" required>
              <el-input v-model="formData.query_name" placeholder="请输入查询名称" />
            </el-form-item>
            <el-form-item label="查询类型" required>
              <el-radio-group v-model="formData.query_type">
                <el-radio value="single">单表查询</el-radio>
                <el-radio value="multiple">多表查询</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="表配置" name="table">
          <div v-if="formData.query_type === 'single'">
            <el-form :model="singleTableForm" label-width="120px">
              <el-form-item label="选择表" required>
                <el-select v-model="singleTableForm.table_name" placeholder="请选择表" style="width: 100%">
                  <el-option
                    v-for="dd in definedDataDefinitions"
                    :key="dd.id"
                    :label="`${dd.display_name} (${dd.code_name})`"
                    :value="dd.code_name"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="表别名">
                <el-input v-model="singleTableForm.table_alias" placeholder="请输入表别名，默认 t" />
              </el-form-item>
            </el-form>
          </div>
          
          <div v-else>
            <div style="margin-bottom: 10px">
              <el-button type="primary" size="small" @click="addJoin">
                <el-icon><Plus /></el-icon>
                添加连接
              </el-button>
            </div>
            <el-table :data="formData.table_info.joins" style="width: 100%" border>
              <el-table-column label="连接类型" width="130">
                <template #default="scope">
                  <el-select v-model="scope.row.join_type" size="small" style="width: 100%">
                    <el-option label="内连接" value="INNER" />
                    <el-option label="左连接" value="LEFT" />
                    <el-option label="右连接" value="RIGHT" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="左表">
                <template #default="scope">
                  <el-select v-model="scope.row.left_table" size="small" style="width: 100%">
                    <el-option
                      v-for="dd in definedDataDefinitions"
                      :key="dd.id"
                      :label="dd.code_name"
                      :value="dd.code_name"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="左表别名" width="100">
                <template #default="scope">
                  <el-input v-model="scope.row.left_alias" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="右表">
                <template #default="scope">
                  <el-select v-model="scope.row.right_table" size="small" style="width: 100%">
                    <el-option
                      v-for="dd in definedDataDefinitions"
                      :key="dd.id"
                      :label="dd.code_name"
                      :value="dd.code_name"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="右表别名" width="100">
                <template #default="scope">
                  <el-input v-model="scope.row.right_alias" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="连接字段(左)" width="120">
                <template #default="scope">
                  <el-input v-model="scope.row.left_field" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="连接字段(右)" width="120">
                <template #default="scope">
                  <el-input v-model="scope.row.right_field" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="scope">
                  <el-button link type="danger" @click="removeJoin(scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="选择字段" name="fields">
          <div style="margin-bottom: 10px">
            <el-button type="primary" size="small" @click="addField">
              <el-icon><Plus /></el-icon>
              添加字段
            </el-button>
          </div>
          <el-table :data="formData.select_fields" style="width: 100%" border>
            <el-table-column label="表别名" width="100">
              <template #default="scope">
                <el-input v-model="scope.row.table_alias" size="small" placeholder="可选" />
              </template>
            </el-table-column>
            <el-table-column label="字段代码" width="150">
              <template #default="scope">
                <el-input v-model="scope.row.field_code" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="字段别名" width="150">
              <template #default="scope">
                <el-input v-model="scope.row.field_alias" size="small" placeholder="可选" />
              </template>
            </el-table-column>
            <el-table-column label="公式">
              <template #default="scope">
                <el-select v-model="scope.row.formula_id" size="small" style="width: 100%" clearable>
                  <el-option
                    v-for="formula in formulas"
                    :key="formula.id"
                    :label="`${formula.formula_name} - ${formula.formula_logic}`"
                    :value="formula.id"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button link type="danger" @click="removeField(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="分组与排序" name="group">
          <el-form label-width="120px">
            <el-form-item label="分组字段">
              <el-select
                v-model="formData.group_by"
                multiple
                placeholder="选择分组字段（可选）"
                style="width: 100%"
              >
                <el-option
                  v-for="field in formData.select_fields"
                  :key="field.field_code"
                  :label="field.field_alias || field.field_code"
                  :value="field.field_alias || field.field_code"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="排序">
              <div style="margin-bottom: 10px">
                <el-button type="primary" size="small" @click="addOrder">
                  <el-icon><Plus /></el-icon>
                  添加排序
                </el-button>
              </div>
              <el-table v-if="formData.order_by && formData.order_by.length" :data="formData.order_by" style="width: 100%" border>
                <el-table-column label="字段">
                  <template #default="scope">
                    <el-select v-model="scope.row.field" size="small" style="width: 100%">
                      <el-option
                        v-for="field in formData.select_fields"
                        :key="field.field_code"
                        :label="field.field_alias || field.field_code"
                        :value="field.field_alias || field.field_code"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="方向" width="150">
                  <template #default="scope">
                    <el-select v-model="scope.row.direction" size="small" style="width: 100%">
                      <el-option label="升序" value="ASC" />
                      <el-option label="降序" value="DESC" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80">
                  <template #default="scope">
                    <el-button link type="danger" @click="removeOrder(scope.$index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="executeDialogVisible"
      title="查询结果"
      width="1000px"
    >
      <div v-if="executeResult">
        <el-card style="margin-bottom: 15px">
          <template #header>
            <span>生成的SQL</span>
          </template>
          <pre style="margin: 0; white-space: pre-wrap; word-break: break-all">{{ executeResult.sql }}</pre>
        </el-card>
        <el-table :data="executeResult.data" style="width: 100%" border>
          <el-table-column
            v-for="col in executeResult.columns"
            :key="col"
            :prop="col"
            :label="col"
            show-overflow-tooltip
          />
        </el-table>
        <el-empty v-if="!executeResult.data || executeResult.data.length === 0" description="暂无数据" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryStatementApi, dataDefinitionApi, formulaApi } from '@/api'

const tableData = ref([])
const definedDataDefinitions = ref([])
const formulas = ref([])
const dialogVisible = ref(false)
const activeTab = ref('basic')
const executeDialogVisible = ref(false)
const executeResult = ref(null)

const formData = reactive({
  id: null,
  query_name: '',
  query_type: 'single',
  table_info: {},
  select_fields: [],
  where_conditions: [],
  group_by: [],
  order_by: []
})

const singleTableForm = reactive({
  table_name: '',
  table_alias: 't'
})

const loadData = async () => {
  try {
    const res = await queryStatementApi.list()
    if (res.data.code === 200) {
      tableData.value = res.data.data
    }
  } catch (err) {
    ElMessage.error('加载数据失败')
    console.error(err)
  }
}

const loadDataDefinitions = async () => {
  try {
    const res = await dataDefinitionApi.list({ is_defined: 1 })
    if (res.data.code === 200) {
      definedDataDefinitions.value = res.data.data
    }
  } catch (err) {
    console.error(err)
  }
}

const loadFormulas = async () => {
  try {
    const res = await formulaApi.list({ is_enabled: 1 })
    if (res.data.code === 200) {
      formulas.value = res.data.data
    }
  } catch (err) {
    console.error(err)
  }
}

const handleAdd = () => {
  formData.id = null
  formData.query_name = ''
  formData.query_type = 'single'
  formData.table_info = {}
  formData.select_fields = []
  formData.where_conditions = []
  formData.group_by = []
  formData.order_by = []
  singleTableForm.table_name = ''
  singleTableForm.table_alias = 't'
  activeTab.value = 'basic'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  formData.id = row.id
  formData.query_name = row.query_name
  formData.query_type = row.query_type
  formData.table_info = row.table_info || {}
  formData.select_fields = row.select_fields ? JSON.parse(JSON.stringify(row.select_fields)) : []
  formData.where_conditions = row.where_conditions ? JSON.parse(JSON.stringify(row.where_conditions)) : []
  formData.group_by = row.group_by ? JSON.parse(JSON.stringify(row.group_by)) : []
  formData.order_by = row.order_by ? JSON.parse(JSON.stringify(row.order_by)) : []
  
  if (row.query_type === 'single' && row.table_info) {
    singleTableForm.table_name = row.table_info.table_name || ''
    singleTableForm.table_alias = row.table_info.table_alias || 't'
  }
  
  activeTab.value = 'basic'
  dialogVisible.value = true
}

const addJoin = () => {
  if (!formData.table_info.joins) {
    formData.table_info.joins = []
  }
  formData.table_info.joins.push({
    join_type: 'INNER',
    left_table: '',
    left_alias: 't1',
    right_table: '',
    right_alias: 't2',
    left_field: 'data_id',
    right_field: 'data_id'
  })
}

const removeJoin = (index) => {
  formData.table_info.joins.splice(index, 1)
}

const addField = () => {
  formData.select_fields.push({
    table_alias: '',
    field_code: '',
    field_alias: '',
    formula_id: null
  })
}

const removeField = (index) => {
  formData.select_fields.splice(index, 1)
}

const addOrder = () => {
  if (!formData.order_by) {
    formData.order_by = []
  }
  formData.order_by.push({
    field: '',
    direction: 'ASC'
  })
}

const removeOrder = (index) => {
  formData.order_by.splice(index, 1)
}

const handleSave = async () => {
  if (!formData.query_name) {
    ElMessage.warning('请填写查询名称')
    return
  }
  
  if (formData.query_type === 'single') {
    if (!singleTableForm.table_name) {
      ElMessage.warning('请选择查询表')
      return
    }
    formData.table_info = {
      table_name: singleTableForm.table_name,
      table_alias: singleTableForm.table_alias || 't'
    }
  } else {
    if (!formData.table_info.joins || formData.table_info.joins.length === 0) {
      ElMessage.warning('请添加至少一个表连接')
      return
    }
  }
  
  if (formData.select_fields.length === 0) {
    ElMessage.warning('请至少选择一个字段')
    return
  }
  
  try {
    const saveData = {
      query_name: formData.query_name,
      query_type: formData.query_type,
      table_info: formData.table_info,
      select_fields: formData.select_fields,
      where_conditions: formData.where_conditions.length > 0 ? formData.where_conditions : null,
      group_by: formData.group_by.length > 0 ? formData.group_by : null,
      order_by: formData.order_by && formData.order_by.length > 0 ? formData.order_by : null
    }
    
    if (formData.id) {
      const res = await queryStatementApi.update(formData.id, saveData)
      if (res.data.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        loadData()
      }
    } else {
      const res = await queryStatementApi.create(saveData)
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

const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.is_enabled === 1 ? 0 : 1
    const res = await queryStatementApi.update(row.id, { is_enabled: newStatus })
    if (res.data.code === 200) {
      ElMessage.success('状态更新成功')
      loadData()
    }
  } catch (err) {
    ElMessage.error('状态更新失败')
    console.error(err)
  }
}

const handleExecute = async (row) => {
  try {
    const res = await queryStatementApi.execute(row.id)
    if (res.data.code === 200) {
      executeResult.value = res.data.data
      executeDialogVisible.value = true
    }
  } catch (err) {
    ElMessage.error('执行失败')
    console.error(err)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该查询语句吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await queryStatementApi.delete(row.id)
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

onMounted(() => {
  loadData()
  loadDataDefinitions()
  loadFormulas()
})
</script>
