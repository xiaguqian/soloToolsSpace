import { createRouter, createWebHistory } from 'vue-router'
import BookList from '../views/BookList.vue'
import BookDetail from '../views/BookDetail.vue'
import Writing from '../views/Writing.vue'
import UserList from '../views/UserList.vue'
import RoleList from '../views/RoleList.vue'

const routes = [
  { path: '/', redirect: '/books' },
  { path: '/books', component: BookList },
  { path: '/books/:id', component: BookDetail },
  { path: '/writing', component: Writing },
  { path: '/users', component: UserList },
  { path: '/roles', component: RoleList }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router