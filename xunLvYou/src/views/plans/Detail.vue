<template>
  <div class="plan-detail">
    <van-nav-bar
      title="计划详情"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <van-loading v-if="loading" class="loading-center" />

    <div v-else-if="plan" class="detail-content">
      <div class="plan-header card">
        <h2 class="plan-name">{{ plan.name }}</h2>
        <van-tag :type="getStatusType(plan.status)">
          {{ getStatusText(plan.status) }}
        </van-tag>
      </div>

      <van-cell-group inset>
        <van-cell title="出行时间" :value="plan.travelDate" />
        <van-cell title="出行人数" :value="`${plan.peopleCount}人`" />
        <van-cell title="创建时间" :value="plan.createTime" />
      </van-cell-group>

      <div class="section-title">出行景点</div>
      <van-cell-group inset>
        <van-cell
          v-for="scenic in plan.scenics"
          :key="scenic.id"
          :title="scenic.name"
          :label="scenic.address"
          is-link
          @click="goScenicDetail(scenic.id)"
        />
      </van-cell-group>

      <div v-if="plan.guide" class="guide-section">
        <div class="section-title">出行攻略</div>
        <div class="guide-content card">
          <div v-html="plan.guide.content"></div>
        </div>
      </div>

      <van-bottom-bar v-if="plan.status === 'pending'">
        <van-button type="default" round @click="cancelPlan">
          取消计划
        </van-button>
        <van-button type="primary" round @click="completePlan">
          已出行
        </van-button>
      </van-bottom-bar>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPlanDetail, updatePlanStatus } from '@/api/plan'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const plan = ref(null)

async function loadPlanDetail() {
  try {
    const res = await getPlanDetail(route.params.id)
    if (res.code === 0) {
      plan.value = res.data
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

function getStatusType(status) {
  const map = {
    pending: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[status] || 'default'
}

function getStatusText(status) {
  const map = {
    pending: '待出行',
    completed: '已出行',
    cancelled: '已取消'
  }
  return map[status] || '未知'
}

function goScenicDetail(id) {
  router.push(`/scenic/${id}`)
}

function onBack() {
  router.back()
}

async function cancelPlan() {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定取消该出行计划？',
      confirmButtonText: '取消计划',
      cancelButtonText: '进入智能云出行'
    })
    await updatePlanStatus(route.params.id, 'cancelled')
    showToast('计划已取消')
    loadPlanDetail()
  } catch (error) {
    if (error === 'cancel') {
      router.push({
        path: '/smart-travel',
        query: { planId: route.params.id }
      })
    }
  }
}

async function completePlan() {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定已完成出行？'
    })
    await updatePlanStatus(route.params.id, 'completed')
    showToast('出行记录已更新')
    loadPlanDetail()
  } catch (error) {}
}

onMounted(() => {
  loadPlanDetail()
})
</script>

<style scoped>
.plan-detail {
  min-height: 100vh;
  padding-bottom: 80px;
}

.loading-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.detail-content {
  padding: 16px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.plan-name {
  font-size: 20px;
  font-weight: bold;
  color: #323233;
  margin: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 20px 0 12px 16px;
}

.guide-section {
  margin-top: 16px;
}

.guide-content {
  font-size: 14px;
  line-height: 1.8;
  color: #646566;
  white-space: pre-wrap;
}
</style>
