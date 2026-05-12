<template>
  <div class="task-editor">
    <div class="editor-header">
      <div class="header-left">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 class="page-title">{{ isEdit ? '编辑爬虫' : '新建爬虫' }}</h2>
      </div>
      <div class="header-right">
        <el-button type="info" @click="testFlow">
          <el-icon><VideoPlay /></el-icon>
          测试运行
        </el-button>
        <el-button type="primary" @click="saveTask">
          <el-icon><Check /></el-icon>
          保存
        </el-button>
      </div>
    </div>

    <el-divider />

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="components-panel">
          <template #header>
            <span>组件列表</span>
          </template>
          <el-input
            v-model="componentSearch"
            placeholder="搜索组件"
            style="margin-bottom: 15px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <div class="component-list">
            <div
              v-for="comp in filteredComponents"
              :key="comp.id"
              class="component-item"
              draggable="true"
              @dragstart="handleDragStart($event, comp)"
            >
              <div class="component-name">{{ comp.chinese_name || comp.name }}</div>
              <div class="component-type">{{ comp.category }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="graph-panel">
          <template #header>
            <div class="graph-header">
              <span>流程图</span>
              <div>
                <el-button size="small" @click="clearGraph">清空</el-button>
                <el-button size="small" @click="autoLayout">自动布局</el-button>
              </div>
            </div>
          </template>
          <div
            ref="graphContainer"
            class="graph-container"
            @drop="handleDrop"
            @dragover.prevent
          ></div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form :model="taskForm" label-width="100px">
              <el-form-item label="任务名称" required>
                <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
              </el-form-item>
              <el-form-item label="任务ID" required>
                <el-input v-model="taskForm.task_id" placeholder="请输入任务ID" :disabled="isEdit" />
              </el-form-item>
              <el-form-item label="描述">
                <el-input
                  v-model="taskForm.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入任务描述"
                />
              </el-form-item>
              <el-form-item label="调度类型">
                <el-select v-model="taskForm.schedule_type" style="width: 100%">
                  <el-option label="手动" value="manual" />
                  <el-option label="定时" value="scheduled" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="taskForm.schedule_type === 'scheduled'" label="Cron表达式">
                <el-input v-model="taskForm.cron_expression" placeholder="如: */5 * * * *" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="节点配置" name="node">
            <div v-if="selectedNode" class="node-config">
              <div class="node-header">
                <div class="node-info">
                  <el-tag type="primary" size="large">{{ selectedNode.component }}</el-tag>
                </div>
                <el-button type="danger" size="small" @click="deleteSelectedNode">
                  <el-icon><Delete /></el-icon>
                  删除节点
                </el-button>
              </div>
              <el-divider />
              
              <el-form :model="nodeConfig" label-width="100px" size="default">
                <div
                  v-for="(prop, key) in selectedComponentSchema?.properties"
                  :key="key"
                  class="form-item-wrapper"
                >
                  <el-form-item :label="prop.description || key" class="form-item">
                    <template v-if="prop.type === 'object' || prop.type === 'array'">
                      <el-input
                        type="textarea"
                        :rows="4"
                        :value="JSON.stringify(nodeConfig[key] || '', null, 2)"
                        @input="handleJsonInput(key, $event)"
                        :placeholder="`${prop.description || key} (JSON格式)`"
                        autosize
                      />
                    </template>
                    <template v-else-if="prop.enum">
                      <el-select v-model="nodeConfig[key]" style="width: 100%" placeholder="请选择">
                        <el-option
                          v-for="opt in prop.enum"
                          :key="opt"
                          :label="opt"
                          :value="opt"
                        />
                      </el-select>
                    </template>
                    <template v-else>
                      <el-input
                        v-model="nodeConfig[key]"
                        :placeholder="`${prop.description || key}，支持模板语法如 \${变量名}`"
                      />
                    </template>
                  </el-form-item>
                </div>
              </el-form>
              
              <div class="node-actions">
                <el-button
                  type="primary"
                  @click="saveNodeConfig"
                >
                  <el-icon><Check /></el-icon>
                  保存配置
                </el-button>
              </div>
            </div>
            <div v-else class="no-selection">
              <el-empty description="请选择一个节点进行配置" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="连线条件" name="edge">
            <div v-if="selectedEdge" class="edge-config">
              <div class="edge-header">
                <div class="edge-info">
                  <el-tag type="success">连线</el-tag>
                </div>
                <el-button type="danger" size="small" @click="deleteSelectedEdge">
                  <el-icon><Delete /></el-icon>
                  删除连线
                </el-button>
              </div>
              <el-divider />
              <el-form label-width="100px">
                <el-form-item label="条件标签">
                  <el-input
                    v-model="edgeCondition"
                    placeholder="输入条件标签，如: success、failed、true 等"
                  />
                </el-form-item>
              </el-form>
              <div class="edge-actions">
                <el-button
                  type="primary"
                  @click="saveEdgeCondition"
                >
                  <el-icon><Check /></el-icon>
                  保存条件
                </el-button>
              </div>
            </div>
            <div v-else class="no-selection">
              <el-empty description="请选择一条连线进行配置" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>

    <el-dialog
      v-model="testResultVisible"
      title="测试结果"
      width="800px"
    >
      <div v-if="testLoading" class="loading-container">
        <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        <p>正在执行...</p>
      </div>
      <pre v-else class="result-pre">{{ testResult }}</pre>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Graph } from '@antv/x6'
