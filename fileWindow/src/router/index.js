import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Settings from '../views/Settings.vue'
import BatchCreate from '../views/BatchCreate.vue'
import Statistics from '../views/Statistics.vue'
import Editor from '../views/Editor.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/batch-create',
    name: 'BatchCreate',
    component: BatchCreate
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics
  },
  {
    path: '/editor',
    name: 'Editor',
    component: Editor
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
