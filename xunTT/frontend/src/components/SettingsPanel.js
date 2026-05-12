import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { userApi } from '../services/api';

const DEFAULT_AVATARS = ['👤', '👨', '👩', '🧑', '👴', '👵', '👦', '👧', '👶', '🧔', '👲', '👳‍♂️', '👷', '💂', '🕵️', '👨‍⚕️', '👩‍⚕️', '👨‍🎓', '👩‍🎓', '🐱', '🐶', '🦊', '🐼', '🐨'];

const SettingsPanel = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [autoStart, setAutoStart] = useState(false);
  const [minimizeToTray, setMinimizeToTray] = useState(true);
  
  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    nickname: '',
    bio: '',
    gender: 0,
    region: '',
    avatar: ''
  });

  const { user, setUser } = useStore();

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.settings.getAutoStart().then(enabled => setAutoStart(enabled));
      window.electronAPI.settings.getTraySetting().then(enabled => setMinimizeToTray(enabled));
    }
    
    if (user) {
      setProfileData({
        nickname: user.nickname || '',
        bio: user.bio || '',
        gender: user.gender || 0,
        region: user.region || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleAutoStartToggle = async (checked) => {
    setAutoStart(checked);
    if (window.electronAPI) {
      const result = await window.electronAPI.settings.setAutoStart(checked);
      showToast(result ? (checked ? '已开启开机自启' : '已关闭开机自启') : '设置失败', 'info');
    }
  };

  const handleTrayToggle = async (checked) => {
    setMinimizeToTray(checked);
    if (window.electronAPI) {
      const result = await window.electronAPI.settings.setTraySetting(checked);
      showToast(result ? (checked ? '已开启托盘常驻' : '已关闭托盘常驻') : '设置失败', 'info');
    }
  };

  const saveProfile = async () => {
    try {
      const updated = await userApi.updateProfile(profileData);
      setUser(updated);
      setEditProfile(false);
      showToast('资料已更新', 'success');
    } catch (e) {
      console.error('更新失败', e);
      showToast('更新失败', 'error');
    }
  };

  const selectAvatar = (avatar) => {
    setProfileData(prev => ({ ...prev, avatar }));
  };

  return (
    <div className="settings-panel">
      <div className="settings-sidebar">
        <div 
          className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 个人资料
        </div>
        <div 
          className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          ⚙️ 通用设置
        </div>
        <div 
          className={`settings-nav-item ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          ℹ️ 关于
        </div>
      </div>

      <div className="settings-content">
        {activeTab === 'profile' && (
          <div className="settings-section">
            <div className="settings-section-header">
              <h3>个人资料</h3>
              {!editProfile && (
                <button className="form-btn" onClick={() => setEditProfile(true)}>
                  编辑
                </button>
              )}
            </div>

            {!editProfile ? (
              <div className="profile-info">
                <div className="profile-avatar-display">
                  <div className="avatar large">
                    {profileData.avatar || user?.nickname?.charAt(0) || '?'}
                  </div>
                </div>
                <div className="profile-fields">
                  <div className="profile-field">
                    <span className="profile-label">账号</span>
                    <span className="profile-value">{user?.username}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">昵称</span>
                    <span className="profile-value">{profileData.nickname || user?.nickname}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">个性签名</span>
                    <span className="profile-value">{profileData.bio || user?.bio || '暂无签名'}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">性别</span>
                    <span className="profile-value">
                      {user?.gender === 1 ? '男' : user?.gender === 2 ? '女' : '保密'}
                    </span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">地区</span>
                    <span className="profile-value">{profileData.region || user?.region || '未设置'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-edit">
                <div className="avatar-selector">
                  <div style={{ marginBottom: 12, fontSize: 14, color: '#888' }}>选择头像</div>
                  <div className="avatar-grid">
                    {DEFAULT_AVATARS.map(emoji => (
                      <div
                        key={emoji}
                        className={`avatar-select-item ${profileData.avatar === emoji ? 'selected' : ''}`}
                        onClick={() => selectAvatar(emoji)}
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="input-group">
                  <label>昵称</label>
                  <input
                    type="text"
                    placeholder="请输入昵称"
                    value={profileData.nickname}
                    onChange={e => setProfileData(prev => ({ ...prev, nickname: e.target.value }))}
                  />
                </div>

                <div className="input-group">
                  <label>个性签名</label>
                  <textarea
                    placeholder="说点什么..."
                    value={profileData.bio}
                    onChange={e => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="input-group">
                  <label>性别</label>
                  <select
                    value={profileData.gender}
                    onChange={e => setProfileData(prev => ({ ...prev, gender: Number(e.target.value) }))}
                  >
                    <option value={0}>保密</option>
                    <option value={1}>男</option>
                    <option value={2}>女</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>地区</label>
                  <input
                    type="text"
                    placeholder="例如: 中国-北京"
                    value={profileData.region}
                    onChange={e => setProfileData(prev => ({ ...prev, region: e.target.value }))}
                  />
                </div>

                <div className="settings-actions">
                  <button 
                    className="form-btn secondary"
                    onClick={() => setEditProfile(false)}
                  >
                    取消
                  </button>
                  <button 
                    className="form-btn"
                    onClick={saveProfile}
                  >
                    保存
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'general' && (
          <div className="settings-section">
            <div className="settings-section-header">
              <h3>通用设置</h3>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <div className="settings-item-title">开机自启</div>
                <div className="settings-item-desc">启动操作系统时自动启动应用</div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={e => handleAutoStartToggle(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <div className="settings-item-title">关闭窗口最小化到托盘</div>
                <div className="settings-item-desc">关闭窗口时不退出应用，在后台运行</div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={minimizeToTray}
                  onChange={e => handleTrayToggle(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <div className="settings-item-title">窗口多开</div>
                <div className="settings-item-desc">打开新窗口登录不同账号</div>
              </div>
              <button 
                className="form-btn"
                onClick={() => window.electronAPI?.window.newWindow()}
              >
                打开新窗口
              </button>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="settings-section">
            <div className="settings-section-header">
              <h3>关于 SoloIM</h3>
            </div>
            <div style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <h2 style={{ marginBottom: 8 }}>SoloIM</h2>
              <p style={{ color: '#888', marginBottom: 4 }}>版本: 1.0.0</p>
              <p style={{ color: '#888', marginBottom: 16 }}>
                一款基于 Electron + React + Spring Boot 的桌面即时通讯软件
              </p>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.8 }}>
                <p>技术栈:</p>
                <p>前端: Electron, React 18, Zustand, Better-SQLite3</p>
                <p>后端: Spring Boot 3.2, MySQL, Redis, WebSocket</p>
                <p>通信: WebSocket, WebRTC</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
