import React, { useState, useRef, useEffect, useCallback } from 'react';
import useStore from '../store/useStore';
import { messageApi } from '../services/api';
import ws from '../services/websocket';
import localDb from '../services/database';

const EMOJIS = ['😊', '😂', '😍', '🤔', '😎', '😢', '😡', '👍', '👎', '❤️', '💔', '🎉', '🔥', '⭐', '👋', '🙏', '✌️', '🤝', '👏', '💪', '😴', '😭', '😱', '🤗', '😘', '🙄', '😏', '😤', '🥳', '☕'];

const ChatPanel = () => {
  const [inputValue, setInputValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [quoteMessage, setQuoteMessage] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const {
    user, currentConversation, messages,
    friends, groups,
    addMessage, updateMessageStatus
  } = useStore();

  const currentMessages = currentConversation ? 
    (messages[currentConversation.conversationId] || []) : [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages.length, scrollToBottom]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const getTargetInfo = () => {
    if (!currentConversation) return null;
    if (currentConversation.conversationType === 1) {
      const friend = friends.find(f => f.friendId === currentConversation.targetId);
      return {
        id: currentConversation.targetId,
        name: friend?.remark || friend?.nickname || friend?.username || '未知用户',
        avatar: friend?.avatar,
        isOnline: friend?.isOnline,
        type: 'private'
      };
    } else {
      const group = groups.find(g => g.id === currentConversation.targetId);
      return {
        id: currentConversation.targetId,
        name: group?.groupName || '群聊',
        avatar: group?.groupAvatar,
        type: 'group'
      };
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !currentConversation) return;

    const msgData = {
      conversationType: currentConversation.conversationType,
      receiverId: currentConversation.conversationType === 1 ? currentConversation.targetId : null,
      groupId: currentConversation.conversationType === 2 ? currentConversation.targetId : null,
      messageType: 1,
      content: inputValue.trim(),
      quoteMessageId: quoteMessage?.id
    };

    try {
      const sentMsg = await messageApi.send(msgData);
      addMessage(sentMsg);
      localDb.saveMessage(sentMsg);
      ws.sendMessage(sentMsg);
      setInputValue('');
      setQuoteMessage(null);
    } catch (e) {
      console.error('发送失败', e);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const insertEmoji = (emoji) => {
    setInputValue(prev => prev + emoji);
    setShowEmoji(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAndSendFile(file);
    e.target.value = '';
  };

  const uploadAndSendFile = async (file) => {
    if (!currentConversation) return;

    try {
      const fileUrl = await messageApi.uploadFile(file);
      const isImage = file.type.startsWith('image/');
      
      const msgData = {
        conversationType: currentConversation.conversationType,
        receiverId: currentConversation.conversationType === 1 ? currentConversation.targetId : null,
        groupId: currentConversation.conversationType === 2 ? currentConversation.targetId : null,
        messageType: isImage ? 2 : 4,
        content: '',
        fileUrl,
        fileName: file.name,
        fileSize: file.size
      };

      const sentMsg = await messageApi.send(msgData);
      addMessage(sentMsg);
      localDb.saveMessage(sentMsg);
      ws.sendMessage(sentMsg);
    } catch (e) {
      console.error('文件发送失败', e);
    }
  };

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message
    });
  };

  const revokeMessage = async (messageId) => {
    try {
      await messageApi.revoke(messageId);
      updateMessageStatus(messageId, 2);
      localDb.updateMessageStatus(messageId, 2);
    } catch (e) {
      console.error('撤回失败', e);
    }
    setContextMenu(null);
  };

  const startReply = () => {
    if (contextMenu?.message) {
      setQuoteMessage(contextMenu.message);
    }
    setContextMenu(null);
  };

  const deleteLocalMessage = () => {
    if (contextMenu?.message) {
      localDb.deleteMessage(contextMenu.message.id);
    }
    setContextMenu(null);
  };

  const targetInfo = getTargetInfo();

  if (!currentConversation) {
    return (
      <div className="chat-panel">
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <div className="empty-text">选择一个会话开始聊天</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-info">
          <div className="chat-title">{targetInfo?.name}</div>
          <div className="chat-status">
            {targetInfo?.type === 'private' 
              ? (targetInfo?.isOnline ? '在线' : '离线')
              : `群聊`
            }
          </div>
        </div>
        <div className="chat-actions">
          <button className="icon-btn" title="搜索">🔍</button>
          <button className="icon-btn" title="更多">⋯</button>
        </div>
      </div>

      <div className="chat-messages">
        {currentMessages.map(msg => {
          const isSelf = msg.senderId === user?.id;
          const isRevoked = msg.status === 2;
          const isSelected = selectedMessages.includes(msg.id);
          const senderName = targetInfo?.type === 'group' && !isSelf
            ? friends.find(f => f.friendId === msg.senderId)?.nickname || '群成员'
            : null;

          return (
            <div
              key={msg.id}
              className={`message-group ${isSelf ? 'self' : ''} ${isSelected ? 'selected-messages' : ''}`}
              onContextMenu={(e) => handleContextMenu(e, msg)}
            >
              {senderName && (
                <div className="message-header">{senderName}</div>
              )}
              
              {quoteMessage?.id === msg.id && (
                <div className="quote-message highlight">
                  回复: {msg.content || (msg.messageType === 2 ? '[图片]' : '[文件]')}
                </div>
              )}
              
              {isRevoked ? (
                <div className="revoked-message">
                  {isSelf ? '你' : '对方'} 撤回了一条消息
                </div>
              ) : (
                <>
                  {msg.messageType === 1 && (
                    <div className={`message-content ${isSelf ? 'message-self' : 'message-other'}`}>
                      {msg.content}
                    </div>
                  )}
                  {msg.messageType === 2 && (
                    <div className={`message-content ${isSelf ? 'message-self' : 'message-other'}`}>
                      <img 
                        src={msg.fileUrl} 
                        alt="图片" 
                        className="message-image"
                      />
                    </div>
                  )}
                  {msg.messageType === 3 && (
                    <div className={`message-content ${isSelf ? 'message-self' : 'message-other'}`}>
                      <span style={{ fontSize: 32 }}>{msg.content}</span>
                    </div>
                  )}
                  {msg.messageType === 4 && (
                    <div className={`message-content ${isSelf ? 'message-self' : 'message-other'}`}>
                      <div className="file-message">
                        <div className="file-icon">📄</div>
                        <div className="file-info">
                          <div className="file-name">{msg.fileName}</div>
                          <div className="file-size">
                            {msg.fileSize ? (msg.fileSize / 1024).toFixed(1) + ' KB' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        {quoteMessage && (
          <div className="quote-message" style={{ marginBottom: 8 }}>
            回复消息: {quoteMessage.content || '[非文本消息]'}
            <button
              onClick={() => setQuoteMessage(null)}
              style={{ float: 'right', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="input-toolbar">
          <button 
            className="icon-btn" 
            onClick={() => setShowEmoji(!showEmoji)}
            title="表情"
          >
            😊
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button 
            className="icon-btn" 
            onClick={() => fileInputRef.current?.click()}
            title="图片/文件"
          >
            📎
          </button>
          
          {showEmoji && (
            <div className="emoji-picker-container">
              <div className="emoji-grid">
                {EMOJIS.map(emoji => (
                  <div
                    key={emoji}
                    className="emoji-item"
                    onClick={() => insertEmoji(emoji)}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="input-wrapper">
          <textarea
            className="message-input"
            placeholder="输入消息..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={!inputValue.trim()}
          >
            发送
          </button>
        </div>
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          <div className="context-menu-item" onClick={startReply}>
            💬 引用回复
          </div>
          <div className="context-menu-divider" />
          {contextMenu.message.senderId === user?.id && (
            <div 
              className="context-menu-item" 
              onClick={() => revokeMessage(contextMenu.message.id)}
            >
              ↩️ 撤回消息
            </div>
          )}
          <div className="context-menu-item danger" onClick={deleteLocalMessage}>
            🗑️ 删除本地记录
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
