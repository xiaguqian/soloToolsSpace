import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { tabsState, activeTabIdState } from '../state/atoms';
import { extractOutline } from '../utils/markdownRenderer';
import './Outline.css';

const Outline: React.FC = () => {
  const tabs = useRecoilValue(tabsState);
  const activeTabId = useRecoilValue(activeTabIdState);
  const [outline, setOutline] = useState<Array<{ level: number; text: string; id: string }>>([]);

  const activeTab = tabs.find(t => t.id === activeTabId);

  useEffect(() => {
    if (activeTab) {
      setOutline(extractOutline(activeTab.content));
    }
  }, [activeTab]);

  const scrollToHeading = (id: string) => {
    const previewElement = document.querySelector('.markdown-preview');
    if (previewElement) {
      const heading = previewElement.querySelector(`[id="${id}"], h1, h2, h3, h4, h5, h6`);
      if (heading) {
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  if (outline.length === 0) {
    return (
      <div className="outline empty">
        <p>无大纲</p>
      </div>
    );
  }

  return (
    <div className="outline">
      <div className="outline-header">
        <span>📑 大纲</span>
      </div>
      <div className="outline-content">
        {outline.map((item, index) => (
          <div 
            key={index}
            className={`outline-item level-${item.level}`}
            onClick={() => scrollToHeading(item.id)}
            style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
          >
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Outline;
