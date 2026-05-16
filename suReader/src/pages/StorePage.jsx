import { useState, useEffect } from 'react'
import useAppStore from '../store/appStore'
import BookCard from '../components/Store/BookCard'
import BookDetail from '../components/Store/BookDetail'
import { getBooks } from '../services/api'

const StorePage = ({ onReadBook }) => {
  const { theme, searchQuery } = useAppStore()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState(null)

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true)
      try {
        const result = await getBooks()
        if (result.success) {
          setBooks(result.data)
        }
      } catch (error) {
        console.error('获取书籍列表失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [])

  const filteredBooks = books.filter((book) =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRead = (book) => {
    setSelectedBook(null)
    onReadBook(book)
  }

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-night' : 'bg-gray-50'}`}>
      <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        云书城
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className={`w-10 h-10 border-4 rounded-full ${theme === 'dark' ? 'border-blue-500' : 'border-gray-300'} border-t-transparent animate-spin`} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} onClick={setSelectedBook} />
          ))}
        </div>
      )}

      {selectedBook && (
        <BookDetail
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onRead={handleRead}
        />
      )}
    </div>
  )
}

export default StorePage