import { componentApi, taskApi } from '@/api'

const router = useRouter()
const route = useRoute()

const graphContainer = ref(null)
let graph = null

const isEdit = ref(!!route.params.id)
const components = ref([])
const componentSearch = ref('')
const activeTab = ref('basic')
const selectedNode = ref(null)
const selectedEdge = ref(null)
const nodeConfig = ref({})
const edgeCondition = ref('')
const testResultVisible = ref(false)
const testLoading = ref(false)
const testResult = ref('')

const taskForm = ref({
  name: '',
  task_id: '',
  description: '',
  schedule_type: 'manual',
  cron_expression: '',
  flow_data: { nodes: [], edges: [] }
})

const filteredComponents = computed(() => {
  if (!componentSearch.value) return components.value
  const search = componentSearch.value.toLowerCase()
  return components.value.filter(c =>
    c.name.toLowerCase().includes(search) ||
    (c.chinese_name && c.chinese_name.includes(search))
  )
})

const selectedComponentSchema = computed(() => {
  if (!selectedNode.value) return null
  const comp = components.value.find(c => c.name === selectedNode.value.component)
  return comp?.input_schema || null
})

const initGraph = () => {
  graph = new Graph({
    container: graphContainer.value,
    grid: true,
    snapline: true,
    keyboard: true,
    clipboard: true,
    history: true,
    panning: { enabled: true },
    mousewheel: { enabled: true, zoomAtMousePosition: true },
    highlighting: {
      nodeAvailable: {
        name: 'className',
        args: {
          className: 'available'
        }
      },
      magnetAvailable: {
        name: 'className',
        args: {
          className: 'available'
        }
      }
    },
    connecting: {
      router: 'manhattan',
      connector: { name: 'rounded' },
      anchor: 'center',
      connectionPoint: 'anchor',
      allowBlank: false,
      allowLoop: false,
      allowNode: false,
      allowEdge: false,
      snap: { radius: 20 },
      highlight: true,
      sourceAnchor: 'center',
      targetAnchor: 'center',
      createEdge() {
        return graph.createEdge({
          zIndex: -1,
          attrs: {
            line: {
              stroke: '#5F95FF',
              strokeWidth: 2,
              targetMarker: {
                name: 'classic',
                stroke: '#5F95FF',
                fill: '#5F95FF'
              }
            }
          }
        })
      }
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible'
              }
            }
          }
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible'
              }
            }
          }
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible'
              }
            }
          }
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible'
              }
            }
          }
        }
      },
      items: [
        { group: 'top', id: 'port-top' },
        { group: 'bottom', id: 'port-bottom' },
        { group: 'left', id: 'port-left' },
        { group: 'right', id: 'port-right' }
      ]
    }
  })

  graph.on('node:click', ({ node }) => {
    const data = node.getData()
    selectedNode.value = data
    selectedEdge.value = null
    nodeConfig.value = JSON.parse(JSON.stringify(data.input || {}))
    activeTab.value = 'node'
  })

  graph.on('edge:click', ({ edge }) => {
    selectedEdge.value = {
      id: edge.id,
      source: edge.getSourceCellId(),
      target: edge.getTargetCellId()
    }
    selectedNode.value = null
    edgeCondition.value = edge.getData()?.condition || ''
    activeTab.value = 'edge'
  })

  graph.on('blank:click', () => {
    selectedNode.value = null
    selectedEdge.value = null
  })

  graph.on('edge:created', ({ edge }) => {
    edge.setData({ condition: '' })
  })
}

