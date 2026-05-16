
import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import axios from 'axios';

function ChatArea({ contact, user }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, [contact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!contact) return;
    try {
      const response = await axios.get(`http://localhost:8080/api/messages/chat/${contact.id}`);
      if (response.data.code === 200) {
        setMessages(response.data.data);
      }
    } catch (err) {
      console.error('加载消息失败:', err);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || !contact) return;

    try {
      const response = await axios.post('http://localhost:8080/api/messages/send', {
        receiverId: contact.id,
        content: inputMessage,
        contentType: 'text',
        replyTo: replyTo?.id
      });

      if (response.data.code === 200) {
        setMessages(prev => [...prev, {
          ...response.data.data,
          senderId: user.id,
          isSent: true
        }]);
        setInputMessage('');
        setReplyTo(null);
      }
    } catch (err) {
      console.error('发送消息失败:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emoji) => {
    setInputMessage(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message
    });
  };

  const handleReply = () => {
    if (contextMenu?.message) {
      setReplyTo(contextMenu.message);
    }
    setContextMenu(null);
  };

  const handleRecall = async () => {
    if (contextMenu?.message) {
      try {
        await axios.post(`http://localhost:8080/api/messages/recall/${contextMenu.message.id}`);
        setMessages(prev => prev.map(m => 
          m.id === contextMenu.message.id 
            ? { ...m, isRecalled: true, content: '撤回了一条消息' }
            : m
        ));
      } catch (err) {
        console.error('撤回失败:', err);
      }
    }
    setContextMenu(null);
  };

  const handleForward = () => {
    setContextMenu(null);
  };

  const handleDelete = () => {
    setMessages(prev => prev.filter(m => m.id !== contextMenu?.message.id));
    setContextMenu(null);
  };

  if (!contact) {
    return (
      <div className="chat-area">
        <div className="message-list" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#999' }}>请选择一个联系人开始聊天</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
            {contact.name.charAt(0)}
          </div>
          <div>
            <div className="chat-title">{contact.name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {contact.online ? '在线' : '离线'}
            </div>
          </div>
        </div>
        <div className="chat-actions">
          <button className="action-btn">+</button>
          <button className="action-btn">⋮</button>
        </div>
      </div>
      
      <div className="message-list">
        {messages.map(message => (
          <div
            key={message.id}
            className={`message-item ${message.senderId === user.id ? 'sent' : 'received'}`}
            onContextMenu={(e) => handleContextMenu(e, message)}
          >
            <div className="message-bubble">
              {message.replyTo && (
                <div className="reply-message">
                  {messages.find(m => m.id === message.replyTo)?.content || '引用消息'}
                </div>
              )}
              <div className={`message-content ${message.isRecalled ? 'recalled-message' : ''}`}>
                {message.content}
              </div>
              <div className="message-time">
                {message.createdAt?.split('T')[1]?.substring(0, 5) || '未知时间'}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="message-input-area">
        {replyTo && (
          <div style={{ padding: '10px 15px', background: '#f5f5f5', borderRadius: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: '#999' }}>回复: </span>
            <span style={{ fontSize: 12 }}>{replyTo.content}</span>
            <button 
              onClick={() => setReplyTo(null)} 
              style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        )}
        
        <div className="message-input-container">
          <button 
            className="emoji-btn" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </button>
          <textarea
            className="message-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            rows={1}
          />
          <button className="attach-btn">📎</button>
          <button className="send-btn" onClick={handleSend}>
            →
          </button>
        </div>
        
        {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: 100, right: 20 }}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>

      {contextMenu && (
        <div 
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu(null)}
        >
          <div className="context-menu-item" onClick={handleReply}>引用回复</div>
          <div className="context-menu-item" onClick={handleForward}>转发</div>
          {contextMenu.message.senderId === user.id && (
            <div className="context-menu-item" onClick={handleRecall}>撤回</div>
          )}
          <div className="context-menu-item divider"></div>
          <div className="context-menu-item" onClick={handleDelete}>删除</div>
        </div>
      )}
    </div>
  );
}

export default ChatArea;
