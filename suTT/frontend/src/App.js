
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Profile from './components/Profile';
import Settings from './components/Settings';
import FriendRequests from './components/FriendRequests';
import AddFriend from './components/AddFriend';
import CreateGroup from './components/CreateGroup';

function App() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('chat');
  const [activeTab, setActiveTab] = useState('friends');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const [contacts, setContacts] = useState([
    { id: 2, name: '李四', online: true, lastMessage: '好的，明天见' },
    { id: 3, name: '王五', online: false, lastMessage: '收到' },
    { id: 4, name: '赵六', online: true, lastMessage: '在吗？' },
    { id: 5, name: '钱七', online: false, lastMessage: '谢谢' }
  ]);

  const [groups, setGroups] = useState([
    { id: 101, name: '同学群', memberCount: 15 },
    { id: 102, name: '工作群', memberCount: 8 },
    { id: 103, name: '家人群', memberCount: 5 }
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveView('chat');
    setSelectedContact(null);
  };

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleAddFriend = () => {
    setShowAddFriend(false);
  };

  const handleCreateGroup = () => {
    setShowCreateGroup(false);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="main-container">
      <Sidebar
        contacts={contacts}
        groups={groups}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedContact={selectedContact}
        setSelectedContact={setSelectedContact}
      />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 50, background: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
          <div className="tab-bar" style={{ flex: 1, maxWidth: 300, borderBottom: 'none', gap: 20 }}>
            <div 
              className={`tab-item ${activeView === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveView('chat')}
            >
              聊天
            </div>
            <div 
              className={`tab-item ${activeView === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveView('requests')}
            >
              好友请求
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <button 
              onClick={() => setShowAddFriend(true)}
              className="action-btn"
            >
              +
            </button>
            <button 
              onClick={() => setShowCreateGroup(true)}
              className="action-btn"
            >
              ⊕
            </button>
            <div className="avatar" style={{ width: 36, height: 36, fontSize: 14, cursor: 'pointer' }} onClick={() => setActiveView('profile')}>
              {user.nickname?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
        
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeView === 'chat' && (
            <ChatArea contact={selectedContact} user={user} />
          )}
          
          {activeView === 'requests' && (
            <FriendRequests />
          )}
          
          {activeView === 'profile' && (
            <Profile user={user} onUpdate={handleUpdateProfile} />
          )}
          
          {activeView === 'settings' && (
            <Settings />
          )}
        </div>
        
        {activeView === 'profile' && (
          <div style={{ padding: 15, background: '#f5f5f5', borderTop: '1px solid #e0e0e0', display: 'flex', gap: 15 }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setActiveView('settings')}
              style={{ flex: 1 }}
            >
              设置
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleLogout}
              style={{ flex: 1 }}
            >
              退出登录
            </button>
          </div>
        )}
        
        {activeView === 'settings' && (
          <div style={{ padding: 15, background: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
            <button className="btn btn-primary" onClick={() => setActiveView('profile')} style={{ width: '100%' }}>
              返回
            </button>
          </div>
        )}
      </div>

      {showAddFriend && (
        <AddFriend onClose={() => setShowAddFriend(false)} onAdd={handleAddFriend} />
      )}
      
      {showCreateGroup && (
        <CreateGroup 
          friends={contacts} 
          onClose={() => setShowCreateGroup(false)} 
          onCreate={handleCreateGroup} 
        />
      )}
    </div>
  );
}

export default App;
