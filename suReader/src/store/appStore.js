import { create } from 'zustand'

const useAppStore = create((set, get) => ({
  theme: 'light',
  fontSize: 16,
  backgroundColor: '#FFF8DC',
  backgroundPattern: 'none',
  showReadingSettings: false,
  currentPage: 'shelf',
  currentBook: null,
  currentChapter: 0,
  shelfGroups: [],
  readingHistory: [],
  defaultShelfId: 'default',
  bookDetail: null,
  searchQuery: '',
  env: 'local',

  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
  setBackgroundColor: (color) => set({ backgroundColor }),
  setBackgroundPattern: (pattern) => set({ backgroundPattern }),
  toggleReadingSettings: () => set((state) => ({ showReadingSettings: !state.showReadingSettings })),
  setCurrentPage: (page) => set({ currentPage }),
  setCurrentBook: (book) => set({ currentBook }),
  setCurrentChapter: (chapter) => set({ currentChapter }),
  setBookDetail: (detail) => set({ bookDetail }),
  setSearchQuery: (query) => set({ searchQuery }),
  setEnv: (env) => set({ env }),

  addBookToShelf: (book, groupId = 'default') => {
    const { shelfGroups } = get()
    const groupIndex = shelfGroups.findIndex((g) => g.id === groupId)
    if (groupIndex >= 0) {
      const updatedGroups = [...shelfGroups]
      if (!updatedGroups[groupIndex].books.find((b) => b.id === book.id)) {
        updatedGroups[groupIndex].books.push(book)
      }
      set({ shelfGroups: updatedGroups })
    }
  },

  removeBookFromShelf: (bookId, groupId) => {
    const { shelfGroups } = get()
    const updatedGroups = shelfGroups.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          books: group.books.filter((b) => b.id !== bookId),
        }
      }
      return group
    })
    set({ shelfGroups: updatedGroups })
  },

  addGroup: (name) => {
    const { shelfGroups } = get()
    const newGroup = {
      id: `group_${Date.now()}`,
      name,
      books: [],
      isDefault: false,
    }
    set({ shelfGroups: [...shelfGroups, newGroup] })
  },

  renameGroup: (groupId, newName) => {
    const { shelfGroups, defaultShelfId } = get()
    if (groupId === defaultShelfId) return
    const updatedGroups = shelfGroups.map((group) =>
      group.id === groupId ? { ...group, name: newName } : group
    )
    set({ shelfGroups: updatedGroups })
  },

  deleteGroup: (groupId) => {
    const { shelfGroups, defaultShelfId } = get()
    if (groupId === defaultShelfId) return
    set({ shelfGroups: shelfGroups.filter((g) => g.id !== groupId) })
  },

  setDefaultShelf: (groupId) => {
    const { shelfGroups } = get()
    const updatedGroups = shelfGroups.map((group) => ({
      ...group,
      isDefault: group.id === groupId,
    }))
    set({ shelfGroups: updatedGroups, defaultShelfId: groupId })
  },

  addToReadingHistory: (book) => {
    const { readingHistory } = get()
    const existingIndex = readingHistory.findIndex((b) => b.id === book.id)
    let updatedHistory
    if (existingIndex >= 0) {
      updatedHistory = [
        book,
        ...readingHistory.filter((_, i) => i !== existingIndex),
      ]
    } else {
      updatedHistory = [book, ...readingHistory].slice(0, 50)
    }
    set({ readingHistory: updatedHistory })
  },

  removeFromReadingHistory: (bookId) => {
    const { readingHistory } = get()
    set({ readingHistory: readingHistory.filter((b) => b.id !== bookId) })
  },

  clearReadingHistory: () => set({ readingHistory: [] }),

  initShelf: () => {
    const defaultGroups = [
      {
        id: 'default',
        name: '默认书架',
        books: [],
        isDefault: true,
      },
    ]
    set({ shelfGroups: defaultGroups, defaultShelfId: 'default' })
  },
}))

export default useAppStore
