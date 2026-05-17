<template>
  <div class="layout-container">
    <router-view />
    <van-tabbar v-model="active" :route="true" safe-area-inset-bottom>
      <van-tabbar-item icon="orders-o" name="order" to="/order">订单</van-tabbar-item>
      <van-tabbar-item icon="goods-o" name="product" to="/product">商品</van-tabbar-item>
      <van-tabbar-item icon="bar-chart-o" name="dashboard" to="/dashboard">数据</van-tabbar-item>
      <van-tabbar-item icon="qr" name="table" to="/table">桌码</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const active = ref('order')

const updateActive = () => {
  const path = router.currentRoute.value.path
  if (path === '/order') active.value = 'order'
  else if (path === '/product') active.value = 'product'
  else if (path === '/dashboard') active.value = 'dashboard'
  else if (path === '/table') active.value = 'table'
}

onMounted(() => {
  updateActive()
  router.afterEach(updateActive)
})
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>
