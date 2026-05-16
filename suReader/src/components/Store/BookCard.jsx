import useAppStore from '../../store/appStore'
import { truncateText } from '../../utils/format'

const BookCard = ({ book, onClick }) => {
  const { theme } = useAppStore()

  return (
    <div
      className={`rounded-xl overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105 ${theme === 'dark' ? 'bg-night-light' : 'bg-white'}`}
      onClick={() => onClick(book)}
    >
      <div className={`aspect-[3/4] ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <img
          src={book.cover}
          alt={book.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 267"%3E%3Crect fill="%23${theme === 'dark' ? '444' : 'ddd'}" width="200" height="267"/%3E%3Ctext fill="%23${theme === 'dark' ? '666' : '999'}" font-family="sans-serif" font-size="14" x="100" y="133" text-anchor="middle"%3E${book.name.slice(0, 4)}%3C/text%3E%3C/svg%3E`
          }}
        />
      </div>
      <div className="p-3">
        <h3 className={`font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {book.name}
        </h3>
        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {book.author}
        </p>
        <p className={`text-xs mt-2 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {truncateText(book.description, 60)}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs px-2 py-0.5 rounded ${book.isCompleted ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
            {book.isCompleted ? '已完结' : '连载中'}
          </span>
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            {book.updateTime}
          </span>
        </div>
      </div>
    </div>
  )
}

export default BookCard
