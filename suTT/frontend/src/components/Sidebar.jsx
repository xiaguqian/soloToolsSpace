
import React, { useState } from 'react';

function Sidebar({ contacts, groups, activeTab, setActiveTab, selectedContact, setSelectedContact }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>IM Client</h1>
      </div>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="搜索联系人..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="tab-bar">
        <div 
          className={`tab-item ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          好友
        </div>
        <div 
          className={`tab-item ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          群组
        </div>
      </div>
      
      <div className="contact-list">
        {activeTab === 'friends' ? (
          filteredContacts.map(contact => (
            <div
              key={contact.id}
              className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="avatar" style={{ position: 'relative' }}>
                {contact.name.charAt(0)}
                <div className={`online-status ${contact.online ? '' : 'offline-status'}`}></div>
              </div>
              <div className="contact-info">
                <div className="contact-name">{contact.name}</div>
                <div className="contact-last-message">{contact.lastMessage || '暂无消息'}</div>
              </div>
            </div>
          ))
        ) : (
          groups.map(group => (
            <div
              key={group.id}
              className={`group-list-item ${selectedContact?.id === group.id ? 'active' : ''}`}
              onClick={() => setSelectedContact(group)}
            >
              <div className="group-avatar">{group.name.charAt(0)}</div>
              <div className="group-info">
                <div className="group-name">{group.name}</div>
                <div className="group-member-count">{group.memberCount} 名成员</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;
