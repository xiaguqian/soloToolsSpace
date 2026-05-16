import useAppStore from '../../store/appStore'

const ReadingHistory = ({ onBookClick }) => {
  const { theme, readingHistory, removeFromReadingHistory, clearReadingHistory } = useAppStore()

  return (
    <div className={`rounded-xl overflow-hidden shadow-lg ${theme === 'dark' ? 'bg-night-light' : 'bg-white'}`}>
      <div className="flex items-center justify-between p-4">
        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          阅读历史
        </span>
        {readingHistory.length > 0 && (
          <button
            onClick={clearReadingHistory}
            className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            清空
          </button>
        )}
      </div>

      <div className="px-4 pb-4">
        {readingHistory.length === 0 ? (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            暂无阅读记录
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {readingHistory.slice(0, 9).map((book) => (
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
                    removeFromReadingHistory(book.id)
                  }}
                  className={`absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark' ? 'bg-black/50 text-white' : 'bg-white/80 text-gray-600'}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReadingHistory
