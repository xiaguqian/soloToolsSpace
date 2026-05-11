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
        :nodes="nodes"
        :edges="edges"
        :node-types="nodeTypes"
        :default-edge-options="defaultEdgeOptions"
        :pro-options="proOptions"
        :fit-view-on-init="false"
        :snap-to-grid="true"
        :snap-grid="gridSnap"
        :min-zoom="0.1"
        :max-zoom="4"
        @connect="onConnect"
        @nodes-change="onNodesChange"
        @edges-change="onEdgesChange"
        @view-port-change="onViewportChange"
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
      <span>节点: {{ nodes.length }}</span>
      <span>连线: {{ edges.length }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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
  'addNode',
  'addEdge',
  'updateNodes',
  'updateEdges',
  'viewportChange',
  'nodesChange',
  'edgesChange'
])

const vueFlowRef = ref(null)
const canvasContainer = ref(null)
const dropArea = ref(null)
const viewport = ref({ x: 0, y: 0, zoom: 1 })

const { 
  viewportHelper, 
  fitView, 
  addNodes, 
  addEdges,
  applyNodeChanges, 
  applyEdgeChanges 
} = useVueFlow()

const screenToFlowPosition = (screenPos) => {
  if (viewportHelper.value && viewportHelper.value.screenToFlowCoordinate) {
    return viewportHelper.value.screenToFlowCoordinate(screenPos)
  }
  
  const { x, y, zoom } = viewport.value
  return {
    x: (screenPos.x - x) / zoom,
    y: (screenPos.y - y) / zoom
  }
}

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
  emit('addEdge', newEdge)
}

const onDragOver = (event) => {
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.dropEffect = 'move'
}

const onDrop = (event) => {
  let transferData = event.dataTransfer.getData('application/vueflow')
  
  if (!transferData) {
    transferData = event.dataTransfer.getData('text/plain')
  }
  
  if (!transferData) {
    return
  }
  
  try {
    const data = JSON.parse(transferData)
    
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    })
    
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
    
    emit('addNode', newNode)
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
