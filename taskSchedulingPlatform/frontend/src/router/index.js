import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Layout from '../views/Layout.vue'
import Dashboard from '../views/Dashboard.vue'
import TaskList from '../views/TaskList.vue'
import LogList from '../views/LogList.vue'
import UserList from '../views/UserList.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '首页' }
      },
      {
        path: 'tasks',
        name: 'TaskList',
        component: TaskList,
        meta: { title: '任务管理' }
      },
      {
        path: 'logs',
        name: 'LogList',
        component: LogList,
        meta: { title: '日志查询' }
      },
      {
        path: 'users',
        name: 'UserList',
        component: UserList,
        meta: { title: '用户管理', roles: ['ADMIN'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')

  if (to.meta.public) {
    next()
  } else if (!token) {
    next('/login')
  } else if (to.meta.roles && to.meta.roles.length > 0 && !to.meta.roles.includes(userRole)) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