const handleDragStart = (event, component) => {
  event.dataTransfer.setData('application/component', JSON.stringify(component))
}

const handleDrop = (event) => {
  event.preventDefault()
  const data = event.dataTransfer.getData('application/component')
  if (!data) return

  const component = JSON.parse(data)
  const point = graph.clientToLocal(event.clientX, event.clientY)

  const nodeId = `node_${Date.now()}`
  const node = graph.addNode({
    id: nodeId,
    x: point.x - 60,
    y: point.y - 30,
    width: 120,
    height: 60,
    label: component.chinese_name || component.name,
    attrs: {
      body: {
        fill: '#EFF4FF',
        stroke: '#5F95FF',
        strokeWidth: 2,
        rx: 8,
        ry: 8
      },
      label: {
        fill: '#262626',
        fontSize: 14
      }
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'top', id: 'top' },
        { group: 'bottom', id: 'bottom' },
        { group: 'left', id: 'left' },
        { group: 'right', id: 'right' }
      ]
    },
    data: {
      id: nodeId,
      component: component.name,
      input: {},
      output: null
    }
  })

  selectedNode.value = node.getData()
  nodeConfig.value = {}
  activeTab.value = 'node'
}

const getFlowData = () => {
  const nodes = graph.getNodes().map(node => ({
    id: node.id,
    component: node.getData().component,
    input: node.getData().input || {}
  }))

  const edges = graph.getEdges().map(edge => ({
    id: edge.id,
    source: edge.getSourceCellId(),
    target: edge.getTargetCellId(),
    condition: edge.getData()?.condition || ''
  }))

  return { nodes, edges }
}

const loadFlowData = (flowData) => {
  if (!flowData || !flowData.nodes) return

  const nodes = flowData.nodes || []
  const edges = flowData.edges || []

  graph.addNodes(nodes.map((n, index) => ({
    id: n.id,
    x: 150 + (index % 3) * 200,
    y: 100 + Math.floor(index / 3) * 120,
    width: 120,
    height: 60,
    label: n.component,
    attrs: {
      body: {
        fill: '#EFF4FF',
        stroke: '#5F95FF',
        strokeWidth: 2,
        rx: 8,
        ry: 8
      },
      label: {
        fill: '#262626',
        fontSize: 14
      }
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'top', id: 'top' },
        { group: 'bottom', id: 'bottom' },
        { group: 'left', id: 'left' },
        { group: 'right', id: 'right' }
      ]
    },
    data: n
  })))

  graph.addEdges(edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    attrs: {
      line: {
        stroke: '#A2B1C3',
        strokeWidth: 2,
        targetMarker: 'classic'
      }
    },
    data: { condition: e.condition || '' }
  })))
}

const clearGraph = () => {
  graph.clearCells()
  selectedNode.value = null
  selectedEdge.value = null
}

const autoLayout = () => {
  const nodes = graph.getNodes()
  nodes.forEach((node, index) => {
    node.setPosition({
      x: 150 + (index % 3) * 200,
      y: 100 + Math.floor(index / 3) * 120
    })
  })
}

const handleJsonInput = (key, value) => {
  try {
    nodeConfig.value[key] = JSON.parse(value)
  } catch {
    nodeConfig.value[key] = value
  }
}

