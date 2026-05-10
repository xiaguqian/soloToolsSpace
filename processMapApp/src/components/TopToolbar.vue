<template>
  <header class="top-toolbar">
    <div class="toolbar-left">
      <div class="logo">
        <span class="logo-icon">📊</span>
        <span class="logo-text">FlowDraw</span>
      </div>
    </div>
    
    <div class="toolbar-center">
      <div class="action-group">
        <button
          class="toolbar-btn"
          :disabled="!canUndo"
          :title="'撤销 (Ctrl+Z)'"
          @click="$emit('undo')"
        >
          <span class="btn-icon">↶</span>
        </button>
        <button
          class="toolbar-btn"
          :disabled="!canRedo"
          :title="'重做 (Ctrl+Y)'"
          @click="$emit('redo')"
        >
          <span class="btn-icon">↷</span>
        </button>
      </div>
      
      <div class="divider"></div>
      
      <div class="action-group">
        <button
          class="toolbar-btn"
          :disabled="!selectedCount"
          title="复制 (Ctrl+C)"
          @click="$emit('copy')"
        >
          <span class="btn-icon">📋</span>
        </button>
        <button
          class="toolbar-btn"
          title="粘贴 (Ctrl+V)"
          @click="$emit('paste')"
        >
          <span class="btn-icon">📄</span>
        </button>
        <button
          class="toolbar-btn"
          :disabled="!selectedCount"
          title="删除 (Delete)"
          @click="$emit('delete')"
        >
          <span class="btn-icon">🗑</span>
        </button>
      </div>
      
      <div class="divider"></div>
      
      <div class="action-group">
        <button
          class="toolbar-btn"
          title="清空画布"
          @click="$emit('clear')"
        >
          <span class="btn-icon">🧹</span>
        </button>
        <button
          class="toolbar-btn"
          title="重置视图"
          @click="$emit('fitView')"
        >
          <span class="btn-icon">🔍</span>
        </button>
      </div>
    </div>
    
    <div class="toolbar-right">
      <div class="action-group">
        <button
          class="toolbar-btn"
          :class="{ active: autoSaveEnabled }"
          :title="autoSaveEnabled ? '自动保存已开启' : '自动保存已关闭'"
          @click="$emit('toggleAutoSave')"
        >
          <span class="btn-icon">💾</span>
          <span class="btn-text">自动保存</span>
        </button>
        
        <button
          class="toolbar-btn"
          title="保存草稿"
          @click="$emit('saveDraft')"
        >
          <span class="btn-icon">🗃</span>
          <span class="btn-text">保存</span>
        </button>
        
        <button
          class="toolbar-btn"
          title="设置缓存路径"
          @click="$emit('setCachePath')"
        >
          <span class="btn-icon">📁</span>
          <span class="btn-text">路径</span>
        </button>
      </div>
      
      <div class="divider"></div>
      
      <div class="action-group">
        <button
          class="toolbar-btn primary"
          title="导入流程图"
          @click="$emit('import')"
        >
          <span class="btn-icon">📥</span>
          <span class="btn-text">导入</span>
        </button>
        
        <div class="export-dropdown">
          <button
            class="toolbar-btn primary"
            :class="{ active: showExportMenu }"
            title="导出流程图"
            @click="showExportMenu = !showExportMenu"
          >
            <span class="btn-icon">📤</span>
            <span class="btn-text">导出</span>
          </button>
          
          <div v-if="showExportMenu" class="dropdown-menu">
            <button @click="exportFormat('vfd')">
              <span>📄</span> 项目文件 (.vfd)
            </button>
            <button @click="exportFormat('png')">
              <span>🖼</span> PNG 图片
            </button>
            <button @click="exportFormat('jpg')">
              <span>🖼</span> JPG 图片
            </button>
            <button @click="exportFormat('svg')">
              <span>📐</span> SVG 矢量图
            </button>
          </div>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <button
        class="toolbar-btn theme-toggle"
        :title="isDark ? '切换到亮色主题' : '切换到暗色主题'"
        @click="$emit('toggleTheme')"
      >
        <span class="btn-icon">{{ isDark ? '🌙' : '☀️' }}</span>
      </button>
    </div>
    
    <div class="status-indicator">
      <span class="status-dot" :class="{ saved: isSaved, saving: isSaving }"></span>
      <span class="status-text">{{ statusText }}</span>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  canUndo: Boolean,
  canRedo: Boolean,
  autoSaveEnabled: Boolean,
  isDark: Boolean,
  isSaved: Boolean,
  isSaving: Boolean,
  cachePath: String,
  selectedCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'undo', 'redo', 'copy', 'paste', 'delete', 'clear', 'fitView',
  'toggleAutoSave', 'saveDraft', 'setCachePath', 'import',
  'toggleTheme', 'export'
])

const showExportMenu = ref(false)

const statusText = computed(() => {
  if (props.isSaving) return '保存中...'
  if (props.isSaved) return '已保存'
  return '未保存'
})

const exportFormat = (format) => {
  showExportMenu.value = false
  emit('export', format)
}
</script>

<style scoped>
.top-toolbar {
  height: 56px;
  background: var(--sidebar-bg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.toolbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-group {
  display: flex;
  gap: 4px;
}

.divider {
  width: 1px;
  height: 28px;
  background: var(--border-color);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--text-color);
  font-size: 13px;
  transition: var(--transition);
  position: relative;
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--border-color);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn.active {
  background: rgba(79, 70, 229, 0.1);
  color: var(--primary-color);
}

.toolbar-btn.primary {
  background: var(--primary-color);
  color: white;
}

.toolbar-btn.primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-weight: 500;
}

.theme-toggle {
  padding: 8px;
}

.export-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  padding: 4px;
  z-index: 1000;
  min-width: 180px;
}

.dropdown-menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-color);
  text-align: left;
}

.dropdown-menu button:hover {
  background: var(--border-color);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--background-color);
  border-radius: 20px;
  font-size: 12px;
  color: var(--text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--warning-color);
  transition: var(--transition);
}

.status-dot.saved {
  background: var(--success-color);
}

.status-dot.saving {
  background: var(--primary-color);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
