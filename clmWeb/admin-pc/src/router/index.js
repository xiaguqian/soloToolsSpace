import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      { path: '/dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },
      { path: '/product', name: 'Product', component: () => import('../views/Product.vue') },
      { path: '/category', name: 'Category', component: () => import('../views/Category.vue') },
      { path: '/table', name: 'Table', component: () => import('../views/Table.vue') },
      { path: '/order', name: 'Order', component: () => import('../views/Order.vue') },
      { path: '/settings', name: 'Settings', component: () => import('../views/Settings.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