const saveNodeConfig = () => {
  if (!selectedNode.value) {
    ElMessage.warning('请先选择一个节点')
    return
  }
  
  if (!selectedNode.value.id) {
    ElMessage.error('节点ID不存在')
    return
  }
  
  if (!graph) {
    ElMessage.error('图形实例未初始化')
    return
  }
  
  try {
    const node = graph.getCell(selectedNode.value.id)
    if (!node) {
      ElMessage.error('找不到节点')
      return
    }
    
    node.setData({
      ...selectedNode.value,
      input: JSON.parse(JSON.stringify(nodeConfig.value))
    })
    selectedNode.value = node.getData()
    ElMessage.success('节点配置已保存')
  } catch (error) {
    console.error('保存节点配置失败:', error)
    ElMessage.error('保存失败: ' + (error.message || error))
  }
}

const saveEdgeCondition = () => {
  if (!selectedEdge.value) {
    ElMessage.warning('请先选择一条连线')
    return
  }
  
  if (!selectedEdge.value.id) {
    ElMessage.error('连线ID不存在')
    return
  }
  
  if (!graph) {
    ElMessage.error('图形实例未初始化')
    return
  }
  
  try {
    const edge = graph.getCell(selectedEdge.value.id)
    if (!edge) {
      ElMessage.error('找不到连线')
      return
    }
    
    const currentData = edge.getData() || {}
    edge.setData({
      ...currentData,
      condition: edgeCondition.value
    })
    
    selectedEdge.value = {
      id: selectedEdge.value.id,
      source: selectedEdge.value.source,
      target: selectedEdge.value.target,
      condition: edgeCondition.value
    }
    
    ElMessage.success('连线条件已保存')
  } catch (error) {
    console.error('保存连线条件失败:', error)
    ElMessage.error('保存失败: ' + (error.message || error))
  }
}

const deleteSelectedNode = async () => {
  console.log('deleteSelectedNode called, selectedNode:', selectedNode.value)
  
  if (!selectedNode.value) {
    ElMessage.warning('请先选择一个节点')
    return
  }
  
  if (!selectedNode.value.id) {
    ElMessage.error('节点ID不存在')
    return
  }
  
  if (!graph) {
    ElMessage.error('图形实例未初始化')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要删除该节点吗？相关的连线也会被删除。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const nodeId = selectedNode.value.id
    console.log('Deleting node with ID:', nodeId)
    console.log('Graph exists:', !!graph)
    console.log('graph.getCell:', typeof graph.getCell)
    
    const node = graph.getCell(nodeId)
    console.log('Found node:', node)
    
    if (!node) {
      ElMessage.error('找不到节点')
      return
    }
    
    const connectedEdges = graph.getConnectedEdges(node)
    console.log('Connected edges:', connectedEdges)
    
    connectedEdges.forEach(edge => edge.remove())
    node.remove()
    
    selectedNode.value = null
    nodeConfig.value = {}
    ElMessage.success('节点已删除')
  } catch (error) {
    console.log('Error caught:', error)
    if (error !== 'cancel') {
      console.error('删除节点失败:', error)
      ElMessage.error('删除失败: ' + (error.message || error))
    }
  }
}

const deleteSelectedEdge = async () => {
  console.log('deleteSelectedEdge called, selectedEdge:', selectedEdge.value)
  
  if (!selectedEdge.value) {
    ElMessage.warning('请先选择一条连线')
    return
  }
  
  if (!selectedEdge.value.id) {
    ElMessage.error('连线ID不存在')
    return
  }
  
  if (!graph) {
    ElMessage.error('图形实例未初始化')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要删除该连线吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const edgeId = selectedEdge.value.id
    console.log('Deleting edge with ID:', edgeId)
    
    const edge = graph.getCell(edgeId)
    console.log('Found edge:', edge)
    
    if (!edge) {
      ElMessage.error('找不到连线')
      return
    }
    
    edge.remove()
    selectedEdge.value = null
    edgeCondition.value = ''
    ElMessage.success('连线已删除')
  } catch (error) {
    console.log('Error caught:', error)
    if (error !== 'cancel') {
      console.error('删除连线失败:', error)
      ElMessage.error('删除失败: ' + (error.message || error))
    }
  }
}

