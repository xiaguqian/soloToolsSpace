import React, { useState, useMemo } from 'react';
import useStore from '../store/useStore';

const ConversationList = ({ onSelect, onSearch }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const {
    conversations, currentConversation,
    friends, groups, user
  } = useStore();

  const filteredConversations = useMemo(() => {
    if (!searchKeyword) return conversations;
    
    return conversations.filter(conv => {
      const target = getTargetInfo(conv);
      return target?.name?.toLowerCase().includes(searchKeyword.toLowerCase());
    });
  }, [conversations, searchKeyword, friends, groups, user]);

  const getTargetInfo = (conv) => {
    if (conv.conversationType === 1) {
      const friend = friends.find(f => f.friendId === conv.targetId);
      return {
        id: conv.targetId,
        name: friend?.remark || friend?.nickname || friend?.username || '未知用户',
        avatar: friend?.avatar,
        isOnline: friend?.isOnline
      };
    } else {
      const group = groups.find(g => g.id === conv.targetId);
      return {
        id: conv.targetId,
        name: group?.groupName || '群聊',
        avatar: group?.groupAvatar
      };
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    onSearch?.(value);
  };

  return (
    <div className="nav-panel">
      <div className="nav-header">
        <input
          type="text"
          className="search-box"
          placeholder="搜索会话"
          value={searchKeyword}
          onChange={handleSearch}
        />
      </div>
      <div className="nav-list">
        {filteredConversations.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-icon">💬</div>
            <div className="empty-text">暂无会话</div>
          </div>
        ) : (
          filteredConversations.map(conv => {
            const target = getTargetInfo(conv);
            const isActive = currentConversation?.conversationId === conv.conversationId;
            const initial = target?.name?.charAt(0) || '?';
            
            return (
              <div
                key={conv.conversationId}
                className={`conversation-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelect(conv)}
              >
                <div className={`avatar ${target?.isOnline ? 'online' : ''}`}>
                  {initial}
                </div>
                <div className="conversation-info">
                  <div className="conversation-name">
                    {target?.name || '未知'}
                  </div>
                  <div className="conversation-preview">
                    点击开始聊天
                  </div>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="unread-badge">
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
