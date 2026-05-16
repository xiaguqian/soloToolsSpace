import { useState } from 'react'
import useAppStore from '../store/appStore'
import ShelfGroup from '../components/Shelf/ShelfGroup'
import ReadingHistory from '../components/Shelf/ReadingHistory'
import { openFileDialog, readFile, getFileExtension } from '../utils/storage'

const ShelfPage = ({ onBookClick, onAddBook }) => {
  const { theme, shelfGroups, addGroup, initShelf } = useAppStore()
  const [showAddGroupModal, setShowAddGroupModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim())
      setNewGroupName('')
      setShowAddGroupModal(false)
    }
  }

  const handleImportBook = async () => {
    const filePath = await openFileDialog()
    if (filePath) {
      const ext = getFileExtension(filePath)
      if ([ '.txt', '.chm', '.pdf' ].includes(ext)) {
        const result = await readFile(filePath)
        if (result.success) {
          const book = {
            id: `local_${Date.now()}`,
            name: filePath.split('/').pop().replace(ext, ''),
            author: '本地文件',
            cover: '',
            description: '本地导入的书籍',
            filePath,
            fileType: ext.slice(1),
          }
          onAddBook(book)
        }
      } else {
        alert('暂不支持该文件格式')
      }
    }
  }

  if (shelfGroups.length === 0) {
    initShelf()
  }

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-night' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          我的书架
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleImportBook}
            className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} shadow`}
          >
            导入书籍
          </button>
          <button
            onClick={() => setShowAddGroupModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            + 新建分组
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ReadingHistory onBookClick={onBookClick} />
        </div>
        <div className="space-y-6">
          {shelfGroups.map((group) => (
            <ShelfGroup key={group.id} group={group} onBookClick={onBookClick} />
          ))}
        </div>
      </div>

      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddGroupModal(false)}>
          <div className={`p-6 rounded-xl shadow-xl ${theme === 'dark' ? 'bg-night-light text-white' : 'bg-white text-gray-800'}`} onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-4">新建分组</h3>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
              placeholder="分组名称"
              className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-night border-gray-600' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAddGroupModal(false)}
                className={`flex-1 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}`}
              >
                取消
              </button>
              <button
                onClick={handleAddGroup}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShelfPage
