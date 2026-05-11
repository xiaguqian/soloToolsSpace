import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/tasks'
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/TaskList.vue')
  },
  {
    path: '/tasks/new',
    name: 'TaskNew',
    component: () => import('@/views/TaskEditor.vue')
  },
  {
    path: '/tasks/edit/:id',
    name: 'TaskEdit',
    component: () => import('@/views/TaskEditor.vue')
  },
  {
    path: '/components',
    name: 'Components',
    component: () => import('@/views/ComponentList.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
