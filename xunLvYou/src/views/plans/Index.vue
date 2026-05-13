<template>
  <div class="plans-page">
    <van-nav-bar title="出行计划" :arrow="false">
      <template #right>
        <van-icon name="plus" @click="goCreate" />
      </template>
    </van-nav-bar>

    <van-tabs v-model:active="activeTab">
      <van-tab title="待出行">
        <plan-list :list="pendingPlans" @click="goDetail" @cancel="cancelPlan" @complete="completePlan" />
      </van-tab>
      <van-tab title="已出行">
        <plan-list :list="completedPlans" @click="goDetail" />
      </van-tab>
      <van-tab title="已取消">
        <plan-list :list="cancelledPlans" @click="goDetail" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPlanList, updatePlanStatus } from '@/api/plan'
import { showToast, showConfirmDialog } from 'vant'
import PlanList from '@/components/PlanList.vue'

const router = useRouter()
const activeTab = ref(0)
const plans = ref([])

const pendingPlans = computed(() => plans.value.filter(p => p.status === 'pending'))
const completedPlans = computed(() => plans.value.filter(p => p.status === 'completed'))
const cancelledPlans = computed(() => plans.value.filter(p => p.status === 'cancelled'))

async function loadPlans() {
  try {
    const res = await getPlanList()
    if (res.code === 0) {
      plans.value = res.data.list || []
    }
  } catch (error) {
    showToast('加载失败')
  }
}

function goCreate() {
  router.push('/plan-create')
}

function goDetail(plan) {
  router.push(`/plan-detail/${plan.id}`)
}

async function cancelPlan(plan) {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定取消该出行计划？',
      confirmButtonText: '取消计划',
      cancelButtonText: '进入智能云出行'
    })
    await updatePlanStatus(plan.id, 'cancelled')
    showToast('计划已取消')
    loadPlans()
  } catch (error) {
    if (error === 'cancel') {
      router.push({
        path: '/smart-travel',
        query: { planId: plan.id }
      })
    }
  }
}

async function completePlan(plan) {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定已完成出行？'
    })
    await updatePlanStatus(plan.id, 'completed')
    showToast('出行记录已更新')
    loadPlans()
  } catch (error) {}
}

onMounted(() => {
  loadPlans()
})
</script>

<style scoped>
.plans-page {
  min-height: 100vh;
}
</style>
