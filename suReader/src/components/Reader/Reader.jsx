import { useState, useEffect, useRef } from 'react'
import useAppStore from '../../store/appStore'

const Reader = ({ book, content, onClose }) => {
  const { theme, fontSize, backgroundColor, backgroundPattern, setShowReadingSettings } = useAppStore()
  const [currentContent, setCurrentContent] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [progress, setProgress] = useState(0)
  const contentRef = useRef(null)

  useEffect(() => {
    if (content) {
      setCurrentContent(content)
    }
  }, [content])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      } else if (e.key === 'ArrowLeft') {
        setProgress(Math.max(0, progress - 10))
      } else if (e.key === 'ArrowRight') {
        setProgress(Math.min(100, progress + 10))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [progress, onClose])

  const handleTouchStart = useRef(null)
  const handleTouchEnd = useRef(null)

  const handleTouchStart = (e) => {
    handleTouchStart.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    handleTouchEnd.current = e.changedTouches[0].clientX
    const diff = handleTouchEnd.current - handleTouchStart.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setProgress(Math.max(0, progress - 10))
      } else {
        setProgress(Math.min(100, progress + 10))
      }
    }
  }

  const getBackgroundStyle = () => {
    const styles = { backgroundColor }
    if (backgroundPattern === 'paper') {
      styles.backgroundImage = "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"%3E%3Cpath fill=\"%23d4c4a8\" fill-opacity=\"0.3\" d=\"M0 0h100v100H0z\"/%3E%3C/svg%3E')"
    } else if (backgroundPattern === 'grid') {
      styles.backgroundImage = "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\"%3E%3Cpath fill=\"%23c4b896\" fill-opacity=\"0.2\" d=\"M0 0h20v20H0z\"/%3E%3C/svg%3E')"
    }
    return styles
  }

  const getTextColor = () => {
    if (theme === 'dark') return '#e0e0e0'
    return '#333'
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-300 ${theme === 'dark' ? 'bg-night' : ''}`}
      style={getBackgroundStyle()}
      onClick={() => setShowMenu(!showMenu)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full max-w-3xl h-full flex flex-col p-8">
        {showMenu && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose?.()
                  }}
                  className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-night-light text-white' : 'bg-white text-gray-800'} shadow-lg`}
                >
                  返回
                </button>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {book?.name || '阅读中'}
                </h2>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowReadingSettings(true)
                }}
                className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-night-light text-white' : 'bg-white text-gray-800'} shadow-lg`}
              >
                设置
              </button>
            </div>

            <div className="mb-4">
              <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-night-light' : 'bg-gray-200'}`}>
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                  onClick={(e) => {
                    e.stopPropagation()
                    const rect = e.currentTarget.parentElement.getBoundingClientRect()
                    const x = e.clientX - rect.left
                    setProgress((x / rect.width) * 100)
                  }}
                />
              </div>
              <p className={`text-sm mt-1 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {Math.round(progress)}%
              </p>
            </div>
          </>
        )}

        <div
          ref={contentRef}
          className="flex-1 overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="prose max-w-none leading-loose"
            style={{ fontSize, color: getTextColor() }}
          >
            {currentContent.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 indent-8">
                {paragraph || '\u00A0'}
              </p>
            ))}
          </div>
        </div>

        {showMenu && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setProgress(Math.max(0, progress - 10))
              }}
              className={`px-6 py-2 rounded-lg ${theme === 'dark' ? 'bg-night-light text-white' : 'bg-white text-gray-800'} shadow-lg`}
            >
              上一页
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setProgress(Math.min(100, progress + 10))
              }}
              className={`px-6 py-2 rounded-lg ${theme === 'dark' ? 'bg-night-light text-white' : 'bg-white text-gray-800'} shadow-lg`}
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reader
