import { useState } from 'react'
import useAppStore from '../../store/appStore'

const BookDetail = ({ book, onClose, onRead }) => {
  const { theme, addBookToShelf, addToReadingHistory, shelfGroups } = useAppStore()
  const [activeTab, setActiveTab] = useState('info')
  const [added, setAdded] = useState(false)

  const handleAddToShelf = () => {
    const defaultGroup = shelfGroups.find(g => g.isDefault) || shelfGroups[0]
    if (defaultGroup) {
      addBookToShelf(book, defaultGroup.id)
      setAdded(true)
    }
  }

  const handleRead = () => {
    addToReadingHistory(book)
    onRead(book)
  }

  if (!book) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className={`w-full max-w-4xl h-[80vh] overflow-auto rounded-xl shadow-2xl ${theme === 'dark' ? 'bg-night-light text-white' : 'bg-white text-gray-800'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 p-6">
            <div className={`aspect-[3/4] rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <img
                src={book.cover}
                alt={book.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRead}
                className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                立即阅读
              </button>
              <button
                onClick={handleAddToShelf}
                disabled={added}
                className={`flex-1 py-3 rounded-lg transition-colors ${added ? 'bg-gray-200 text-gray-500' : `${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'}`}`}
              >
                {added ? '已添加' : '加入书架'}
              </button>
            </div>
          </div>

          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{book.name}</h2>
                <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  作者: {book.author}
                </p>
              </div>
              <button onClick={onClose} className={`text-gray-400 hover:text-gray-600 ${theme === 'dark' ? 'hover:text-white' : ''}`}>
                ✕
              </button>
            </div>

            <div className="flex gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {book.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${book.isCompleted ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                {book.isCompleted ? '已完结' : '连载中'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                {book.wordCount}
              </span>
            </div>

            <div className="flex border-b mb-4">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info' ? 'border-blue-500 text-blue-500' : `${theme === 'dark' ? 'border-transparent text-gray-400' : 'border-transparent text-gray-500'}`}`}
              >
                简介
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'catalog' ? 'border-blue-500 text-blue-500' : `${theme === 'dark' ? 'border-transparent text-gray-400' : 'border-transparent text-gray-500'}`}`}
              >
                目录
              </button>
            </div>

            {activeTab === 'info' ? (
              <p className={`leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {book.description}
              </p>
            ) : (
              <div className="max-h-[400px] overflow-auto">
                {book.chapters?.map((chapter, index) => (
                  <div
                    key={chapter.id}
                    className={`flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700' : ''}`}
                    onClick={() => handleRead()}
                  >
                    <span>{index + 1}. {chapter.title}</span>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {chapter.wordCount}字
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetail
