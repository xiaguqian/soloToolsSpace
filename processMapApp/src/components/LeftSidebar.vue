<template>
  <aside class="sidebar left-sidebar" :class="{ collapsed: collapsed }">
    <div class="sidebar-header">
      <h3 v-if="!collapsed">图形工具</h3>
      <button class="collapse-btn" @click="$emit('toggle')">
        <span>{{ collapsed ? '»' : '«' }}</span>
      </button>
    </div>
    
    <div v-if="!collapsed" class="tools-content">
      <div class="tool-section">
        <h4>基础节点</h4>
        <div class="tool-items">
          <div
            v-for="tool in nodeTools"
            :key="tool.type"
            class="tool-item"
            draggable="true"
            @dragstart="handleDragStart($event, tool)"
            @dragend="handleDragEnd"
          >
            <div class="tool-icon" :style="tool.iconStyle">
              <span v-if="tool.type === 'start'">▶</span>
              <span v-else-if="tool.type === 'end'">■</span>
              <span v-else-if="tool.type === 'rectangle'">▢</span>
              <span v-else-if="tool.type === 'diamond'">◇</span>
              <span v-else-if="tool.type === 'circle'">○</span>
              <span v-else-if="tool.type === 'roundrect'">▢</span>
              <span v-else-if="tool.type === 'parallelogram'">▭</span>
            </div>
            <span class="tool-label">{{ tool.label }}</span>
          </div>
        </div>
      </div>
      
      <div class="tool-section">
        <h4>示例流程</h4>
        <div class="example-list">
          <button
            v-for="example in examples"
            :key="example.name"
            class="example-btn"
            @click="$emit('loadExample', example)"
          >
            <div class="example-icon">📋</div>
            <div class="example-info">
              <span class="example-name">{{ example.name }}</span>
              <span class="example-desc">{{ example.description }}</span>
            </div>
          </button>
        </div>
      </div>
      
      <div class="tool-section">
        <h4>操作提示</h4>
        <ul class="tips-list">
          <li>• 拖拽节点到画布添加</li>
          <li>• 双击节点编辑文本</li>
          <li>• 从节点边缘拖拽连线</li>
          <li>• 滚轮缩放画布</li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { exampleFlows } from '@/utils/examples.js'

const emit = defineEmits(['toggle', 'loadExample'])

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const examples = exampleFlows

const nodeTools = [
  {
    type: 'start',
    label: '开始',
    defaultSize: { width: 120, height: 50 },
    iconStyle: { backgroundColor: '#10b981', color: 'white', borderRadius: '50%' }
  },
  {
    type: 'end',
    label: '结束',
    defaultSize: { width: 120, height: 50 },
    iconStyle: { backgroundColor: '#ef4444', color: 'white', borderRadius: '50%' }
  },
  {
    type: 'rectangle',
    label: '矩形',
    defaultSize: { width: 150, height: 60 },
    iconStyle: { backgroundColor: '#ffffff', color: '#333', borderRadius: '4px', border: '2px solid #cbd5e1' }
  },
  {
    type: 'diamond',
    label: '菱形',
    defaultSize: { width: 180, height: 80 },
    iconStyle: { backgroundColor: '#fef3c7', color: '#333', borderRadius: '0', transform: 'rotate(45deg)', border: '2px solid #f59e0b' }
  },
  {
    type: 'circle',
    label: '圆形',
    defaultSize: { width: 120, height: 120 },
    iconStyle: { backgroundColor: '#e0e7ff', color: '#333', borderRadius: '50%', border: '2px solid #6366f1' }
  },
  {
    type: 'roundrect',
    label: '圆角矩形',
    defaultSize: { width: 150, height: 60 },
    iconStyle: { backgroundColor: '#dcfce7', color: '#333', borderRadius: '12px', border: '2px solid #22c55e' }
  },
  {
    type: 'parallelogram',
    label: '平行四边形',
    defaultSize: { width: 180, height: 60 },
    iconStyle: { backgroundColor: '#fce7f3', color: '#333', borderRadius: '0', transform: 'skewX(-20deg)', border: '2px solid #ec4899' }
  }
]

const handleDragStart = (event, tool) => {
  event.dataTransfer.setData('application/vueflow', JSON.stringify({
    type: tool.type,
    label: tool.label,
    defaultSize: tool.defaultSize
  }))
  event.dataTransfer.effectAllowed = 'move'
}

const handleDragEnd = () => {}
</script>

<style scoped>
.left-sidebar {
  width: 260px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}

.left-sidebar.collapsed {
  width: 50px;
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.collapse-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--text-secondary);
}

.collapse-btn:hover {
  background: var(--border-color);
}

.tools-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.tool-section {
  margin-bottom: 20px;
}

.tool-section h4 {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 10px;
}

.tool-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: grab;
  transition: var(--transition);
  background: var(--background-color);
}

.tool-item:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.tool-item:active {
  cursor: grabbing;
}

.tool-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.tool-label {
  font-size: 11px;
  color: var(--text-color);
  text-align: center;
}

.example-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.example-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-align: left;
  transition: var(--transition);
  width: 100%;
  background: var(--background-color);
}

.example-btn:hover {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.example-icon {
  font-size: 20px;
}

.example-info {
  display: flex;
  flex-direction: column;
}

.example-name {
  font-size: 12px;
  font-weight: 600;
}

.example-desc {
  font-size: 10px;
  opacity: 0.8;
  margin-top: 2px;
}

.tips-list {
  list-style: none;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.8;
}
</style>
