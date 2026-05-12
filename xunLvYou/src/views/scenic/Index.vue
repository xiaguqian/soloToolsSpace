<template>
  <div class="scenic-page">
    <van-nav-bar title="景点推荐" :arrow="false">
      <template #right>
        <van-icon name="filter-o" @click="showFilter = true" />
      </template>
    </van-nav-bar>

    <van-search
      v-model="searchKeyword"
      placeholder="搜索景点"
      shape="round"
      @search="handleSearch"
    />

    <div v-if="locationInfo" class="location-bar">
      <van-icon name="location-o" />
      <span>当前位置: {{ locationInfo }}</span>
    </div>

    <van-tabs v-model:active="activeTab" sticky offset-top="0">
      <van-tab title="全部">
        <waterfall-list :list="filteredList" @click="goDetail" />
      </van-tab>
      <van-tab title="人文">
        <waterfall-list :list="filteredList.filter(item => item.type === 'culture')" @click="goDetail" />
      </van-tab>
      <van-tab title="自然">
        <waterfall-list :list="filteredList.filter(item => item.type === 'nature')" @click="goDetail" />
      </van-tab>
      <van-tab title="免费">
        <waterfall-list :list="filteredList.filter(item => !item.isPaid)" @click="goDetail" />
      </van-tab>
    </van-tabs>

    <van-popup v-model:show="showFilter" round position="bottom" :style="{ height: '60%' }">
      <div class="filter-content">
        <div class="filter-header">
          <span class="filter-title">筛选条件</span>
          <van-button type="primary" size="small" @click="applyFilter">确定</van-button>
        </div>
        
        <div class="filter-section">
          <div class="filter-label">出行方式</div>
          <van-checkbox-group v-model="filterData.travelMode">
            <van-checkbox name="bus">公交地铁</van-checkbox>
            <van-checkbox name="car">自驾</van-checkbox>
            <van-checkbox name="walk">步行</van-checkbox>
            <van-checkbox name="plane">飞机</van-checkbox>
          </van-checkbox-group>
        </div>

        <div class="filter-section">
          <div class="filter-label">收费类型</div>
          <van-radio-group v-model="filterData.feeType">
            <van-radio name="all">全部</van-radio>
            <van-radio name="free">免费</van-radio>
            <van-radio name="paid">收费</van-radio>
          </van-radio-group>
        </div>

        <div class="filter-section">
          <div class="filter-label">景点类型</div>
          <van-checkbox-group v-model="filterData.scenicType">
            <van-checkbox name="culture">人文景观</van-checkbox>
            <van-checkbox name="nature">自然风光</van-checkbox>
            <van-checkbox name="amusement">娱乐休闲</van-checkbox>
            <van-checkbox name="historical">历史古迹</van-checkbox>
          </van-checkbox-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getScenicList } from '@/api/scenic'
import WaterfallList from '@/components/WaterfallList.vue'
import { showToast } from 'vant'

const router = useRouter()
const searchKeyword = ref('')
const activeTab = ref(0)
const showFilter = ref(false)
const locationInfo = ref('')
const scenicList = ref([])
const filterData = ref({
  travelMode: [],
  feeType: 'all',
  scenicType: []
})

const filteredList = computed(() => {
  let list = scenicList.value
  if (searchKeyword.value) {
    list = list.filter(item => 
      item.name.includes(searchKeyword.value) || 
      item.description.includes(searchKeyword.value)
    )
  }
  return list
})

function getLocation() {
  locationInfo.value = '北京市朝阳区'
}

async function loadScenicList() {
  try {
    const res = await getScenicList()
    if (res.code === 0) {
      scenicList.value = res.data.list || []
    }
  } catch (error) {
    showToast('加载失败')
  }
}

function goDetail(item) {
  router.push(`/scenic/${item.id}`)
}

function handleSearch() {
  loadScenicList()
}

function applyFilter() {
  showFilter.value = false
  loadScenicList()
}

onMounted(() => {
  getLocation()
  loadScenicList()
})
</script>

<style scoped>
.scenic-page {
  min-height: 100vh;
}

.location-bar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #fff;
  font-size: 13px;
  color: #969799;
  gap: 6px;
}

.filter-content {
  padding: 20px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-title {
  font-size: 16px;
  font-weight: bold;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #323233;
}
</style>
