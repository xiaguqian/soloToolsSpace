import React from 'react';
import { useRecoilState } from 'recoil';
import { tabsState, activeTabIdState } from '../state/atoms';
import './TabBar.css';

const TabBar: React.FC = () => {
  const [tabs, setTabs] = useRecoilState(tabsState);
  const [activeTabId, setActiveTabId] = useRecoilState(activeTabIdState);

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.isModified) {
      if (!confirm(`"${tab.fileName}" 有未保存的更改，确定关闭吗？`)) {
        return;
      }
    }
    
    if (tabs.length === 1) {
      setTabs([{
        id: `tab-${Date.now()}`,
        filePath: null,
        fileName: 'untitled.md',
        content: '',
        isModified: false,
        cursorPosition: { line: 0, column: 0 }
      }]);
      setActiveTabId(`tab-${Date.now()}`);
    } else {
      const newTabs = tabs.filter(t => t.id !== tabId);
      setTabs(newTabs);
      if (tabId === activeTabId) {
        const currentIndex = tabs.findIndex(t => t.id === tabId);
        const newActiveIndex = Math.max(0, currentIndex - 1);
        setActiveTabId(newTabs[newActiveIndex].id);
      }
    }
  };

  const createNewTab = () => {
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

  return (
    <div className="tab-bar">
      <div className="tabs-container">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''} ${tab.isModified ? 'modified' : ''}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span className="tab-title">
              {tab.fileName}
              {tab.isModified && <span className="modified-dot">•</span>}
            </span>
            <button 
              className="tab-close"
              onClick={(e) => closeTab(tab.id, e)}
              title="关闭"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button className="new-tab-btn" onClick={createNewTab} title="新建标签页">
        +
      </button>
    </div>
  );
};

export default TabBar;
