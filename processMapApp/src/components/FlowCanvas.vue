<template>
  <div class="flow-canvas" ref="canvasContainer">
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
      @node-drop="onNodeDrop"
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
    
    <div class="canvas-info">
      <span>缩放: {{ Math.round(viewport.zoom * 100) }}%</span>
      <span>节点: {{ internalNodes.length }}</span>
      <span>连线: {{ internalEdges.length }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
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
  'viewportChange'
])

const vueFlowRef = ref(null)
const canvasContainer = ref(null)
const internalNodes = ref([...props.nodes])
const internalEdges = ref([...props.edges])
const viewport = ref({ x: 0, y: 0, zoom: 1 })

const { screenToFlowPosition, fitView } = useVueFlow()

watch(() => props.nodes, (newNodes) => {
  internalNodes.value = JSON.parse(JSON.stringify(newNodes))
}, { deep: true })

watch(() => props.edges, (newEdges) => {
  internalEdges.value = JSON.parse(JSON.stringify(newEdges))
}, { deep: true })

watch(internalNodes, (newNodes) => {
  emit('update:nodes', JSON.parse(JSON.stringify(newNodes)))
}, { deep: true })

watch(internalEdges, (newEdges) => {
  emit('update:edges', JSON.parse(JSON.stringify(newEdges)))
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
  internalEdges.value = [...internalEdges.value, newEdge]
}

const onNodeDrop = (event) => {
  const transferData = event.dataTransfer.getData('application/vueflow')
  if (!transferData) return
  
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
  
  internalNodes.value = [...internalNodes.value, newNode]
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
</script>

<style scoped>
.flow-canvas {
  flex: 1;
  position: relative;
  background: var(--background-color);
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
