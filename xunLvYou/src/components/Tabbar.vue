<template>
  <van-tabbar v-model="active" route>
    <van-tabbar-item replace to="/scenic" icon="location-o">景点</van-tabbar-item>
    <van-tabbar-item replace to="/notes" icon="notes-o">笔记</van-tabbar-item>
    <van-tabbar-item replace to="/plans" icon="todo-list-o">计划</van-tabbar-item>
    <van-tabbar-item replace to="/outfit" icon="shop-o">穿搭</van-tabbar-item>
    <van-tabbar-item replace to="/profile" icon="user-o">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref(0)
</script>

<style scoped>
.van-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
</style>
