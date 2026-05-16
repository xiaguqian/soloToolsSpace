import { useState } from 'react'
import useAppStore from '../../store/appStore'
import { parseUrl } from '../../services/api'

const UrlParser = ({ onParseSuccess }) => {
  const { theme } = useAppStore()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleParse = async () => {
    if (!url.trim()) {
      setError('请输入链接')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await parseUrl(url)
      if (result.success) {
        onParseSuccess(result.data)
        setUrl('')
      } else {
        setError(result.message || '解析失败')
      }
    } catch (err) {
      setError('解析失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`rounded-xl p-6 shadow-lg ${theme === 'dark' ? 'bg-night-light' : 'bg-white'}`}>
      <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        AI智能解析
      </h3>
      <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        输入在线小说链接，AI会自动解析并跳转
      </p>
      <div className="flex gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleParse()}
          placeholder="请输入小说链接..."
          className={`flex-1 px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-night border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        <button
          onClick={handleParse}
          disabled={loading}
          className={`px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? '解析中...' : '解析'}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-red-500 text-sm">{error}</p>
      )}
    </div>
  )
}

export default UrlParser
