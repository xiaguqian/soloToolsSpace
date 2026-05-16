import useAppStore from '../store/appStore'
import UrlParser from '../components/Parser/UrlParser'

const ParserPage = ({ onParseSuccess }) => {
  const { theme } = useAppStore()

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-night' : 'bg-gray-50'}`}>
      <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        AI智能解析
      </h1>

      <div className="max-w-2xl mx-auto">
        <UrlParser onParseSuccess={onParseSuccess} />
        
        <div className={`mt-8 p-6 rounded-xl ${theme === 'dark' ? 'bg-night-light' : 'bg-white'}`}>
          <h3 className={`font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            使用说明
          </h3>
          <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>• 输入在线小说网站的链接</li>
            <li>• AI会自动识别链接类型（书籍、书城、章节）</li>
            <li>• 根据识别结果跳转到对应页面</li>
            <li>• 支持大多数主流小说网站</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ParserPage
