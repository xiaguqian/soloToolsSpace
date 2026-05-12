import { isLocalEnv } from '@/config/env'
import { get, post } from '@/utils/request'
import { getLocalData, simulatePost } from '@/utils/localDataLoader'

export function getNoteList(params) {
  if (isLocalEnv()) {
    return getLocalData('note-list')
  }
  return get('/api/note/list', params)
}

export function getNoteDetail(id) {
  if (isLocalEnv()) {
    return getLocalData('note-detail')
  }
  return get(`/api/note/${id}`)
}

export function createNote(data) {
  if (isLocalEnv()) {
    return simulatePost('note-detail', data)
  }
  return post('/api/note/create', data)
}

export function favoriteNote(id) {
  if (isLocalEnv()) {
    return simulatePost('note-detail', { noteId: id })
  }
  return post('/api/note/favorite', { noteId: id })
}

export function unfavoriteNote(id) {
  if (isLocalEnv()) {
    return simulatePost('note-detail', { noteId: id })
  }
  return post('/api/note/unfavorite', { noteId: id })
}

export default {
  getNoteList,
  getNoteDetail,
  createNote,
  favoriteNote,
  unfavoriteNote
}
