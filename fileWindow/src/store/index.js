import { reactive, readonly } from 'vue'

const state = reactive({
  config: null,
  stats: null,
  activeTab: 'directories',
  currentDirectorySetId: null,
  currentFileSetId: null
})

const actions = {
  async loadConfig() {
    if (window.electronAPI) {
      const config = await window.electronAPI.getConfig()
      if (config) {
        if (!config.tags) config.tags = []
        if (!config.directorySets) config.directorySets = []
        if (!config.fileSets) config.fileSets = []
        
        const allTags = new Set(config.tags || [])
        config.directorySets.forEach(set => {
          (set.items || []).forEach(item => {
            if (item.tag) allTags.add(item.tag)
          })
        })
        config.fileSets.forEach(set => {
          (set.items || []).forEach(item => {
            if (item.tag) allTags.add(item.tag)
          })
        })
        config.tags = Array.from(allTags)
        
        state.config = config
        state.currentDirectorySetId = config.defaultDirectorySetId
        state.currentFileSetId = config.defaultFileSetId
        await this.saveConfig()
      }
    }
  },
  
  async saveConfig() {
    if (window.electronAPI && state.config) {
      await window.electronAPI.saveConfig(state.config)
    }
  },
  
  async loadStats() {
    if (window.electronAPI) {
      const stats = await window.electronAPI.getStats()
      if (stats) {
        state.stats = stats
      }
    }
  },
  
  async saveStats() {
    if (window.electronAPI && state.stats) {
      await window.electronAPI.saveStats(state.stats)
    }
  },
  
  setActiveTab(tab) {
    state.activeTab = tab
  },
  
  setCurrentDirectorySetId(id) {
    state.currentDirectorySetId = id
    if (state.config) {
      state.config.defaultDirectorySetId = id
      this.saveConfig()
    }
  },
  
  setCurrentFileSetId(id) {
    state.currentFileSetId = id
    if (state.config) {
      state.config.defaultFileSetId = id
      this.saveConfig()
    }
  },
  
  getDirectorySet(setId = null) {
    if (!state.config) return null
    const id = setId || state.currentDirectorySetId
    return state.config.directorySets.find(s => s.id === id)
  },
  
  getFileSet(setId = null) {
    if (!state.config) return null
    const id = setId || state.currentFileSetId
    return state.config.fileSets.find(s => s.id === id)
  },
  
  async addDirectoryItem(setId, item) {
    if (!state.config) return
    const set = state.config.directorySets.find(s => s.id === setId)
    if (set) {
      if (!set.items) set.items = []
      set.items.push(item)
      await this.saveConfig()
    }
  },
  
  async updateDirectoryItem(setId, itemId, updates) {
    if (!state.config) return
    const set = state.config.directorySets.find(s => s.id === setId)
    if (set && set.items) {
      const item = set.items.find(i => i.id === itemId)
      if (item) {
        Object.assign(item, updates)
        await this.saveConfig()
      }
    }
  },
  
  async removeDirectoryItem(setId, itemId) {
    if (!state.config) return
    const set = state.config.directorySets.find(s => s.id === setId)
    if (set && set.items) {
      set.items = set.items.filter(i => i.id !== itemId)
      await this.saveConfig()
    }
  },
  
  async addFileItem(setId, item) {
    if (!state.config) return
    const set = state.config.fileSets.find(s => s.id === setId)
    if (set) {
      if (!set.items) set.items = []
      set.items.push(item)
      await this.saveConfig()
    }
  },
  
  async updateFileItem(setId, itemId, updates) {
    if (!state.config) return
    const set = state.config.fileSets.find(s => s.id === setId)
    if (set && set.items) {
      const item = set.items.find(i => i.id === itemId)
      if (item) {
        Object.assign(item, updates)
        await this.saveConfig()
      }
    }
  },
  
  async removeFileItem(setId, itemId) {
    if (!state.config) return
    const set = state.config.fileSets.find(s => s.id === setId)
    if (set && set.items) {
      set.items = set.items.filter(i => i.id !== itemId)
      await this.saveConfig()
    }
  },
  
  async addDirectorySet(set) {
    if (!state.config) return
    state.config.directorySets.push(set)
    await this.saveConfig()
  },
  
  async removeDirectorySet(setId) {
    if (!state.config) return
    state.config.directorySets = state.config.directorySets.filter(s => s.id !== setId)
    if (state.config.defaultDirectorySetId === setId && state.config.directorySets.length > 0) {
      state.config.defaultDirectorySetId = state.config.directorySets[0].id
    }
    await this.saveConfig()
  },
  
  async addFileSet(set) {
    if (!state.config) return
    state.config.fileSets.push(set)
    await this.saveConfig()
  },
  
  async removeFileSet(setId) {
    if (!state.config) return
    state.config.fileSets = state.config.fileSets.filter(s => s.id !== setId)
    if (state.config.defaultFileSetId === setId && state.config.fileSets.length > 0) {
      state.config.defaultFileSetId = state.config.fileSets[0].id
    }
    await this.saveConfig()
  },
  
  incrementDirectorySetUsage(setId) {
    if (!state.stats) return
    if (!state.stats.directorySets) state.stats.directorySets = {}
    if (!state.stats.directorySets[setId]) {
      state.stats.directorySets[setId] = 0
    }
    state.stats.directorySets[setId]++
    this.saveStats()
  },
  
  incrementDirectoryItemUsage(itemId) {
    if (!state.stats) return
    if (!state.stats.directoryItems) state.stats.directoryItems = {}
    if (!state.stats.directoryItems[itemId]) {
      state.stats.directoryItems[itemId] = 0
    }
    state.stats.directoryItems[itemId]++
    this.saveStats()
  },
  
  incrementFileSetUsage(setId) {
    if (!state.stats) return
    if (!state.stats.fileSets) state.stats.fileSets = {}
    if (!state.stats.fileSets[setId]) {
      state.stats.fileSets[setId] = 0
    }
    state.stats.fileSets[setId]++
    this.saveStats()
  },
  
  incrementFileItemUsage(itemId) {
    if (!state.stats) return
    if (!state.stats.fileItems) state.stats.fileItems = {}
    if (!state.stats.fileItems[itemId]) {
      state.stats.fileItems[itemId] = 0
    }
    state.stats.fileItems[itemId]++
    this.saveStats()
  },
  
  setUseAppForTextFiles(value) {
    if (state.config) {
      state.config.useAppForTextFiles = value
      this.saveConfig()
    }
  },
  
  getAllTags() {
    if (!state.config) return []
    if (!state.config.tags) state.config.tags = []
    return state.config.tags
  },
  
  async addTag(tag) {
    if (!state.config || !tag) return
    if (!state.config.tags) state.config.tags = []
    if (!state.config.tags.includes(tag)) {
      state.config.tags.push(tag)
      await this.saveConfig()
    }
  },
  
  async removeTag(tag) {
    if (!state.config || !tag) return
    if (!state.config.tags) return
    state.config.tags = state.config.tags.filter(t => t !== tag)
    await this.saveConfig()
  }
}

export function useStore() {
  return {
    state: readonly(state),
    ...actions
  }
}

export const store = {
  install(app) {
    app.config.globalProperties.$store = useStore()
    app.provide('store', useStore())
  }
}
