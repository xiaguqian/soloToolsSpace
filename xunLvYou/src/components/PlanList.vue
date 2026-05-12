<template>
  <div class="plan-list">
    <div v-if="list.length === 0" class="empty-state">
      暂无计划
    </div>
    <div v-else>
      <van-cell-group>
        <van-cell
          v-for="plan in list"
          :key="plan.id"
          @click="$emit('click', plan)"
        >
          <template #title>
            <div class="plan-item">
              <div class="plan-info">
                <div class="plan-name">{{ plan.name }}</div>
                <div class="plan-meta">
                  <van-icon name="calendar-o" />
                  <span>{{ plan.travelDate }}</span>
                </div>
                <div class="plan-meta">
                  <van-icon name="location-o" />
                  <span>{{ plan.scenicNames }}</span>
                </div>
              </div>
              <div class="plan-actions" v-if="plan.status === 'pending'" @click.stop>
                <van-button size="small" type="danger" plain @click="$emit('cancel', plan)">
                  取消
                </van-button>
                <van-button size="small" type="success" @click="$emit('complete', plan)">
                  已出行
                </van-button>
              </div>
            </div>
          </template>
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell>
      </van-cell-group>
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

defineEmits(['click', 'cancel', 'complete'])
</script>

<style scoped>
.plan-list {
  padding: 12px;
}

.plan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.plan-info {
  flex: 1;
}

.plan-name {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 6px;
}

.plan-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #969799;
  margin-bottom: 4px;
}

.plan-actions {
  display: flex;
  gap: 8px;
}
</style>
