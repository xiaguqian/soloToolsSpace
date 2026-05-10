<template>
  <div class="flow-canvas" ref="canvasContainer">
    <div 
      ref="dropArea"
      class="drop-area"
      @dragover.prevent="onDragOver"
      @drop.prevent="onDrop"
    >
      <VueFlow
        ref="vueFlowRef"
        v-model:nodes="internalNodes"
        v-model:edges="internalEdges"
        :node-types="nodeTypes"
        :default-edge-options="defaultEdgeOptions"
        :pro-options="proOptions"
        :fit-view-on-init="true"
        :snap-to-grid="true"
        :snap-grid="gridSnap"
        :min-zoom="0.1"
        :max-zoom="4"
        @connect="onConnect"
        @view-port-change="onViewportChange"
        @nodes-change="onNodesChange"
        @edges-change="onEdgesChange"
      >
        <template #background>
          <Background
            v-if="showGrid"
            :gap="gridSize"
            :size="1"
            color="var(--border-color)"
          />
        </template>
        
        <template #controls>
          <Controls :show-fit-view="false" />
        </template>
        
        <template #minimap>
          <MiniMap
            node-stroke-color="var(--text-color)"
            node-fill-color="var(--node-bg)"
            mask-color="rgba(0, 0, 0, 0.1)"
          />
        </template>
      </VueFlow>
    </div>
    
    <div class="canvas-info">
      <span>缩放: {{ Math.round(viewport.zoom * 100) }}%</span>
      <span>节点: {{ internalNodes.length }}</span>
      <span>连线: {{ internalEdges.length }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { VueFlow, useVueFlow, MarkerType } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import StartNode from './nodes/StartNode.vue'
import EndNode from './nodes/EndNode.vue'
import RectangleNode from './nodes/RectangleNode.vue'
import DiamondNode from './nodes/DiamondNode.vue'
import CircleNode from './nodes/CircleNode.vue'
import RoundRectNode from './nodes/RoundRectNode.vue'
import ParallelogramNode from './nodes/ParallelogramNode.vue'
import { generateId } from '@/utils/helpers.js'

const props = defineProps({
  nodes: {
    type: Array,
    default: () => []
  },
  edges: {
    type: Array,
    default: () => []
  },
  showGrid: {
    type: Boolean,
    default: true
  },
  gridSize: {
    type: Number,
    default: 20
  }
})

const emit = defineEmits([
  'update:nodes',
  'update:edges',
  'viewportChange',
  'nodesChange',
  'edgesChange'
])

const vueFlowRef = ref(null)
const canvasContainer = ref(null)
const dropArea = ref(null)
const internalNodes = ref([])
const internalEdges = ref([])
const viewport = ref({ x: 0, y: 0, zoom: 1 })

const { addNodes, addEdges, screenToFlowPosition, fitView } = useVueFlow()

watch(() => props.nodes, (newNodes) => {
  if (newNodes && newNodes.length > 0) {
    internalNodes.value = JSON.parse(JSON.stringify(newNodes))
  }
}, { deep: true })

watch(() => props.edges, (newEdges) => {
  if (newEdges && newEdges.length > 0) {
    internalEdges.value = JSON.parse(JSON.stringify(newEdges))
  }
}, { deep: true })

const gridSnap = computed(() => ({ x: props.gridSize, y: props.gridSize }))

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  rectangle: RectangleNode,
  diamond: DiamondNode,
  circle: CircleNode,
  roundrect: RoundRectNode,
  parallelogram: ParallelogramNode
}

const getMarkerEnd = (arrowType = 'single') => {
  if (arrowType === 'single' || arrowType === 'double') {
    return { type: MarkerType.ArrowClosed, color: '#64748b' }
  }
  return null
}

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
  markerEnd: getMarkerEnd('single'),
  data: {
    lineWidth: 2,
    color: '#64748b',
    arrowType: 'single'
  }
}

const proOptions = { account: 'free-trial', hideAttribution: true }

