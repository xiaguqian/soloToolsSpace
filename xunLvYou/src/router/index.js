import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/scenic'
  },
  {
    path: '/scenic',
    name: 'Scenic',
    component: () => import('@/views/scenic/Index.vue'),
    meta: { title: '景点' }
  },
  {
    path: '/scenic/:id',
    name: 'ScenicDetail',
    component: () => import('@/views/scenic/Detail.vue'),
    meta: { title: '景点详情' }
  },
  {
    path: '/notes',
    name: 'Notes',
    component: () => import('@/views/notes/Index.vue'),
    meta: { title: '出行笔记' }
  },
  {
    path: '/note-create',
    name: 'NoteCreate',
    component: () => import('@/views/notes/Create.vue'),
    meta: { title: '发布笔记' }
  },
  {
    path: '/notes/:id',
    name: 'NoteDetail',
    component: () => import('@/views/notes/Detail.vue'),
    meta: { title: '笔记详情' }
  },
  {
    path: '/plans',
    name: 'Plans',
    component: () => import('@/views/plans/Index.vue'),
    meta: { title: '出行计划' }
  },
  {
    path: '/plan-create',
    name: 'PlanCreate',
    component: () => import('@/views/plans/Create.vue'),
    meta: { title: '创建计划' }
  },
  {
    path: '/plan-detail/:id',
    name: 'PlanDetail',
    component: () => import('@/views/plans/Detail.vue'),
    meta: { title: '计划详情' }
  },
  {
    path: '/smart-travel',
    name: 'SmartTravel',
    component: () => import('@/views/smart-travel/Index.vue'),
    meta: { title: '智能云出行' }
  },
  {
    path: '/outfit',
    name: 'Outfit',
    component: () => import('@/views/outfit/Index.vue'),
    meta: { title: '穿搭推荐' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/Index.vue'),
    meta: { title: '个人中心' }
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('@/views/gallery/Index.vue'),
    meta: { title: '个人图集' }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/favorites/Index.vue'),
    meta: { title: '个人收藏' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title + ' - 寻旅游'
  }
  next()
})

export default router
