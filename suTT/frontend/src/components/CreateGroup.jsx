
import React, { useState } from 'react';
import axios from 'axios';

function CreateGroup({ friends, onClose, onCreate }) {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const toggleMember = (friendId) => {
    setSelectedMembers(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedMembers.length < 2) {
      alert('请输入群名称并选择至少2个成员');
      return;
    }
    
    try {
      await axios.post('http://localhost:8080/api/groups/create', {
        name: groupName,
        memberIds: selectedMembers
      });
      onCreate && onCreate();
      onClose && onClose();
    } catch (err) {
      console.error('创建群失败:', err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: 500, maxHeight: '80vh', overflowY: 'auto' }}>
        <h3>创建群聊</h3>
        
        <div className="form-group">
          <label>群名称</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="请输入群名称"
          />
        </div>
        
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            选择成员（至少2人）
          </label>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {friends.map(friend => (
              <div 
                key={friend.id}
                className={`friend-request-item ${selectedMembers.includes(friend.id) ? 'selected' : ''}`}
                onClick={() => toggleMember(friend.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="avatar">{friend.name.charAt(0)}</div>
                <div className="request-info">
                  <div className="request-name">{friend.name}</div>
                </div>
                <div style={{ width: 20, height: 20, border: '2px solid #ddd', borderRadius: 4 }}>
                  {selectedMembers.includes(friend.id) && (
                    <div style={{ width: '100%', height: '100%', background: '#667eea', borderRadius: 2 }}></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>取消</button>
          <button className="btn-confirm" onClick={handleCreate}>创建</button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroup;
