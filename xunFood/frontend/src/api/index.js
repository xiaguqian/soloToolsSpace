import request from '@/utils/request'

export const authApi = {
  sendSmsCode: (phone) => request.post('/auth/sms-code', { phone }),
  loginByPhone: (phone, code) => request.post('/auth/login-phone', { phone, code }),
  loginByPassword: (account, password) => request.post('/auth/login-password', { account, password }),
  register: (phone, code, password, nickname) => request.post('/auth/register', { phone, code, password, nickname })
}

export const userApi = {
  getCurrentUser: () => request.get('/users/me'),
  getUserById: (id) => request.get(`/users/${id}`),
  follow: (id) => request.post(`/users/${id}/follow`),
  unfollow: (id) => request.post(`/users/${id}/unfollow`),
  getFollowers: (id) => request.get(`/users/${id}/followers`),
  getFollowings: (id) => request.get(`/users/${id}/followings`)
}

export const recipeApi = {
  getList: (type, page, size) => request.get('/recipes/list', { params: { type, page, size } }),
  getDetail: (id) => request.get(`/recipes/detail/${id}`),
  toggleLike: (id) => request.post(`/recipes/${id}/like`),
  toggleFavorite: (id) => request.post(`/recipes/${id}/favorite`),
  startCooking: (id) => request.post(`/recipes/${id}/cook`),
  getMyFavorites: () => request.get('/recipes/my-favorites'),
  getMyRecipes: () => request.get('/recipes/my-recipes'),
  getLikedUsers: (id) => request.get(`/recipes/${id}/liked-users`),
  getFavoritedUsers: (id) => request.get(`/recipes/${id}/favorited-users`)
}

export const searchApi = {
  searchAll: (keyword) => request.get('/search/all', { params: { keyword } })
}
