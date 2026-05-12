import React, { useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { workspacePathState, searchQueryState, searchResultsState } from '../state/atoms';
import './SearchPanel.css';

const SearchPanel: React.FC = () => {
  const workspacePath = useRecoilValue(workspacePathState);
  const [searchQuery, setSearchQuery] = useRecoilState(searchQueryState);
  const [searchResults, setSearchResults] = useRecoilState(searchResultsState);
  const [isSearching, setIsSearching] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const performSearch = async () => {
      if (!workspacePath || !searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const result = await window.electronAPI.searchFiles(
          workspacePath,
          searchQuery,
          { caseSensitive, regex: useRegex }
        );
        if (result.success && result.results) {
          setSearchResults(result.results);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    if (searchQuery) {
      timeoutId = setTimeout(performSearch, 300);
    } else {
      setSearchResults([]);
    }

    return () => clearTimeout(timeoutId);
  }, [searchQuery, workspacePath, caseSensitive, useRegex]);

  const openFile = async (filePath: string) => {
    const result = await window.electronAPI.readFile(filePath);
    if (result.success) {
      // 这里应该集成到标签系统中
      console.log('Opened file:', filePath);
    }
  };

  return (
    <div className="search-panel">
      <div className="search-header">
        <span>🔍 搜索</span>
      </div>
      
      <div className="search-input-container">
        <input
          type="text"
          className="search-input"
          placeholder="搜索文件内容..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="search-options">
          <button
            className={`option-btn ${caseSensitive ? 'active' : ''}`}
            onClick={() => setCaseSensitive(!caseSensitive)}
            title="大小写敏感"
          >
            Aa
          </button>
          <button
            className={`option-btn ${useRegex ? 'active' : ''}`}
            onClick={() => setUseRegex(!useRegex)}
            title="正则表达式"
          >
            .*
          </button>
        </div>
      </div>

      <div className="search-results">
        {isSearching ? (
          <div className="searching">搜索中...</div>
        ) : searchResults.length > 0 ? (
          searchResults.map((result, index) => (
            <div key={index} className="search-result-item">
              <div 
                className="result-file"
                onClick={() => openFile(result.path)}
              >
                📄 {result.name}
              </div>
              {result.matches.slice(0, 3).map((match, mIndex) => (
                <div key={mIndex} className="result-match">
                  <span className="line-num">{match.line}</span>
                  <span className="match-text">
                    {highlightMatch(match.content, searchQuery, caseSensitive)}
                  </span>
                </div>
              ))}
              {result.matches.length > 3 && (
                <div className="more-matches">
                  还有 {result.matches.length - 3} 处匹配...
                </div>
              )}
            </div>
          ))
        ) : searchQuery ? (
          <div className="no-results">未找到匹配项</div>
        ) : (
          <div className="search-hint">输入关键词开始搜索</div>
        )}
      </div>
    </div>
  );
};

const highlightMatch = (text: string, query: string, caseSensitive: boolean): React.ReactNode => {
  if (!query) return text;
  
  try {
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const parts = text.split(regex);
    const matches = text.match(regex);
    
    if (!matches) return text;
    
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {matches[index] && <mark>{matches[index]}</mark>}
      </React.Fragment>
    ));
  } catch {
    return text;
  }
};

export default SearchPanel;
