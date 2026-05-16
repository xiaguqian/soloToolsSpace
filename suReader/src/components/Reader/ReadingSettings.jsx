import { useState } from 'react'
import useAppStore from '../../store/appStore'

const ReadingSettings = ({ onClose }) => {
  const { theme, fontSize, backgroundColor, backgroundPattern, setTheme, setFontSize, setBackgroundColor, setBackgroundPattern } = useAppStore()
  const [localBgColor, setLocalBgColor] = useState(backgroundColor)

  const themes = [
    { id: 'light', name: '日间模式', color: '#FFF8DC' },
    { id: 'dark', name: '夜间模式', color: '#1a1a2e' },
  ]

  const patterns = [
    { id: 'none', name: '无' },
    { id: 'paper', name: '纸张纹理' },
    { id: 'grid', name: '网格' },
  ]

  const presetColors = [
    '#FFF8DC', '#F4E4BA', '#E8E4C9', '#FDF6E3',
    '#1a1a2e', '#16213e', '#0f0f1a', '#1a1a3e',
    '#F0E6D2', '#FAF0E6', '#FFF5EE', '#FDF5E6',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className={`w-full max-w-md p-6 rounded-xl shadow-2xl ${theme === 'dark' ? 'bg-night-light text-white' : 'bg-white text-gray-800'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">阅读设置</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">阅读模式</label>
            <div className="flex gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all ${theme === t.id ? 'ring-2 ring-blue-500' : ''}`}
                  style={{ backgroundColor: t.color }}
                >
                  <span className={theme === 'dark' && t.id === 'light' ? 'text-gray-800' : ''}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">字体大小: {fontSize}px</label>
            <input
              type="range"
              min="12"
              max="32"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ backgroundColor: theme === 'dark' ? '#333' : '#ddd' }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>12px</span>
              <span>32px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">背景颜色</label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setBackgroundColor(color)
                    setLocalBgColor(color)
                  }}
                  className={`w-8 h-8 rounded-full transition-all ${backgroundColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={localBgColor}
              onChange={(e) => {
                setBackgroundColor(e.target.value)
                setLocalBgColor(e.target.value)
              }}
              className="mt-3 w-full h-10 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">背景图案</label>
            <div className="flex gap-3">
              {patterns.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setBackgroundPattern(p.id)}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all ${backgroundPattern === p.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          确定
        </button>
      </div>
    </div>
  )
}

export default ReadingSettings
