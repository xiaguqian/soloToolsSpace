import React from 'react';
import { useRecoilState } from 'recoil';
import { editorModeState, EditorMode, themeState, focusModeState, outlineVisibleState, sidebarVisibleState } from '../state/atoms';
import './Toolbar.css';

interface ToolbarProps {
  onFormat: (format: 'bold' | 'italic' | 'code' | 'strikethrough' | 'quote' | 'code-block') => void;
  onHeading: (level: 1 | 2 | 3 | 4 | 5 | 6) => void;
  onList: (type: 'bullet' | 'numbered' | 'task') => void;
  onInsertTable: () => void;
  onInsertLink: () => void;
  onInsertImage: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onOpenFile: () => void;
  onNewFile: () => void;
  onExport: (type: 'pdf' | 'html') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onFormat,
  onHeading,
  onList,
  onInsertTable,
  onInsertLink,
  onInsertImage,
  onSave,
  onSaveAs,
  onOpenFile,
  onNewFile,
  onExport
}) => {
  const [editorMode, setEditorMode] = useRecoilState(editorModeState);
  const [theme, setTheme] = useRecoilState(themeState);
  const [focusMode, setFocusMode] = useRecoilState(focusModeState);
  const [outlineVisible, setOutlineVisible] = useRecoilState(outlineVisibleState);
  const [sidebarVisible, setSidebarVisible] = useRecoilState(sidebarVisibleState);

  const modeOptions: { value: EditorMode; label: string }[] = [
    { value: 'wysiwyg', label: '即时渲染' },
    { value: 'source', label: '源码模式' },
    { value: 'split', label: '分屏预览' }
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={onNewFile} title="新建文件 (Ctrl+N)">
          <span className="icon">📄</span>
          <span className="btn-text">新建</span>
        </button>
        <button className="toolbar-btn" onClick={onOpenFile} title="打开文件 (Ctrl+O)">
          <span className="icon">📂</span>
          <span className="btn-text">打开</span>
        </button>
        <button className="toolbar-btn" onClick={onSave} title="保存 (Ctrl+S)">
          <span className="icon">💾</span>
          <span className="btn-text">保存</span>
        </button>
        <button className="toolbar-btn" onClick={onSaveAs} title="另存为 (Ctrl+Shift+S)">
          <span className="icon">📥</span>
          <span className="btn-text">另存为</span>
        </button>
      </div>

      <div className="toolbar-group">
        <div className="toolbar-dropdown">
          <button className="toolbar-btn" title="标题">
            <span className="icon">H</span>
          </button>
          <div className="dropdown-menu">
            {[1, 2, 3, 4, 5, 6].map(level => (
              <button 
                key={level} 
                className="dropdown-item"
                onClick={() => onHeading(level as 1 | 2 | 3 | 4 | 5 | 6)}
              >
                标题 {level}
              </button>
            ))}
          </div>
        </div>

        <button className="toolbar-btn" onClick={() => onFormat('bold')} title="粗体 (Ctrl+B)">
          <span className="icon" style={{ fontWeight: 'bold' }}>B</span>
        </button>
        <button className="toolbar-btn" onClick={() => onFormat('italic')} title="斜体 (Ctrl+I)">
          <span className="icon" style={{ fontStyle: 'italic' }}>I</span>
        </button>
        <button className="toolbar-btn" onClick={() => onFormat('strikethrough')} title="删除线">
          <span className="icon" style={{ textDecoration: 'line-through' }}>S</span>
        </button>
        <button className="toolbar-btn" onClick={() => onFormat('code')} title="行内代码">
          <span className="icon">{`</>`}</span>
        </button>
      </div>

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={() => onList('bullet')} title="无序列表">
          <span className="icon">•</span>
        </button>
        <button className="toolbar-btn" onClick={() => onList('numbered')} title="有序列表">
          <span className="icon">1.</span>
        </button>
        <button className="toolbar-btn" onClick={() => onList('task')} title="任务列表">
          <span className="icon">☐</span>
        </button>
        <button className="toolbar-btn" onClick={() => onFormat('quote')} title="引用">
          <span className="icon">❝</span>
        </button>
        <button className="toolbar-btn" onClick={() => onFormat('code-block')} title="代码块">
          <span className="icon">{`{ }`}</span>
        </button>
      </div>

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={onInsertTable} title="插入表格">
          <span className="icon">⊞</span>
        </button>
        <button className="toolbar-btn" onClick={onInsertLink} title="插入链接">
          <span className="icon">🔗</span>
        </button>
        <button className="toolbar-btn" onClick={onInsertImage} title="插入图片">
          <span className="icon">🖼️</span>
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <select 
          className="toolbar-select" 
          value={editorMode}
          onChange={(e) => setEditorMode(e.target.value as EditorMode)}
        >
          {modeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button 
          className={`toolbar-btn ${focusMode ? 'active' : ''}`} 
          onClick={() => setFocusMode(!focusMode)} 
          title="专注模式 (Ctrl+Shift+F)"
        >
          <span className="icon">🎯</span>
        </button>
        <button 
          className={`toolbar-btn ${outlineVisible ? 'active' : ''}`} 
          onClick={() => setOutlineVisible(!outlineVisible)} 
          title="大纲视图 (Ctrl+Shift+O)"
        >
          <span className="icon">📑</span>
        </button>
        <button 
          className={`toolbar-btn ${sidebarVisible ? 'active' : ''}`} 
          onClick={() => setSidebarVisible(!sidebarVisible)} 
          title="文件树"
        >
          <span className="icon">📁</span>
        </button>
        <button 
          className="toolbar-btn" 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
          title="切换主题"
        >
          <span className="icon">{theme === 'light' ? '🌙' : '☀️'}</span>
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <div className="toolbar-dropdown">
          <button className="toolbar-btn" title="导出">
            <span className="icon">📤</span>
          </button>
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => onExport('pdf')}>
              导出为 PDF
            </button>
            <button className="dropdown-item" onClick={() => onExport('html')}>
              导出为 HTML
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
