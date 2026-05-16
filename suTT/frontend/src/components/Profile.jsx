
import React, { useState } from 'react';
import axios from 'axios';

function Profile({ user, onUpdate }) {
  const [profileData, setProfileData] = useState({
    nickname: user.nickname || '',
    signature: user.signature || '',
    gender: user.gender || '',
    region: user.region || ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:8080/api/auth/user/${user.id}/profile`, profileData);
      if (response.data.code === 200) {
        setSuccessMessage('修改成功');
        onUpdate(response.data.data);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('修改失败:', err);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('上传头像:', file);
    }
  };

  return (
    <div className="profile-container">
      <div className="avatar-uploader">
        <div className="profile-avatar">
          {user.nickname?.charAt(0) || 'U'}
        </div>
        <input type="file" id="avatar-upload" onChange={handleAvatarUpload} />
        <label htmlFor="avatar-upload" className="upload-btn" style={{ display: 'block', margin: '0 auto' }}>
          更换头像
        </label>
      </div>
      
      <div className="profile-info">
        <div className="profile-name">{user.nickname}</div>
        <div className="profile-signature">{user.signature || '暂无个性签名'}</div>
      </div>
      
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>昵称</label>
          <input
            type="text"
            name="nickname"
            value={profileData.nickname}
            onChange={handleChange}
            placeholder="请输入昵称"
          />
        </div>
        
        <div className="form-group">
          <label>个性签名</label>
          <input
            type="text"
            name="signature"
            value={profileData.signature}
            onChange={handleChange}
            placeholder="请输入个性签名"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>性别</label>
            <select name="gender" value={profileData.gender} onChange={handleChange}>
              <option value="">请选择</option>
              <option value="男">男</option>
              <option value="女">女</option>
              <option value="保密">保密</option>
            </select>
          </div>
          <div className="form-group">
            <label>地区</label>
            <input
              type="text"
              name="region"
              value={profileData.region}
              onChange={handleChange}
              placeholder="请输入地区"
            />
          </div>
        </div>
        
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <button type="submit" className="btn btn-primary" style={{ marginTop: 10 }}>
          保存修改
        </button>
      </form>
    </div>
  );
}

export default Profile;
