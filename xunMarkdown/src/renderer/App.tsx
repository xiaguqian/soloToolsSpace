import { useEffect, useState, useRef } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import FileTree from './components/FileTree';
import TabBar from './components/TabBar';
import Outline from './components/Outline';
import SearchPanel from './components/SearchPanel';
import AIAssistant from './components/AIAssistant';
import PaymentDialog from './components/PaymentDialog';
import './App.css';
import { 
  tabsState, 
  activeTabIdState,
  themeState,
  sidebarVisibleState,
  outlineVisibleState,
  shortcutsState
} from './state/atoms';
import { renderMarkdown } from './utils/markdownRenderer';

const getBasename = (filePath: string): string => {
  const separator = filePath.includes('/') ? '/' : '\\';
  const parts = filePath.split(separator);
  return parts[parts.length - 1] || '';
};

function App() {
  const [tabs, setTabs] = useRecoilState(tabsState);
  const [activeTabId, setActiveTabId] = useRecoilState(activeTabIdState);
  const [theme, setTheme] = useRecoilState(themeState);
  const [sidebarVisible, setSidebarVisible] = useRecoilState(sidebarVisibleState);
  const [outlineVisible, setOutlineVisible] = useRecoilState(outlineVisibleState);
  const setShortcuts = useSetRecoilState(shortcutsState);
  
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({ feature: '', message: '' });
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeTab = tabs.find(t => t.id === activeTabId);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await window.electronAPI.getSettings();
      if (settings.theme) {
        setTheme(settings.theme as any);
      }
      if (settings.shortcuts) {
        setShortcuts(settings.shortcuts);
      }
    };
    loadSettings();
  }, [setTheme, setShortcuts]);

  useEffect(() => {
    const cleanup = window.electronAPI.onFileOpened(async (filePath) => {
      const result = await window.electronAPI.readFile(filePath);
      if (result.success) {
        const existingTab = tabs.find(t => t.filePath === filePath);
        if (existingTab) {
          setActiveTabId(existingTab.id);
        } else {
          const newTab = {
            id: `tab-${Date.now()}`,
            filePath,
            fileName: getBasename(filePath),
            content: result.content || '',
            isModified: false,
            cursorPosition: { line: 0, column: 0 }
          };
          setTabs(prev => [...prev, newTab]);
          setActiveTabId(newTab.id);
        }
      }
    });

    return cleanup;
  }, [tabs, setTabs, setActiveTabId]);

  useEffect(() => {
    const handleShowPayment = (e: Event) => {
      const customEvent = e as CustomEvent;
      setPaymentInfo({
        feature: customEvent.detail.feature || '',
        message: customEvent.detail.message || '此功能需要付费订阅'
      });
      setShowPaymentDialog(true);
    };

    window.addEventListener('show-payment-dialog', handleShowPayment);
    return () => window.removeEventListener('show-payment-dialog', handleShowPayment);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      if (isCtrlOrCmd && e.key === 's' && !isShift) {
        e.preventDefault();
        handleSave();
      } else if (isCtrlOrCmd && isShift && e.key === 's') {
        e.preventDefault();
        handleSaveAs();
      } else if (isCtrlOrCmd && e.key === 'o') {
        e.preventDefault();
        handleOpenFile();
      } else if (isCtrlOrCmd && e.key === 'n') {
        e.preventDefault();
        handleNewFile();
      } else if (isCtrlOrCmd && e.key === 'b') {
        e.preventDefault();
        if (document.activeElement?.tagName === 'TEXTAREA') {
          applyFormat('bold');
        } else {
          setSidebarVisible(!sidebarVisible);
        }
      } else if (isCtrlOrCmd && e.key === 'i') {
        e.preventDefault();
        applyFormat('italic');
      } else if (isCtrlOrCmd && isShift && e.key === 'f') {
        e.preventDefault();
        handleToggleFocusMode();
      } else if (isCtrlOrCmd && isShift && e.key === 'o') {
        e.preventDefault();
        setOutlineVisible(!outlineVisible);
      } else if (e.key === 'Escape') {
        setShowAIAssistant(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, sidebarVisible, outlineVisible, setSidebarVisible, setOutlineVisible]);

  useEffect(() => {
    if (activeTab?.isModified && activeTab?.filePath) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave();
      }, 2000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [activeTab?.content, activeTab?.filePath]);

  const autoSave = async () => {
    if (activeTab?.filePath && activeTab?.isModified) {
      await window.electronAPI.writeFile(activeTab.filePath, activeTab.content);
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId ? { ...tab, isModified: false } : tab
      ));
    }
  };

  const handleNewFile = () => {
    const newTab = {
      id: `tab-${Date.now()}`,
      filePath: null,
      fileName: 'untitled.md',
      content: '',
      isModified: false,
      cursorPosition: { line: 0, column: 0 }
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleOpenFile = async () => {
    const result = await window.electronAPI.openFileDialog();
    if (result.success && result.filePath) {
      const fileResult = await window.electronAPI.readFile(result.filePath);
      if (fileResult.success) {
        const existingTab = tabs.find(t => t.filePath === result.filePath);
        if (existingTab) {
          setActiveTabId(existingTab.id);
        } else {
          const newTab = {
            id: `tab-${Date.now()}`,
            filePath: result.filePath,
            fileName: getBasename(result.filePath),
            content: fileResult.content || '',
            isModified: false,
            cursorPosition: { line: 0, column: 0 }
          };
          setTabs(prev => [...prev, newTab]);
          setActiveTabId(newTab.id);
        }
      }
    }
  };

  const handleSave = async () => {
    if (!activeTab) return;

    if (!activeTab.filePath) {
      await handleSaveAs();
    } else {
      await window.electronAPI.writeFile(activeTab.filePath, activeTab.content);
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId ? { ...tab, isModified: false } : tab
      ));
    }
  };

  const handleSaveAs = async () => {
    if (!activeTab) return;

    const result = await window.electronAPI.saveFileDialog(activeTab.fileName);
    if (result.success && result.filePath) {
      const savedFilePath = result.filePath;
      await window.electronAPI.writeFile(savedFilePath, activeTab.content);
      const newFileName = getBasename(savedFilePath);
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, filePath: savedFilePath, fileName: newFileName, isModified: false }
          : tab
      ));
    }
  };

  const applyFormat = (format: 'bold' | 'italic' | 'code' | 'strikethrough' | 'quote' | 'code-block') => {
    const textarea = document.querySelector('.source-editor') as HTMLTextAreaElement;
    if (!textarea || !activeTab) return;

    const { selectionStart, selectionEnd } = textarea;
    const selectedText = activeTab.content.slice(selectionStart, selectionEnd);
    
    let prefix = '';
    let suffix = '';
    let insertText = selectedText || '文本';
    
    switch (format) {
      case 'bold':
        prefix = '**';
        suffix = '**';
        insertText = selectedText || '粗体文本';
        break;
      case 'italic':
        prefix = '*';
        suffix = '*';
        insertText = selectedText || '斜体文本';
        break;
      case 'code':
        prefix = '`';
        suffix = '`';
        insertText = selectedText || '代码';
        break;
      case 'strikethrough':
        prefix = '~~';
        suffix = '~~';
        insertText = selectedText || '删除线';
        break;
      case 'quote':
        prefix = '> ';
        suffix = '';
        insertText = selectedText || '引用文本';
        break;
      case 'code-block':
        prefix = '\n```\n';
        suffix = '\n```\n';
        insertText = selectedText || '代码块';
        break;
    }

    const newText = activeTab.content.slice(0, selectionStart) + prefix + insertText + suffix + activeTab.content.slice(selectionEnd);
    const newStart = selectionStart + prefix.length;
    const newEnd = selectionStart + prefix.length + insertText.length;

    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId ? { ...tab, content: newText, isModified: true } : tab
    ));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  const applyHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    const textarea = document.querySelector('.source-editor') as HTMLTextAreaElement;
    if (!textarea || !activeTab) return;

    const { selectionStart } = textarea;
    const beforeCursor = activeTab.content.slice(0, selectionStart);
    const lineStartIndex = beforeCursor.lastIndexOf('\n') + 1;
    const currentLine = activeTab.content.slice(lineStartIndex, selectionStart);
    
    const hashes = '#'.repeat(level) + ' ';
    const existingHeadingMatch = currentLine.match(/^#{1,6}\s/);
    
    let newText: string;
    let newStart: number;

    if (existingHeadingMatch) {
      newText = activeTab.content.slice(0, lineStartIndex) + hashes + currentLine.slice(existingHeadingMatch[0].length) + activeTab.content.slice(selectionStart);
      newStart = lineStartIndex + hashes.length;
    } else {
      newText = activeTab.content.slice(0, lineStartIndex) + hashes + currentLine + activeTab.content.slice(selectionStart);
      newStart = lineStartIndex + hashes.length;
    }

    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId ? { ...tab, content: newText, isModified: true } : tab
    ));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newStart, newStart);
    }, 0);
  };

  const applyList = (type: 'bullet' | 'numbered' | 'task') => {
    const textarea = document.querySelector('.source-editor') as HTMLTextAreaElement;
    if (!textarea || !activeTab) return;

    const { selectionStart } = textarea;
    const beforeCursor = activeTab.content.slice(0, selectionStart);
    const lineStartIndex = beforeCursor.lastIndexOf('\n') + 1;
    const currentLine = activeTab.content.slice(lineStartIndex, selectionStart);
    
    let prefix: string;
    switch (type) {
      case 'bullet':
        prefix = '- ';
        break;
      case 'numbered':
        prefix = '1. ';
        break;
      case 'task':
        prefix = '- [ ] ';
        break;
    }

    const newText = activeTab.content.slice(0, lineStartIndex) + prefix + currentLine + activeTab.content.slice(selectionStart);
    const newStart = lineStartIndex + prefix.length;

    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId ? { ...tab, content: newText, isModified: true } : tab
    ));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newStart, newStart);
    }, 0);
  };

  const insertTable = () => {
    const textarea = document.querySelector('.source-editor') as HTMLTextAreaElement;
    if (!textarea || !activeTab) return;

    const { selectionStart } = textarea;
    const tableText = '\n| 头部1 | 头部2 | 头部3 |\n| --- | --- | --- |\n| 内容1 | 内容2 | 内容3 |\n';
    const newText = activeTab.content.slice(0, selectionStart) + tableText + activeTab.content.slice(selectionStart);

    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId ? { ...tab, content: newText, isModified: true } : tab
    ));
  };

  const insertLink = () => {
    const url = prompt('请输入链接地址:', 'https://');
    if (url) {
      const textarea = document.querySelector('.source-editor') as HTMLTextAreaElement;
      if (!textarea || !activeTab) return;

      const { selectionStart, selectionEnd } = textarea;
      const selectedText = activeTab.content.slice(selectionStart, selectionEnd);
      const linkText = selectedText || '链接文字';
      const linkMarkdown = `[${linkText}](${url})`;
      
      const newText = activeTab.content.slice(0, selectionStart) + linkMarkdown + activeTab.content.slice(selectionEnd);

      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId ? { ...tab, content: newText, isModified: true } : tab
      ));
    }
  };

  const insertImage = () => {
    const imagePath = prompt('请输入图片路径或URL:', '');
    if (imagePath) {
      const textarea = document.querySelector('.source-editor') as HTMLTextAreaElement;
      if (!textarea || !activeTab) return;

      const { selectionStart, selectionEnd } = textarea;
      const selectedText = activeTab.content.slice(selectionStart, selectionEnd);
      const imageMarkdown = `![${selectedText || '图片'}](${imagePath})`;
      
      const newText = activeTab.content.slice(0, selectionStart) + imageMarkdown + activeTab.content.slice(selectionEnd);

      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId ? { ...tab, content: newText, isModified: true } : tab
      ));
    }
  };

  const handleToggleFocusMode = () => {
    const event = new CustomEvent('toggle-focus-mode');
    window.dispatchEvent(event);
  };

  const handleExport = async (type: 'pdf' | 'html') => {
    if (!activeTab) return;

    if (type === 'pdf') {
      const html = await renderMarkdown(activeTab.content);
      await window.electronAPI.exportPdf(html);
    } else if (type === 'html') {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${activeTab.fileName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 48px 24px; line-height: 1.8; }
    h1 { border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding: 0.5em 1em; color: #666; background: #f9f9f9; }
    pre { background: #f5f5f5; padding: 1em; overflow-x: auto; border-radius: 4px; }
    code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 0.5em 1em; }
    th { background: #f5f5f5; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  ${await renderMarkdown(activeTab.content)}
</body>
</html>
`;
      await window.electronAPI.exportHtml(htmlContent);
    }
  };

  return (
    <div className="app" data-theme={theme}>
      <Toolbar
        onFormat={applyFormat}
        onHeading={applyHeading}
        onList={applyList}
        onInsertTable={insertTable}
        onInsertLink={insertLink}
        onInsertImage={insertImage}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onOpenFile={handleOpenFile}
        onNewFile={handleNewFile}
        onExport={handleExport}
      />

      <div className="main-content">
        {sidebarVisible && (
          <div className="sidebar">
            <FileTree />
            <SearchPanel />
          </div>
        )}

        <div className="editor-area">
          <TabBar />
          <div className="editor-wrapper">
            <Editor
              onInsertLink={(url, altText) => console.log('Link inserted:', url, altText)}
              onInsertImage={(path, altText) => console.log('Image inserted:', path, altText)}
            />
            
            {outlineVisible && <Outline />}
            
            {showAIAssistant && (
              <AIAssistant onClose={() => setShowAIAssistant(false)} />
            )}
          </div>
        </div>
      </div>

      <button
        className="ai-fab"
        onClick={() => setShowAIAssistant(!showAIAssistant)}
        title="AI 助手"
      >
        🤖
      </button>

      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        feature={paymentInfo.feature}
        message={paymentInfo.message}
      />
    </div>
  );
}

export default App;
