<template>
  <div
    class="custom-node end-node"
    :style="nodeStyle"
    @dblclick="handleDoubleClick"
  >
    <Handle
      v-if="!data.hideTarget"
      type="target"
      position="top"
      :style="handleStyle"
    />
    <div class="node-text" :style="textStyle">{{ data.label || '结束' }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Handle, useVueFlow, useNode } from '@vue-flow/core'

const props = defineProps({
  id: String,
  data: Object,
  selected: Boolean,
  isConnectable: Boolean
})

const { updateNode } = useVueFlow()
const { node } = useNode(props.id)

const nodeStyle = computed(() => ({
  backgroundColor: node.value?.data?.bgColor || '#ef4444',
  borderColor: node.value?.data?.borderColor || '#dc2626',
  borderWidth: '2px',
  borderStyle: 'solid',
  borderRadius: '50%',
  width: node.value?.style?.width || '120px',
  height: node.value?.style?.height || '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: props.selected ? '0 0 0 2px var(--primary-color)' : 'var(--shadow)',
  transition: 'box-shadow 0.2s ease',
  cursor: 'move'
}))

const textStyle = computed(() => ({
  fontSize: (node.value?.data?.fontSize || 14) + 'px',
  color: '#fff',
  fontWeight: 'bold'
}))

const handleStyle = {
  background: '#4f46e5',
  width: '10px',
  height: '10px'
}

const handleDoubleClick = () => {
  const newLabel = prompt('输入节点文本:', node.value?.data?.label)
  if (newLabel !== null) {
    updateNode(props.id, { data: { ...node.value.data, label: newLabel } })
  }
}
</script>

<style scoped>
.custom-node:hover {
  box-shadow: var(--shadow-lg) !important;
}
</style>