const getDefaultNodeData = (type, label) => {
  const defaults = {
    start: { bgColor: '#10b981', borderColor: '#059669' },
    end: { bgColor: '#ef4444', borderColor: '#dc2626' },
    rectangle: { bgColor: '#ffffff', borderColor: '#cbd5e1' },
    diamond: { bgColor: '#fef3c7', borderColor: '#f59e0b' },
    circle: { bgColor: '#e0e7ff', borderColor: '#6366f1' },
    roundrect: { bgColor: '#dcfce7', borderColor: '#22c55e' },
    parallelogram: { bgColor: '#fce7f3', borderColor: '#ec4899' }
  }
  return {
    label,
    fontSize: 14,
    ...defaults[type]
  }
}

const onConnect = (params) => {
  console.log('Connect:', params)
  const newEdge = {
    id: generateId(),
    ...params,
    type: 'smoothstep',
    animated: false,
    markerEnd: getMarkerEnd('single'),
    data: {
      lineWidth: 2,
      color: '#64748b',
      arrowType: 'single'
    }
  }
  addEdges(newEdge)
}

const onDragOver = (event) => {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
}

const onDrop = (event) => {
  console.log('Drop event:', event)
  
  const transferData = event.dataTransfer.getData('application/vueflow')
  console.log('Transfer data:', transferData)
  
  if (!transferData) {
    return
  }
  
  try {
    const data = JSON.parse(transferData)
    console.log('Parsed data:', data)
    
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    })
    
    console.log('Flow position:', position)
    
    const newNode = {
      id: generateId(),
      type: data.type,
      position,
      data: getDefaultNodeData(data.type, data.label),
      style: {
        width: data.defaultSize.width,
        height: data.defaultSize.height
      }
    }
    
    console.log('New node:', newNode)
    addNodes(newNode)
    console.log('Nodes after add:', internalNodes.value)
  } catch (error) {
    console.error('Error adding node:', error)
  }
}

const onNodesChange = (changes) => {
  console.log('Nodes change:', changes)
  emit('nodesChange', changes)
}

const onEdgesChange = (changes) => {
  console.log('Edges change:', changes)
  emit('edgesChange', changes)
}

const onViewportChange = (vp) => {
  viewport.value = vp
  emit('viewportChange', vp)
}

defineExpose({
  fitView: () => fitView(),
  getViewport: () => viewport.value,
  getNodes: () => internalNodes.value,
  getEdges: () => internalEdges.value,
  exportAsImage: async (type = 'png') => {
    return new Promise((resolve, reject) => {
      import('html-to-image').then(({ toPng, toJpeg, toSvg }) => {
        const element = canvasContainer.value
        const options = {
          backgroundColor: 'transparent',
          pixelRatio: 2,
          cacheBust: true
        }
        
        if (type === 'png') {
          toPng(element, options).then(resolve).catch(reject)
        } else if (type === 'jpg') {
          toJpeg(element, { ...options, quality: 0.95, backgroundColor: '#ffffff' }).then(resolve).catch(reject)
        } else if (type === 'svg') {
          toSvg(element, options).then(resolve).catch(reject)
        } else {
          reject(new Error('不支持的图片类型'))
        }
      }).catch(reject)
    })
  }
})

onMounted(() => {
  console.log('FlowCanvas mounted')
  console.log('Props nodes:', props.nodes)
  console.log('Props edges:', props.edges)
  
  if (props.nodes && props.nodes.length > 0) {
    addNodes(JSON.parse(JSON.stringify(props.nodes)))
  }
  if (props.edges && props.edges.length > 0) {
    addEdges(JSON.parse(JSON.stringify(props.edges)))
  }
})
</script>

<style scoped>
.flow-canvas {
  flex: 1;
  position: relative;
  background: var(--background-color);
}

.drop-area {
  width: 100%;
  height: 100%;
}

.canvas-info {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  padding: 8px 16px;
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 12px;
  color: var(--text-secondary);
  box-shadow: var(--shadow);
  z-index: 5;
}
</style>
