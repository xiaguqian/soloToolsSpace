
import React, { useState } from 'react';
import axios from 'axios';

function FriendRequests({ onRefresh }) {
  const [requests, setRequests] = useState([
    { id: 1, name: '张三', message: '你好，我是张三' },
    { id: 2, name: '李四', message: '加个好友吧' }
  ]);

  const handleAccept = async (requestId) => {
    try {
      await axios.post(`http://localhost:8080/api/friends/handle/${requestId}?action=1`);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      onRefresh && onRefresh();
    } catch (err) {
      console.error('通过失败:', err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.post(`http://localhost:8080/api/friends/handle/${requestId}?action=2`);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('拒绝失败:', err);
    }
  };

  return (
    <div style={{ padding: 15 }}>
      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: 30 }}>
          暂无好友请求
        </div>
      ) : (
        requests.map(request => (
          <div key={request.id} className="friend-request-item">
            <div className="avatar">{request.name.charAt(0)}</div>
            <div className="request-info">
              <div className="request-name">{request.name}</div>
              <div className="request-message">{request.message}</div>
            </div>
            <div className="request-actions">
              <button className="request-btn accept" onClick={() => handleAccept(request.id)}>
                通过
              </button>
              <button className="request-btn reject" onClick={() => handleReject(request.id)}>
                拒绝
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default FriendRequests;
