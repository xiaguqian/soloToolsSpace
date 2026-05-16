import { useState } from 'react'
import useAppStore from '../../store/appStore'

const ShelfGroup = ({ group, onBookClick }) => {
  const { theme, removeBookFromShelf, renameGroup, deleteGroup, setDefaultShelf, defaultShelfId } = useAppStore()
  const [expanded, setExpanded] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [renameInput, setRenameInput] = useState(group.name)
  const [isRenaming, setIsRenaming] = useState(false)

  const displayedBooks = group.books.slice(0, 9)
  const remainingCount = group.books.length - 9

  const handleRename = () => {
    if (renameInput.trim()) {
      renameGroup(group.id, renameInput.trim())
    }
    setIsRenaming(false)
    setShowMenu(false)
  }

  const handleSetDefault = () => {
    setDefaultShelf(group.id)
    setShowMenu(false)
  }

  const handleDelete = () => {
    deleteGroup(group.id)
    setShowMenu(false)
  }

  return (
    <div className={`rounded-xl overflow-hidden shadow-lg ${theme === 'dark' ? 'bg-night-light' : 'bg-white'}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3" onClick={() => setExpanded(!expanded)}>
          <span className={`text-xl ${expanded ? 'rotate-180' : ''} transition-transform`}>▼</span>
          {isRenaming ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                className={`px-2 py-1 rounded border ${theme === 'dark' ? 'bg-night border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              />
              <button onClick={handleRename} className="text-blue-500">确定</button>
              <button onClick={() => setIsRenaming(false)} className="text-gray-400">取消</button>
            </div>
          ) : (
            <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {group.name}
              {group.isDefault && <span className="ml-2 text-xs text-blue-500">(默认)</span>}
            </span>
          )}
        </div>

        {group.id !== 'default' && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-lg hover:bg-gray-100 ${theme === 'dark' ? 'hover:bg-gray-700' : ''}`}
            >
              ⋮
            </button>
            {showMenu && (
              <div className={`absolute right-0 top-full mt-1 py-2 rounded-lg shadow-lg z-10 min-w-[120px] ${theme === 'dark' ? 'bg-night-light' : 'bg-white'}`}>
                <button
                  onClick={() => setIsRenaming(true)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : ''}`}
                >
                  重命名
                </button>
                <button
                  onClick={handleSetDefault}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : ''}`}
                >
                  {defaultShelfId === group.id ? '取消默认' : '设为默认'}
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-500"
                >
                  删除分组
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        {group.books.length === 0 ? (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            暂无书籍
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {displayedBooks.map((book) => (
              <div
                key={book.id}
                className="relative group cursor-pointer"
                onClick={() => onBookClick(book)}
              >
                <div className={`aspect-[3/4] rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <img
                    src={book.cover}
                    alt={book.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 267"%3E%3Crect fill="%23${theme === 'dark' ? '444' : 'ddd'}" width="200" height="267"/%3E%3Ctext fill="%23${theme === 'dark' ? '666' : '999'}" font-family="sans-serif" font-size="14" x="100" y="133" text-anchor="middle"%3E{book.name.slice(0, 4)}%3C/text%3E%3C/svg%3E`
                    }}
                  />
                </div>
                <p className={`text-xs mt-2 truncate text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {book.name}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeBookFromShelf(book.id, group.id)
                  }}
                  className={`absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark' ? 'bg-black/50 text-white' : 'bg-white/80 text-gray-600'}`}
                >
                  ✕
                </button>
              </div>
            ))}
            {remainingCount > 0 && (
              <div
                className={`aspect-[3/4] rounded-lg flex items-center justify-center text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}
                onClick={() => setExpanded(true)}
              >
                +{remainingCount}
              </div>
            )}
          </div>
        )}

        {expanded && group.books.length > 9 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-3">
              {group.books.slice(9).map((book) => (
                <div
                  key={book.id}
                  className="relative group cursor-pointer"
                  onClick={() => onBookClick(book)}
                >
                  <div className={`aspect-[3/4] rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <img
                      src={book.cover}
                      alt={book.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className={`text-xs mt-2 truncate text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {book.name}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeBookFromShelf(book.id, group.id)
                    }}
                    className={`absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark' ? 'bg-black/50 text-white' : 'bg-white/80 text-gray-600'}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShelfGroup
