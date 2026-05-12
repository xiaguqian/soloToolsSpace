<template>
  <div class="page-container cook-page">
    <van-nav-bar title="开始做菜" left-arrow @click-left="handleBack" />

    <div v-if="!started" class="setup-phase">
      <div class="steps-list">
        <h3 class="title">确认步骤时间</h3>
        <div class="step-card" v-for="(step, index) in steps" :key="index">
          <div class="step-header">
            <span class="step-num">步骤 {{ index + 1 }}</span>
            <van-stepper
              v-model="step.duration"
              :min="10"
              :max="3600"
              :step="30"
              @change="onDurationChange(index)"
            />
            <span class="unit">秒</span>
          </div>
          <p class="step-desc">{{ step.description }}</p>
          <div class="duration-display">{{ formatDuration(step.duration) }}</div>
        </div>
      </div>

      <div class="bottom-bar">
        <van-button type="primary" block size="large" @click="startCooking">
          开始做菜
        </van-button>
      </div>
    </div>

    <div v-else class="cooking-phase">
      <div class="timer-container">
        <div class="timer-display">
          <div class="current-step">步骤 {{ currentIndex + 1 }} / {{ steps.length }}</div>
          <div class="timer" :class="{ warning: currentTime <= 10 }">
            {{ formatTimer(currentTime) }}
          </div>
          <div class="step-desc-large">{{ currentStep?.description }}</div>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <div class="controls">
        <van-button round type="default" @click="togglePause">
          {{ paused ? '继续' : '暂停' }}
        </van-button>
        <van-button round type="primary" @click="nextStep" v-if="!isLastStep">
          下一步
        </van-button>
        <van-button round type="success" @click="finishCooking" v-else>
          完成
        </van-button>
      </div>
    </div>

    <van-dialog
      v-model:show="showFinishDialog"
      title="🎉 恭喜完成！"
      message="您已完成这道菜的制作，享受美食吧！"
      show-cancel-button
      confirm-button-text="返回菜谱"
      cancel-button-text="继续浏览"
      @confirm="$router.back()"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { recipeApi } from '@/api'
import { showConfirmDialog, showToast } from 'vant'

const route = useRoute()
const router = useRouter()

const steps = ref([])
const started = ref(false)
const paused = ref(false)
const currentIndex = ref(0)
const currentTime = ref(0)
const timer = ref(null)
const showFinishDialog = ref(false)

const currentStep = computed(() => steps.value[currentIndex.value])
const isLastStep = computed(() => currentIndex.value >= steps.value.length - 1)
const progressPercent = computed(() => {
  if (!currentStep.value) return 0
  const total = currentStep.value.duration
  return ((total - currentTime.value) / total) * 100
})

const loadSteps = async () => {
  try {
    const data = await recipeApi.startCooking(route.params.id)
    steps.value = data || []
    if (steps.value.length === 0) {
      showToast('获取步骤失败')
    }
  } catch (e) {
    console.error(e)
    showToast('加载失败')
  }
}

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}分${s}秒` : `${s}秒`
}

const formatTimer = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

const onDurationChange = (index) => {
  if (index === currentIndex.value && started.value) {
    currentTime.value = steps.value[index].duration
  }
}

const startCooking = () => {
  if (steps.value.length === 0) return
  started.value = true
  currentIndex.value = 0
  currentTime.value = steps.value[0].duration
  startTimer()
}

const startTimer = () => {
  if (timer.value) clearInterval(timer.value)
  timer.value = setInterval(() => {
    if (!paused.value) {
      if (currentTime.value > 0) {
        currentTime.value--
        if (currentTime.value === 10) {
          speak(`当前步骤还剩10秒，请准备下一步`)
        } else if (currentTime.value === 3) {
          speak(`3，2，1`)
        }
      } else {
        if (!isLastStep.value) {
          speak(`当前步骤完成，准备下一步`)
          nextStep()
        } else {
          clearInterval(timer.value)
          speak(`恭喜您，这道菜已制作完成`)
          showFinishDialog.value = true
        }
      }
    }
  }, 1000)
}

const speak = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 1
    speechSynthesis.speak(utterance)
  }
}

const togglePause = () => {
  paused.value = !paused.value
}

const nextStep = () => {
  if (isLastStep.value) {
    finishCooking()
    return
  }
  currentIndex.value++
  currentTime.value = steps.value[currentIndex.value].duration
}

const finishCooking = () => {
  if (timer.value) clearInterval(timer.value)
  showFinishDialog.value = true
}

const handleBack = () => {
  if (started.value) {
    showConfirmDialog({
      title: '确认退出？',
      message: '退出后当前进度将丢失',
    }).then(() => {
      if (timer.value) clearInterval(timer.value)
      router.back()
    }).catch(() => {})
  } else {
    router.back()
  }
}

onMounted(() => {
  loadSteps()
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
</script>

<style lang="scss" scoped>
.cook-page {
  min-height: 100vh;
}

.setup-phase {
  padding-bottom: 80px;
  
  .title {
    padding: 16px;
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  
  .step-card {
    background: #fff;
    margin: 0 12px 12px;
    border-radius: 12px;
    padding: 16px;
    
    .step-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .step-num {
      font-size: 14px;
      font-weight: 600;
      color: #ff6b6b;
    }
    
    .unit {
      font-size: 12px;
      color: #999;
    }
    
    .step-desc {
      font-size: 14px;
      color: #333;
      margin: 12px 0;
      line-height: 1.5;
    }
    
    .duration-display {
      font-size: 20px;
      font-weight: bold;
      color: #ff6b6b;
      text-align: center;
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.cooking-phase {
  min-height: calc(100vh - 46px);
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  
  .timer-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    
    .current-step {
      font-size: 16px;
      color: rgba(255,255,255,0.9);
      margin-bottom: 24px;
    }
    
    .timer {
      font-size: 80px;
      font-weight: bold;
      color: #fff;
      font-family: 'SF Mono', monospace;
      
      &.warning {
        color: #ffeb3b;
        animation: pulse 0.5s infinite;
      }
    }
    
    .step-desc-large {
      font-size: 18px;
      color: #fff;
      margin-top: 24px;
      text-align: center;
      line-height: 1.6;
      max-width: 80%;
    }
    
    .progress-bar {
      width: 80%;
      height: 8px;
      background: rgba(255,255,255,0.3);
      border-radius: 4px;
      margin-top: 40px;
      overflow: hidden;
      
      .progress-fill {
        height: 100%;
        background: #fff;
        border-radius: 4px;
        transition: width 0.3s;
      }
    }
  }
  
  .controls {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding: 24px 16px;
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>
