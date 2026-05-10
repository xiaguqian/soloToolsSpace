<template>
  <aside class="sidebar right-sidebar" :class="{ collapsed: collapsed }">
    <div class="sidebar-header">
      <h3 v-if="!collapsed">属性面板</h3>
      <button class="collapse-btn" @click="$emit('toggle')">
        <span>{{ collapsed ? '«' : '»' }}</span>
      </button>
    </div>
    
    <div v-if="!collapsed" class="properties-content">
      <template v-if="selectedNode">
        <h4 class="section-title">节点属性</h4>
        
        <div class="property-group">
          <label>节点文本</label>
          <input
            type="text"
            :value="selectedNode.data.label"
            @input="$emit('updateNode', selectedNode.id, 'label', $event.target.value)"
            placeholder="输入文本"
          />
        </div>
        
        <div class="property-row">
          <div class="property-group">
            <label>宽度</label>
            <input
              type="number"
              :value="selectedNode.style.width"
              @input="$emit('updateNodeSize', selectedNode.id, 'width', parseInt($event.target.value))"
            />
          </div>
          <div class="property-group">
            <label>高度</label>
            <input
              type="number"
              :value="selectedNode.style.height"
              @input="$emit('updateNodeSize', selectedNode.id, 'height', parseInt($event.target.value))"
            />
          </div>
        </div>
        
        <div class="property-row">
          <div class="property-group">
            <label>背景色</label>
            <input
              type="color"
              :value="selectedNode.data.bgColor"
              @input="$emit('updateNode', selectedNode.id, 'bgColor', $event.target.value)"
              class="color-input"
            />
          </div>
          <div class="property-group">
            <label>边框色</label>
            <input
              type="color"
              :value="selectedNode.data.borderColor"
              @input="$emit('updateNode', selectedNode.id, 'borderColor', $event.target.value)"
              class="color-input"
            />
          </div>
        </div>
        
        <div class="property-group">
          <label>字体大小</label>
          <input
            type="number"
            :value="selectedNode.data.fontSize"
            @input="$emit('updateNode', selectedNode.id, 'fontSize', parseInt($event.target.value))"
            min="8"
            max="32"
          />
        </div>
        
        <div class="action-group">
          <button class="btn btn-danger" @click="$emit('deleteSelected')">
            删除节点
          </button>
        </div>
      </template>
      
      <template v-else-if="selectedEdge">
        <h4 class="section-title">连线属性</h4>
        
        <div class="property-group">
          <label>连线标签</label>
          <input
            type="text"
            :value="selectedEdge.data?.label || ''"
            @input="$emit('updateEdge', selectedEdge.id, 'label', $event.target.value)"
            placeholder="可选"
          />
        </div>
        
        <div class="property-group">
          <label>连线类型</label>
          <select
            :value="selectedEdge.type"
            @change="$emit('updateEdgeType', selectedEdge.id, $event.target.value)"
          >
            <option value="default">直线</option>
            <option value="smoothstep">平滑折线</option>
            <option value="step">折线</option>
            <option value="bezier">贝塞尔曲线</option>
          </select>
        </div>
        
        <div class="property-row">
          <div class="property-group">
            <label>线宽</label>
            <input
              type="number"
              :value="selectedEdge.data?.lineWidth || 2"
              @input="$emit('updateEdge', selectedEdge.id, 'lineWidth', parseInt($event.target.value))"
              min="1"
              max="10"
            />
          </div>
          <div class="property-group">
            <label>颜色</label>
            <input
              type="color"
              :value="selectedEdge.data?.color || '#64748b'"
              @input="$emit('updateEdge', selectedEdge.id, 'color', $event.target.value)"
              class="color-input"
            />
          </div>
        </div>
        
        <div class="property-group">
          <label>箭头样式</label>
          <select
            :value="selectedEdge.data?.arrowType || 'single'"
            @change="$emit('updateEdge', selectedEdge.id, 'arrowType', $event.target.value)"
          >
            <option value="none">无箭头</option>
            <option value="single">单向</option>
            <option value="double">双向</option>
          </select>
        </div>
        
        <div class="property-group checkbox-group">
          <label>
            <input
              type="checkbox"
              :checked="selectedEdge.animated"
              @change="$emit('updateEdgeAnimated', selectedEdge.id, $event.target.checked)"
            />
            动画效果
          </label>
        </div>
        
        <div class="action-group">
          <button class="btn btn-danger" @click="$emit('deleteSelected')">
            删除连线
          </button>
        </div>
      </template>
      
      <template v-else>
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <p>选择节点或连线<br/>查看和编辑属性</p>
        </div>
      </template>
      
      <template v-if="!selectedNode && !selectedEdge">
        <h4 class="section-title">画布设置</h4>
        
        <div class="property-group checkbox-group">
          <label>
            <input
              type="checkbox"
              :checked="showGrid"
              @change="$emit('update:showGrid', $event.target.checked)"
            />
            显示网格
          </label>
        </div>
        
        <div class="property-group">
          <label>网格大小</label>
          <input
            type="number"
            :value="gridSize"
            @input="$emit('update:gridSize', parseInt($event.target.value))"
            min="10"
            max="50"
          />
        </div>
      </template>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  collapsed: {
    type: Boolean,
    default: false
  },
  showGrid: {
    type: Boolean,
    default: true
  },
  gridSize: {
    type: Number,
    default: 20
  },
  selectedNode: {
    type: Object,
    default: null
  },
  selectedEdge: {
    type: Object,
    default: null
  }
})

defineEmits([
  'toggle', 
  'deleteSelected', 
  'update:showGrid', 
  'update:gridSize',
  'updateNode',
  'updateNodeSize',
  'updateEdge',
  'updateEdgeType',
  'updateEdgeAnimated'
])
</script>

<style scoped>
.right-sidebar {
  width: 280px;
  background: var(--sidebar-bg);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}

.right-sidebar.collapsed {
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

.properties-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.property-group {
  margin-bottom: 14px;
}

.property-group label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.property-group input[type="text"],
.property-group input[type="number"],
.property-group select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  background: var(--background-color);
  color: var(--text-color);
  transition: var(--transition);
}

.property-group input:focus,
.property-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.property-group .color-input {
  padding: 2px;
  height: 36px;
  cursor: pointer;
}

.property-row {
  display: flex;
  gap: 12px;
}

.property-row .property-group {
  flex: 1;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-color);
  font-size: 13px;
}

.checkbox-group input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.action-group {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.btn {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: var(--transition);
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 13px;
  line-height: 1.6;
}
</style>
