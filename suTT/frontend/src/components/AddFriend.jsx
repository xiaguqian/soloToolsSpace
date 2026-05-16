
import React, { useState } from 'react';
import axios from 'axios';

function AddFriend({ onClose, onAdd }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      setSearchResult({
        id: 99,
        username: searchTerm,
        nickname: searchTerm,
        avatar: null
      });
    } catch (err) {
      setError('未找到用户');
    }
  };

  const handleAdd = async () => {
    if (!searchResult) return;
    try {
      await axios.post('http://localhost:8080/api/friends/add', {
        targetId: searchResult.id,
        message: message
      });
      onAdd && onAdd();
      onClose && onClose();
    } catch (err) {
      setError(err.response?.data?.message || '添加失败');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>添加好友</h3>
        
        <div className="form-group">
          <label>搜索账号或昵称</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="请输入账号或昵称"
          />
        </div>
        
        <button className="btn btn-primary" onClick={handleSearch} style={{ marginBottom: 15 }}>
          搜索
        </button>
        
        {searchResult && (
          <div style={{ padding: 15, background: '#f5f5f5', borderRadius: 8, marginBottom: 15 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
              <div className="avatar">{searchResult.nickname.charAt(0)}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{searchResult.nickname}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{searchResult.username}</div>
              </div>
            </div>
          </div>
        )}
        
        {searchResult && (
          <div className="form-group">
            <label>验证消息（可选）</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="请输入验证消息"
            />
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>取消</button>
          <button className="btn-confirm" onClick={handleAdd}>发送请求</button>
        </div>
      </div>
    </div>
  );
}

export default AddFriend;
