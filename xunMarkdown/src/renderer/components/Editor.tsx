import React, { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { 
  tabsState, 
  activeTabIdState, 
  editorModeState, 
  focusModeState,
  themeState
} from '../state/atoms';
import { renderMarkdown, insertImage } from '../utils/markdownRenderer';
import './Editor.css';

interface EditorProps {
  onInsertLink: (url: string, altText?: string) => void;
  onInsertImage: (imgPath: string, altText?: string) => void;
}

const Editor: React.FC<EditorProps> = ({ onInsertLink: _onInsertLink, onInsertImage: onInsertImageProp }) => {
  const [tabs, setTabs] = useRecoilState(tabsState);
  const activeTabId = useRecoilValue(activeTabIdState);
  const editorMode = useRecoilValue(editorModeState);
  const focusMode = useRecoilValue(focusModeState);
  const theme = useRecoilValue(themeState);
  const [renderedHtml, setRenderedHtml] = useState('');
  const sourceEditorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId);

  useEffect(() => {
    if (activeTab) {
      renderMarkdown(activeTab.content).then(setRenderedHtml);
    }
  }, [activeTab]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, content: newContent, isModified: true }
        : tab
    ));
    renderMarkdown(newContent).then(setRenderedHtml);
  };

  const updateSelection = (newText: string, newStart: number, newEnd: number) => {
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, content: newText, isModified: true }
        : tab
    ));
    renderMarkdown(newText).then(setRenderedHtml);
    
    setTimeout(() => {
      if (sourceEditorRef.current) {
        sourceEditorRef.current.focus();
        sourceEditorRef.current.setSelectionRange(newStart, newEnd);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const { selectionStart, selectionEnd } = textarea;
      const newText = activeTab!.content.slice(0, selectionStart) + '  ' + activeTab!.content.slice(selectionEnd);
      
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, content: newText, isModified: true }
          : tab
      ));
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(selectionStart + 2, selectionStart + 2);
      }, 0);
    }
  };

  const getDirname = (filePath: string): string => {
    const separator = filePath.includes('/') ? '/' : '\\';
    const parts = filePath.split(separator);
    parts.pop();
    return parts.join(separator);
  };

  const joinPath = (...parts: string[]): string => {
    const separator = parts[0]?.includes('/') ? '/' : '\\';
    return parts.filter(Boolean).join(separator).replace(/[\\/]+/g, separator);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file && activeTab?.filePath) {
          const reader = new FileReader();
          reader.onload = async () => {
            const dataUrl = reader.result as string;
            
            const dirPath = getDirname(activeTab.filePath!);
            const attachmentsDir = joinPath(dirPath, 'attachments');
            
            await window.electronAPI.createDirectory(attachmentsDir);
            
            const fileName = `image-${Date.now()}.png`;
            const savePath = joinPath(attachmentsDir, fileName);
            const relativePath = `./attachments/${fileName}`;
            
            await window.electronAPI.saveImage(dataUrl, savePath);
            
            if (sourceEditorRef.current) {
              const { selectionStart, selectionEnd } = sourceEditorRef.current;
              const { newText, newStart, newEnd } = insertImage(
                activeTab.content, 
                selectionStart, 
                selectionEnd, 
                relativePath, 
                '粘贴的图片'
              );
              updateSelection(newText, newStart, newEnd);
              onInsertImageProp(relativePath, '粘贴的图片');
            }
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (previewRef.current && editorMode === 'split') {
      const scrollPercentage = e.currentTarget.scrollTop / (e.currentTarget.scrollHeight - e.currentTarget.clientHeight);
      previewRef.current.scrollTop = scrollPercentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
    }
  };

  return (
    <div 
      className={`editor-container ${focusMode ? 'focus-mode' : ''}`}
      data-theme={theme}
    >
      {editorMode === 'wysiwyg' && (
        <div className="editor-panel wysiwyg-panel">
          <textarea
            ref={sourceEditorRef}
            className="source-editor wysiwyg-editor"
            value={activeTab?.content || ''}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onScroll={handleScroll}
            placeholder="开始输入 Markdown 内容..."
            spellCheck={false}
            style={{ color: 'transparent', caretColor: theme === 'dark' ? '#fff' : '#000' }}
          />
          <div 
            className="markdown-preview wysiwyg-preview"
            ref={previewRef}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      )}

      {editorMode === 'source' && (
        <div className="editor-panel source-panel">
          <textarea
            ref={sourceEditorRef}
            className="source-editor"
            value={activeTab?.content || ''}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onScroll={handleScroll}
            placeholder="开始输入 Markdown 内容..."
            spellCheck={false}
          />
        </div>
      )}

      {editorMode === 'split' && (
        <>
          <div className="editor-panel source-panel split-panel">
            <textarea
              ref={sourceEditorRef}
              className="source-editor"
              value={activeTab?.content || ''}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onScroll={handleScroll}
              placeholder="开始输入 Markdown 内容..."
              spellCheck={false}
            />
          </div>
          <div className="splitter" />
          <div 
            className="editor-panel preview-panel split-panel"
            ref={previewRef}
          >
            <div 
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Editor;
