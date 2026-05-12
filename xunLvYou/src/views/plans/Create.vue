<template>
  <div class="plan-create">
    <van-nav-bar
      title="创建计划"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.name"
          name="name"
          label="计划名称"
          placeholder="请输入计划名称"
          :rules="[{ required: true, message: '请输入计划名称' }]"
        />

        <van-field
          v-model="selectedScenicName"
          name="scenic"
          label="选择景点"
          placeholder="请选择景点"
          readonly
          is-link
          @click="showScenicPicker = true"
          :rules="[{ required: true, message: '请选择景点' }]"
        >
          <template #input>
            <span :class="selectedScenicName ? '' : 'placeholder'">
              {{ selectedScenicName || '请选择景点' }}
            </span>
          </template>
        </van-field>

        <van-field
          v-model="form.travelDate"
          name="travelDate"
          label="出行时间"
          placeholder="请选择出行时间"
          readonly
          is-link
          @click="showDatePicker = true"
          :rules="[{ required: true, message: '请选择出行时间' }]"
        />

        <van-field
          v-model="form.peopleCount"
          name="peopleCount"
          label="出行人数"
          type="number"
          placeholder="请输入出行人数"
        />
      </van-cell-group>

      <div class="selected-scenics">
        <div class="section-title">已选景点 ({{ selectedScenics.length }})</div>
        <div v-if="selectedScenics.length === 0" class="empty-tip">
          还未选择景点
        </div>
        <div v-else class="scenic-tags">
          <van-tag
            v-for="scenic in selectedScenics"
            :key="scenic.id"
            closeable
            type="primary"
            @close="removeScenic(scenic.id)"
          >
            {{ scenic.name }}
          </van-tag>
        </div>
      </div>

      <div class="action-section">
        <van-button
          type="primary"
          round
          block
          :disabled="selectedScenics.length === 0"
          :loading="generatingGuide"
          @click="generateGuide"
        >
          生成出行攻略
        </van-button>
      </div>

      <div v-if="guideResult" class="guide-result">
        <div class="section-title">AI生成的出行攻略</div>
        <div class="guide-content" v-html="guideResult.content"></div>
      </div>

      <div class="submit-btn">
        <van-button round block type="primary" native-type="submit" :loading="submitting">
          保存计划
        </van-button>
      </div>
    </van-form>

    <van-popup
      v-model:show="showScenicPicker"
      round
      position="bottom"
      :style="{ height: '70%' }"
    >
      <div class="picker-header">
        <span class="picker-title">选择景点</span>
        <van-button type="primary" size="small" @click="confirmScenic">确定</van-button>
      </div>
      <div class="scenic-list">
        <van-cell
          v-for="scenic in scenicList"
          :key="scenic.id"
          :title="scenic.name"
          :label="scenic.address"
          clickable
          @click="toggleScenic(scenic)"
        >
          <template #right-icon>
            <van-checkbox :checked="isScenicSelected(scenic.id)" />
          </template>
        </van-cell>
      </div>
    </van-popup>

    <van-calendar
      v-model:show="showDatePicker"
      type="range"
      @confirm="onDateConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createPlan, generateGuide as generateGuideApi } from '@/api/plan'
import { getScenicList } from '@/api/scenic'
import { showToast } from 'vant'

const router = useRouter()
const submitting = ref(false)
const generatingGuide = ref(false)
const showScenicPicker = ref(false)
const showDatePicker = ref(false)
const scenicList = ref([])
const tempSelectedScenics = ref([])
const guideResult = ref(null)

const form = reactive({
  name: '',
  scenicId: '',
  travelDate: '',
  peopleCount: 1,
  scenicIds: []
})

const selectedScenics = ref([])
const selectedScenicName = computed(() => {
  if (selectedScenics.value.length === 0) return ''
  if (selectedScenics.value.length === 1) return selectedScenics.value[0].name
  return `已选${selectedScenics.value.length}个景点`
})

async function loadScenicList() {
  try {
    const res = await getScenicList()
    if (res.code === 0) {
      scenicList.value = res.data.list || []
    }
  } catch (error) {
    showToast('加载景点失败')
  }
}

function isScenicSelected(id) {
  return tempSelectedScenics.value.some(s => s.id === id)
}

function toggleScenic(scenic) {
  const index = tempSelectedScenics.value.findIndex(s => s.id === scenic.id)
  if (index > -1) {
    tempSelectedScenics.value.splice(index, 1)
  } else {
    tempSelectedScenics.value.push(scenic)
  }
}

function confirmScenic() {
  selectedScenics.value = [...tempSelectedScenics.value]
  form.scenicIds = selectedScenics.value.map(s => s.id)
  if (selectedScenics.value.length > 0) {
    form.scenicId = selectedScenics.value[0].id
  }
  showScenicPicker.value = false
}

function removeScenic(id) {
  const index = selectedScenics.value.findIndex(s => s.id === id)
  if (index > -1) {
    selectedScenics.value.splice(index, 1)
    form.scenicIds = selectedScenics.value.map(s => s.id)
  }
}

function onDateConfirm({ selectedValues }) {
  if (selectedValues.length === 2) {
    const start = selectedValues[0]
    const end = selectedValues[1]
    form.travelDate = `${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()} 至 ${end.getFullYear()}-${end.getMonth() + 1}-${end.getDate()}`
  } else if (selectedValues.length === 1) {
    const date = selectedValues[0]
    form.travelDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  }
  showDatePicker.value = false
}

async function generateGuide() {
  if (selectedScenics.value.length === 0) {
    showToast('请先选择景点')
    return
  }
  
  try {
    generatingGuide.value = true
    const res = await generateGuideApi({
      scenicIds: form.scenicIds,
      travelDate: form.travelDate,
      peopleCount: form.peopleCount
    })
    if (res.code === 0) {
      guideResult.value = res.data
      showToast('攻略生成成功')
    }
  } catch (error) {
    showToast('攻略生成失败')
  } finally {
    generatingGuide.value = false
  }
}

async function onSubmit() {
  try {
    submitting.value = true
    const res = await createPlan({
      ...form,
      guide: guideResult.value
    })
    if (res.code === 0) {
      showToast('创建成功')
      router.back()
    }
  } catch (error) {
    showToast('创建失败')
  } finally {
    submitting.value = false
  }
}

function onBack() {
  router.back()
}

onMounted(() => {
  loadScenicList()
})
</script>

<style scoped>
.plan-create {
  min-height: 100vh;
  padding-bottom: 100px;
}

.selected-scenics {
  padding: 16px;
  background: #fff;
  margin: 12px 16px;
  border-radius: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 12px;
}

.empty-tip {
  color: #969799;
  font-size: 13px;
}

.scenic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-section {
  padding: 0 16px;
  margin-bottom: 16px;
}

.guide-result {
  padding: 16px;
  background: #fff;
  margin: 12px 16px;
  border-radius: 12px;
}

.guide-content {
  font-size: 14px;
  line-height: 1.8;
  color: #646566;
  white-space: pre-wrap;
}

.submit-btn {
  padding: 16px;
}

.placeholder {
  color: #c8c9cc;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.picker-title {
  font-size: 16px;
  font-weight: 500;
}

.scenic-list {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
