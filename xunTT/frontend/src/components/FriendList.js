import React, { useState, useEffect, useMemo } from 'react';
import useStore from '../store/useStore';
import { friendApi, groupApi, userApi } from '../services/api';

const FriendList = ({ onStartChat, showToast }) => {
  const [activeSection, setActiveSection] = useState('friend');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [addFriendKeyword, setAddFriendKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  const [pendingRequests, setPendingRequests] = useState([]);

  const { friendGroups, friends, groups, user, setFriends, setFriendGroups, setGroups } = useStore();

  useEffect(() => {
    const allExpanded = {};
    friendGroups.forEach(g => { allExpanded[g.id] = true; });
    setExpandedGroups(allExpanded);
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      const requests = await friendApi.getRequests();
      setPendingRequests(requests || []);
    } catch (e) {
      console.error('加载好友请求失败', e);
    }
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const getGroupFriends = (groupId) => {
    return friends.filter(f => f.groupId === groupId);
  };

  const filteredGroups = useMemo(() => {
    if (!searchKeyword) return friendGroups;
    return friendGroups;
  }, [friendGroups, searchKeyword]);

  const filteredGroupsList = useMemo(() => {
    if (!searchKeyword) return groups;
    return groups.filter(g => g.groupName?.toLowerCase().includes(searchKeyword.toLowerCase()));
  }, [groups, searchKeyword]);

  const searchUsers = async () => {
    if (!addFriendKeyword.trim()) return;
    try {
      const results = await userApi.search(addFriendKeyword);
      setSearchResults(results || []);
    } catch (e) {
      console.error('搜索用户失败', e);
      showToast('搜索失败', 'error');
    }
  };

  const sendFriendRequest = async (targetId) => {
    try {
      await friendApi.sendRequest({ userId: targetId, message: '请求添加好友' });
      showToast('好友请求已发送', 'success');
    } catch (e) {
      console.error('发送请求失败', e);
      showToast(e.message || '发送失败', 'error');
    }
  };

  const handleFriendRequest = async (requestId, action, addToBlacklist = false) => {
    try {
      await friendApi.handleRequest(requestId, action, addToBlacklist);
      showToast(action === 1 ? '已通过' : '已拒绝', 'success');
      loadPendingRequests();
      if (action === 1) {
        const [friendsList, groupsList] = await Promise.all([friendApi.getList(), groupApi.getMyGroups()]);
        setFriends(friendsList || []);
        setGroups(groupsList || []);
      }
    } catch (e) {
      console.error('处理请求失败', e);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      showToast('请输入群名称', 'error');
      return;
    }
    if (selectedMembers.length < 2) {
      showToast('请至少选择2名好友', 'error');
      return;
    }
    
    try {
      const newGroup = await groupApi.create({
        groupName,
        memberIds: selectedMembers
      });
      showToast('群聊创建成功', 'success');
      setShowCreateGroup(false);
      setGroupName('');
      setSelectedMembers([]);
      
      const groupsList = await groupApi.getMyGroups();
      setGroups(groupsList || []);
    } catch (e) {
      console.error('创建群聊失败', e);
      showToast('创建失败', 'error');
    }
  };

  return (
    <div className="nav-panel" style={{ width: '100%' }}>
      <div className="nav-header">
        <div className="friend-tabs">
          <button 
            className={`friend-tab ${activeSection === 'friend' ? 'active' : ''}`}
            onClick={() => setActiveSection('friend')}
          >
            好友列表
            {pendingRequests.length > 0 && (
              <span style={{ 
                backgroundColor: '#ff6b6b', 
                color: 'white', 
                borderRadius: '50%', 
                padding: '2px 6px', 
                fontSize: 11,
                marginLeft: 4 
              }}>
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button 
            className={`friend-tab ${activeSection === 'group' ? 'active' : ''}`}
            onClick={() => setActiveSection('group')}
          >
            群组
          </button>
        </div>
      </div>

      <div className="friend-search-bar">
        <input
          type="text"
          className="search-box"
          placeholder="搜索..."
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
        />
        
        {activeSection === 'friend' && (
          <button 
            className="add-btn"
            onClick={() => setShowAddFriend(true)}
          >
            ➕ 添加
          </button>
        )}
        {activeSection === 'group' && (
          <button 
            className="add-btn"
            onClick={() => setShowCreateGroup(true)}
          >
            ➕ 建群
          </button>
        )}
      </div>

      <div className="nav-list" style={{ overflow: 'auto' }}>
        {activeSection === 'friend' && pendingRequests.length > 0 && (
          <div style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ marginBottom: 8, fontSize: 13, color: '#888' }}>
              新的好友请求 ({pendingRequests.length})
            </div>
            {pendingRequests.map(req => (
              <div key={req.id} className="friend-request-item">
                <div className="avatar" style={{ width: 40, height: 40, fontSize: 16 }}>
                  {req.requesterNickname?.charAt(0) || '?'}
                </div>
                <div className="friend-request-info">
                  <div className="friend-name">{req.requesterNickname}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>
                    {req.message || '请求添加好友'}
                  </div>
                </div>
                <div className="friend-request-actions">
                  <button 
                    className="btn-sm"
                    onClick={() => handleFriendRequest(req.id, 1)}
                  >
                    通过
                  </button>
                  <button 
                    className="btn-sm danger"
                    onClick={() => handleFriendRequest(req.id, 0)}
                  >
                    拒绝
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'friend' && filteredGroups.map(group => {
          const groupFriends = getGroupFriends(group.id);
          const isExpanded = expandedGroups[group.id];
          
          return (
            <div key={group.id} className="friend-group">
              <div 
                className="friend-group-header"
                onClick={() => toggleGroup(group.id)}
              >
                <span className="arrow">{isExpanded ? '▼' : '▶'}</span>
                <span>{group.groupName}</span>
                <span style={{ marginLeft: 'auto', color: '#888', fontSize: 12 }}>
                  {groupFriends.length}
                </span>
              </div>
              
              {isExpanded && (
                <div className="friend-group-content">
                  {groupFriends.length === 0 ? (
                    <div className="empty-text" style={{ padding: 12, color: '#888', fontSize: 12 }}>
                      暂无好友
                    </div>
                  ) : (
                    groupFriends.map(friend => (
                      <div
                        key={friend.id}
                        className="friend-item"
                        onClick={() => onStartChat(friend)}
                      >
                        <div className={`avatar ${friend.isOnline ? 'online' : ''}`}>
                          {friend.nickname?.charAt(0) || '?'}
                        </div>
                        <div className="friend-info">
                          <div className="friend-name">
                            {friend.remark || friend.nickname || friend.username}
                          </div>
                          <div className="friend-status">
                            {friend.isOnline ? '在线' : '离线'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}

        {activeSection === 'group' && (
          <div>
            {filteredGroupsList.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-icon">👥</div>
                <div className="empty-text">暂无群组</div>
              </div>
            ) : (
              filteredGroupsList.map(group => (
                <div
                  key={group.id}
                  className="friend-item"
                  onClick={() => {
                    if (window.electronAPI) {
                      window.electronAPI.window.startChat('group', group.id);
                    }
                  }}
                >
                  <div className="avatar">
                    {group.groupName?.charAt(0) || '?'}
                  </div>
                  <div className="friend-info">
                    <div className="friend-name">{group.groupName}</div>
                    <div className="friend-status">
                      {group.memberCount || 0} 名成员
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showAddFriend && (
        <div className="modal-overlay" onClick={() => setShowAddFriend(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>添加好友</h3>
              <button onClick={() => setShowAddFriend(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="输入账号或昵称搜索"
                  value={addFriendKeyword}
                  onChange={e => setAddFriendKeyword(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && searchUsers()}
                />
                <button className="form-btn" onClick={searchUsers}>
                  搜索
                </button>
              </div>
              
              <div style={{ marginTop: 16, maxHeight: 300, overflow: 'auto' }}>
                {searchResults.length === 0 ? (
                  <div className="empty-text" style={{ textAlign: 'center', padding: 20 }}>
                    {addFriendKeyword ? '未找到用户' : '请输入关键词搜索'}
                  </div>
                ) : (
                  searchResults.map(result => (
                    <div key={result.id} className="friend-item" style={{ marginBottom: 8 }}>
                      <div className="avatar">
                        {result.nickname?.charAt(0) || '?'}
                      </div>
                      <div className="friend-info">
                        <div className="friend-name">{result.nickname}</div>
                        <div className="friend-status">
                          账号: {result.username}
                        </div>
                      </div>
                      <button 
                        className="btn-sm"
                        onClick={() => sendFriendRequest(result.id)}
                      >
                        添加
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateGroup && (
        <div className="modal-overlay" onClick={() => setShowCreateGroup(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>创建群聊</h3>
              <button onClick={() => setShowCreateGroup(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>群名称</label>
                <input
                  type="text"
                  placeholder="请输入群名称"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                />
              </div>
              
              <div className="input-group">
                <label>选择成员 (至少2人)</label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: 8, 
                  maxHeight: 200, 
                  overflow: 'auto',
                  padding: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8 
                }}>
                  {friends.map(friend => (
                    <label 
                      key={friend.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8,
                        cursor: 'pointer',
                        padding: 6,
                        borderRadius: 4,
                        background: selectedMembers.includes(friend.friendId) 
                          ? 'rgba(114, 137, 218, 0.2)' 
                          : 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(friend.friendId)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedMembers([...selectedMembers, friend.friendId]);
                          } else {
                            setSelectedMembers(selectedMembers.filter(id => id !== friend.friendId));
                          }
                        }}
                      />
                      <span>{friend.remark || friend.nickname}</span>
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
                  已选择 {selectedMembers.length} 人
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="form-btn secondary" onClick={() => setShowCreateGroup(false)}>
                取消
              </button>
              <button 
                className="form-btn" 
                onClick={createGroup}
                disabled={selectedMembers.length < 2 || !groupName.trim()}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendList;
