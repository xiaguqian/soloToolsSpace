import useAppStore from '../../store/appStore'

const Navigation = () => {
  const { theme, currentPage, setCurrentPage, searchQuery, setSearchQuery } = useAppStore()

  const navItems = [
    { id: 'shelf', label: '书架', icon: '📚' },
    { id: 'store', label: '书城', icon: '🏪' },
    { id: 'parser', label: 'AI解析', icon: '🤖' },
  ]

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 ${theme === 'dark' ? 'bg-night border-t border-gray-700' : 'bg-white border-t border-gray-200'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${currentPage === item.id ? (theme === 'dark' ? 'text-blue-400' : 'text-blue-500') : (theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700')}`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
