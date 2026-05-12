import scenicList from '@/data/scenic-list.json'
import scenicDetail from '@/data/scenic-detail.json'
import noteList from '@/data/note-list.json'
import noteDetail from '@/data/note-detail.json'
import planList from '@/data/plan-list.json'
import planDetail from '@/data/plan-detail.json'
import guideResult from '@/data/guide-result.json'
import smartTravelResult from '@/data/smart-travel-result.json'
import outfitResult from '@/data/outfit-result.json'
import galleryList from '@/data/gallery-list.json'
import favoritesList from '@/data/favorites-list.json'
import userInfo from '@/data/user-info.json'

const localDataMap = {
  'scenic-list': scenicList,
  'scenic-detail': scenicDetail,
  'note-list': noteList,
  'note-detail': noteDetail,
  'plan-list': planList,
  'plan-detail': planDetail,
  'guide-result': guideResult,
  'smart-travel-result': smartTravelResult,
  'outfit-result': outfitResult,
  'gallery-list': galleryList,
  'favorites-list': favoritesList,
  'user-info': userInfo
}

export function getLocalData(key) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = localDataMap[key]
      resolve({
        code: 0,
        message: 'success',
        data: data
      })
    }, 300)
  })
}

export function simulatePost(key, requestData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = localDataMap[key]
      resolve({
        code: 0,
        message: 'success',
        data: data
      })
    }, 500)
  })
}

export default {
  getLocalData,
  simulatePost
}