const saveTask = async () => {
  if (!taskForm.value.name || !taskForm.value.task_id) {
    ElMessage.error('请填写任务名称和任务ID')
    return
  }

  const flowData = getFlowData()
  if (flowData.nodes.length === 0) {
    ElMessage.error('请至少添加一个组件节点')
    return
  }

  const taskData = {
    ...taskForm.value,
    flow_data: flowData
  }

  try {
    if (isEdit.value) {
      await taskApi.update(route.params.id, taskData)
      ElMessage.success('更新成功')
    } else {
      await taskApi.create(taskData)
      ElMessage.success('创建成功')
    }
    goBack()
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || '保存失败')
  }
}

const testFlow = async () => {
  const flowData = getFlowData()
  if (flowData.nodes.length === 0) {
    ElMessage.error('请至少添加一个组件节点')
    return
  }

  testLoading.value = true
  testResultVisible.value = true
  testResult.value = ''

  try {
    const result = await taskApi.test({
      flow_data: flowData,
      context: {}
    })
    testResult.value = JSON.stringify(result, null, 2)
  } catch (error) {
    testResult.value = JSON.stringify({
      success: false,
      error: error.response?.data?.detail || error.message
    }, null, 2)
  } finally {
    testLoading.value = false
  }
}

const goBack = () => {
  router.push('/tasks')
}

const loadComponents = async () => {
  try {
    components.value = await componentApi.getAll()
  } catch (error) {
    ElMessage.error('加载组件列表失败')
  }
}

const loadTask = async () => {
  if (!isEdit.value) return
  
  try {
    const task = await taskApi.getById(route.params.id)
    taskForm.value = {
      name: task.name,
      task_id: task.task_id,
      description: task.description || '',
      schedule_type: task.schedule_type || 'manual',
      cron_expression: task.cron_expression || '',
      flow_data: task.flow_data
    }
    
    await nextTick()
    loadFlowData(task.flow_data)
  } catch (error) {
    ElMessage.error('加载任务失败')
  }
}

onMounted(async () => {
  await loadComponents()
  await nextTick()
  initGraph()
  await loadTask()
})
</script>

<style scoped>
.task-editor {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-height: calc(100vh - 140px);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.components-panel {
  height: calc(100vh - 200px);
}

.component-list {
  max-height: calc(100% - 60px);
  overflow-y: auto;
}

.component-item {
  padding: 12px;
  margin-bottom: 8px;
  background: #f5f7fa;
  border-radius: 6px;
  cursor: grab;
  border: 1px solid #e4e7ed;
  transition: all 0.2s;
}

.component-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.component-item:active {
  cursor: grabbing;
}

.component-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.component-type {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.graph-panel {
  height: calc(100vh - 200px);
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.graph-container {
  width: 100%;
  height: calc(100% - 50px);
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fafafa;
}

.node-config, .edge-config {
  padding: 0;
}

.node-header, .edge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 15px;
}

.node-info, .edge-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-item-wrapper {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 0;
}

.form-item :deep(.el-form-item__label) {
  padding-right: 10px;
  white-space: normal;
  word-break: break-all;
  line-height: 1.5;
  min-height: 32px;
  display: flex;
  align-items: center;
}

.form-item :deep(.el-input__wrapper) {
  padding: 5px 15px;
}

.form-item :deep(.el-textarea__inner) {
  padding: 8px 12px;
  line-height: 1.6;
}

.node-actions, .edge-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.result-pre, .loading-container {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 500px;
  overflow: auto;
  white-space: pre-wrap;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  color: #909399;
}

.loading-container p {
  margin-top: 10px;
}
</style>

<style>
.x6-port-body {
  cursor: crosshair;
  transition: all 0.2s;
}

.x6-port-body:hover {
  r: 8;
  fill: #5F95FF !important;
  stroke: #5F95FF !important;
}

.x6-node:hover .x6-port-body {
  opacity: 1;
}

.x6-edge {
  cursor: pointer;
}

.x6-edge:hover path {
  stroke-width: 3 !important;
  stroke: #5F95FF !important;
}

.x6-edge.selected path {
  stroke-width: 3 !important;
  stroke: #409EFF !important;
}

.x6-node.selected rect {
  stroke: #409EFF !important;
  stroke-width: 3 !important;
}
</style>
