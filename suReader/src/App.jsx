import { useState, useEffect } from 'react'
import useAppStore from './store/appStore'
import Navigation from './components/Layout/Navigation'
import ShelfPage from './pages/ShelfPage'
import StorePage from './pages/StorePage'
import ParserPage from './pages/ParserPage'
import Reader from './components/Reader/Reader'
import ReadingSettings from './components/Reader/ReadingSettings'
import { readFile } from './utils/storage'

function App() {
  const { theme, currentPage, setCurrentPage, showReadingSettings, setShowReadingSettings, addBookToShelf, addToReadingHistory } = useAppStore()
  const [readingBook, setReadingBook] = useState(null)
  const [readingContent, setReadingContent] = useState('')

  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'dark' : ''
  }, [theme])

  const handleBookClick = async (book) => {
    addToReadingHistory(book)
    if (book.filePath) {
      setReadingContent('正在加载...')
      try {
        const result = await readFile(book.filePath)
        if (result.success) {
          setReadingContent(result.content)
        } else {
          setReadingContent('读取文件失败: ' + (result.error || '未知错误'))
        }
      } catch (error) {
        setReadingContent('读取文件失败: ' + error.message)
      }
    } else {
      setReadingContent(`    ${book.name}\n\n    ${book.author}\n\n    ${book.description || '暂无简介'}\n\n    章节内容预览...`)
    }
    setReadingBook(book)
  }

  const handleAddBook = (book) => {
    addBookToShelf(book)
  }

  const handleParseSuccess = (data) => {
    if (data.type === 'book') {
      handleBookClick(data.book)
    } else if (data.type === 'store') {
      setCurrentPage('store')
    } else if (data.type === 'chapter') {
      setReadingBook({ name: data.title })
      setReadingContent(data.content)
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'shelf':
        return <ShelfPage onBookClick={handleBookClick} onAddBook={handleAddBook} />
      case 'store':
        return <StorePage onReadBook={handleBookClick} />
      case 'parser':
        return <ParserPage onParseSuccess={handleParseSuccess} />
      default:
        return <ShelfPage onBookClick={handleBookClick} onAddBook={handleAddBook} />
    }
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-night' : 'bg-gray-50'}`}>
      {renderPage()}
      <Navigation />
      
      {readingBook && (
        <Reader
          book={readingBook}
          content={readingContent}
          onClose={() => setReadingBook(null)}
        />
      )}

      {showReadingSettings && (
        <ReadingSettings onClose={() => setShowReadingSettings(false)} />
      )}
    </div>
  )
}

export default App
