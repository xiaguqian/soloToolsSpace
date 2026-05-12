<template>
  <div id="app" class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <Tabbar v-if="showTabbar" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Tabbar from './components/Tabbar.vue'

const route = useRoute()

const showTabbar = computed(() => {
  const hidePages = ['/note-create', '/plan-create', '/smart-travel', '/outfit', '/gallery-add']
  return !hidePages.includes(route.path)
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  padding-bottom: 50px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
