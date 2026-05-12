<template>
  <div class="gallery-grid">
    <div v-if="list.length === 0" class="empty-state">
      暂无图片
    </div>
    <div v-else class="grid-container">
      <div
        v-for="item in list"
        :key="item.id"
        class="grid-item"
        @click="$emit('click', item)"
      >
        <van-image
          :src="item.url"
          width="100%"
          height="120"
          fit="cover"
          radius="8"
        />
        <div class="delete-btn" @click.stop="$emit('delete', item)">
          <van-icon name="delete" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  list: {
    type: Array,
    default: () => []
  }
})

defineEmits(['click', 'delete'])
</script>

<style scoped>
.gallery-grid {
  padding: 12px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.grid-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
</style>
