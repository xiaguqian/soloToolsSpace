import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '数据概览' }
  },
  {
    path: '/dimensions',
    name: 'Dimensions',
    component: () => import('@/views/Dimensions.vue'),
    meta: { title: '维度管理' }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/Categories.vue'),
    meta: { title: '分类管理' }
  },
  {
    path: '/data-definitions',
    name: 'DataDefinitions',
    component: () => import('@/views/DataDefinitions.vue'),
    meta: { title: '数据定义' }
  },
  {
    path: '/formulas',
    name: 'Formulas',
    component: () => import('@/views/Formulas.vue'),
    meta: { title: '公式管理' }
  },
  {
    path: '/query-statements',
    name: 'QueryStatements',
    component: () => import('@/views/QueryStatements.vue'),
    meta: { title: '查询语句' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 数据分析应用` : '数据分析应用'
  next()
})

export default router
