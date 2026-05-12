import axios from 'axios';

const API_BASE = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => {
    if (response.data.code !== 200) {
      return Promise.reject(new Error(response.data.message || '请求失败'));
    }
    return response.data.data;
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  sendCode: (data) => api.post('/api/auth/send-code', data),
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
  logout: () => api.post('/api/auth/logout')
};

export const userApi = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data) => api.put('/api/user/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  searchUsers: (keyword) => api.get(`/api/user/search?keyword=${encodeURIComponent(keyword)}`),
  getUserById: (id) => api.get(`/api/user/${id}`)
};

export const friendApi = {
  sendRequest: (data) => api.post('/api/friend/request', data),
  getRequests: () => api.get('/api/friend/requests'),
  acceptRequest: (id) => api.post(`/api/friend/request/${id}/accept`),
  rejectRequest: (id) => api.post(`/api/friend/request/${id}/reject`),
  addToBlacklist: (friendId) => api.post(`/api/friend/${friendId}/blacklist`),
  getList: () => api.get('/api/friend/list'),
  getGroups: () => api.get('/api/friend/groups'),
  createGroup: (data) => api.post('/api/friend/group', data),
  renameGroup: (id, data) => api.put(`/api/friend/group/${id}`, data),
  deleteGroup: (id) => api.delete(`/api/friend/group/${id}`),
  updateRemark: (friendId, data) => api.put(`/api/friend/${friendId}/remark`, data),
  updateTags: (friendId, data) => api.put(`/api/friend/${friendId}/tags`, data),
  removeFriend: (friendId) => api.delete(`/api/friend/${friendId}`)
};

export const groupApi = {
  create: (data) => api.post('/api/group/create', data),
  getInfo: (id) => api.get(`/api/group/${id}`),
  updateInfo: (id, data) => api.put(`/api/group/${id}`, data),
  addMembers: (id, data) => api.post(`/api/group/${id}/members`, data),
  removeMember: (groupId, memberId) => api.delete(`/api/group/${groupId}/members/${memberId}`),
  setAdmin: (groupId, memberId, isAdmin) => 
    api.post(`/api/group/${groupId}/admin/${memberId}?isAdmin=${isAdmin}`),
  transfer: (id, data) => api.post(`/api/group/${id}/transfer`, data),
  leave: (id) => api.post(`/api/group/${id}/leave`),
  getMembers: (id) => api.get(`/api/group/${id}/members`),
  getMyGroups: () => api.get('/api/group/my')
};

export const messageApi = {
  send: (data) => api.post('/api/message/send', data),
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/message/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getHistory: (conversationId, page = 0, size = 50) => 
    api.get(`/api/message/history?conversationId=${conversationId}&page=${page}&size=${size}`),
  revoke: (id) => api.post(`/api/message/${id}/revoke`),
  forward: (data) => api.post('/api/message/forward', data),
  mergeForward: (data) => api.post('/api/message/merge-forward', data),
  getConversations: () => api.get('/api/message/conversations'),
  setTop: (conversationId, isTop) => 
    api.post(`/api/message/conversation/${conversationId}/top?isTop=${isTop}`),
  setMute: (conversationId, isMute) => 
    api.post(`/api/message/conversation/${conversationId}/mute?isMute=${isMute}`),
  markRead: (conversationId) => 
    api.post(`/api/message/conversation/${conversationId}/read`),
  deleteConversation: (conversationId) => 
    api.delete(`/api/message/conversation/${conversationId}`)
};

export { API_BASE };
export default api;
