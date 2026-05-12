<template>
  <div class="waterfall-container">
    <div v-if="list.length === 0" class="empty-state">
      暂无数据
    </div>
    <div v-else class="waterfall-container">
      <div v-for="item in list" :key="item.id" class="waterfall-item" @click="$emit('click', item)">
        <van-image
          :src="item.coverImage"
          :width="100"
          :height="item.height || 160"
          fit="cover"
          radius="12"
          lazy-load
        />
        <div class="item-content">
          <div class="item-title text-ellipsis">{{ item.name }}</div>
          <div class="item-info">
            <span class="price" v-if="item.isPaid">{{ item.price }}元</span>
            <span class="price" v-else>免费</span>
            <span class="distance">{{ item.distance || '未知' }}</span>
          </div>
          <div class="item-tags">
            <van-tag v-for="tag in item.tags?.slice(0, 2)" :key="tag" type="primary" size="mini" plain>
              {{ tag }}
            </van-tag>
          </div>
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

defineEmits(['click'])
</script>

<style scoped>
.waterfall-container {
  column-count: 2;
  column-gap: 12px;
  padding: 12px;
}

.waterfall-item {
  break-inside: avoid;
  margin-bottom: 12px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.item-content {
  padding: 12px;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 6px;
}

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.price {
  color: #ff6034;
  font-weight: 500;
}

.distance {
  color: #969799;
}

.item-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
</style>
