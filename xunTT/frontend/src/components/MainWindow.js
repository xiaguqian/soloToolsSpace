import React, { useState, useEffect, useRef, useCallback } from 'react';
import useStore from '../store/useStore';
import { friendApi, groupApi, messageApi, userApi, authApi } from '../services/api';
import ws from '../services/websocket';
import localDb from '../services/database';
import TitleBar from './TitleBar';
import ConversationList from './ConversationList';
import ChatPanel from './ChatPanel';
import FriendList from './FriendList';
import SettingsPanel from './SettingsPanel';

const MainWindow = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const {
    user, token, currentConversation, setCurrentConversation,
    setFriends, setFriendGroups, setGroups, setConversations,
    addMessage, incrementUnread, setMessages,
    markConversationRead, addConversation
  } = useStore();

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (user && token) {
      localDb.init(user.id);
      ws.connect(token);
      loadInitialData();
      setupWebSocketListeners();
    }
    return () => {
      ws.disconnect();
      localDb.close();
    };
  }, [user?.id, token]);

  const loadInitialData = async () => {
    try {
      const [friends, friendGroups, groups, conversations] = await Promise.all([
        friendApi.getList(),
        friendApi.getGroups(),
        groupApi.getMyGroups(),
        messageApi.getConversations()
      ]);
      setFriends(friends || []);
      setFriendGroups(friendGroups || []);
      setGroups(groups || []);
      setConversations(conversations || []);
    } catch (e) {
      console.error('加载数据失败', e);
      showToast('加载数据失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocketListeners = () => {
    ws.on('message', (data) => {
      if (data.type === 'message' && data.data) {
        const msg = data.data;
        addMessage(msg);
        localDb.saveMessage(msg);
        
        if (msg.senderId !== user?.id) {
          const isCurrentConv = currentConversation && 
            currentConversation.conversationId === msg.conversationId;
          
          if (!isCurrentConv) {
            incrementUnread(msg.conversationId);
          } else {
            markConversationRead(msg.conversationId);
            messageApi.markRead(msg.conversationId);
          }
          addConversation({
            conversationId: msg.conversationId,
            conversationType: msg.conversationType,
            targetId: msg.conversationType === 1 ? 
              (msg.senderId === user?.id ? msg.receiverId : msg.senderId) : 
              msg.groupId,
            lastMessageId: msg.id
          });
        }
      }
    });
  };

  const selectConversation = async (conv) => {
    setCurrentConversation(conv);
    markConversationRead(conv.conversationId);
    messageApi.markRead(conv.conversationId);
    
    try {
      const messages = await messageApi.getHistory(conv.conversationId, 0, 100);
      setMessages(conv.conversationId, messages || []);
      messages?.forEach(m => localDb.saveMessage(m));
    } catch (e) {
      console.error('加载历史消息失败', e);
      const localMessages = localDb.getMessages(conv.conversationId);
      setMessages(conv.conversationId, localMessages);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('登出失败', e);
    }
    useStore.getState().logout();
    showToast('已登出', 'info');
  };

  const openNewWindow = () => {
    if (window.electronAPI) {
      window.electronAPI.window.newWindow();
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <TitleBar />
        <div className="main-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <TitleBar />
      <div className="main-content">
        <div className="sidebar">
          <button
            className={`sidebar-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
            title="消息"
          >
            💬
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'friend' ? 'active' : ''}`}
            onClick={() => setActiveTab('friend')}
            title="通讯录"
          >
            👥
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="设置"
          >
            ⚙️
          </button>
          <button
            className="sidebar-btn new-window-btn"
            onClick={openNewWindow}
            title="多开窗口"
          >
            ➕
          </button>
          <button
            className="sidebar-btn"
            onClick={handleLogout}
            title="退出登录"
            style={{ marginTop: 'auto' }}
          >
            🚪
          </button>
        </div>

        {activeTab === 'chat' && (
          <>
            <ConversationList 
              onSelect={selectConversation}
              onSearch={(keyword) => console.log('搜索:', keyword)}
            />
            <ChatPanel />
          </>
        )}

        {activeTab === 'friend' && (
          <FriendList 
            onStartChat={(friend) => {
              const convId = `user_${Math.min(user.id, friend.friendId)}_${Math.max(user.id, friend.friendId)}`;
              addConversation({
                conversationId: convId,
                conversationType: 1,
                targetId: friend.friendId
              });
              setActiveTab('chat');
            }}
            showToast={showToast}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel showToast={showToast} />
        )}
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default MainWindow;
