import React, { useState } from 'react';
import '../css/ChatInterface.css';
import SideDrawer from './SideDrawer'; // Optional: for drawer functionality
import { useNavigate } from 'react-router-dom';

const users = [
  {
    id: 1,
    name: 'John Doe',
    avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-1.webp',
    lastMessage: 'Hello, Are you there?',
    time: 'Just now',
  },
  {
    id: 2,
    name: 'Lara Croft',
    avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-2.webp',
    lastMessage: 'Let’s team up!',
    time: '5 mins ago',
  },
  {
    id: 3,
    name: 'Brad Pitt',
    avatar: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-3.webp',
    lastMessage: 'Sure!',
    time: '10 mins ago',
  },
];

const ChatInterface = () => {
  const [selectedUser, setSelectedUser] = useState(users[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([
    {
      fromMe: false,
      text: 'Hello!',
      time: '12 mins ago',
      avatar: users[0].avatar,
      name: users[0].name,
    },
    {
      fromMe: true,
      text: 'Hi there!',
      time: 'Just now',
    },
  ]);

  const navigate = useNavigate();

  const handleSend = () => {
    if (!messageInput.trim()) return;
    setMessages([
      ...messages,
      { fromMe: true, text: messageInput, time: 'Now' },
    ]);
    setMessageInput('');
  };

  return (
    <div className="chat-wrapper">

      <SideDrawer
        show={drawerOpen}
        handleClose={() => setDrawerOpen(false)}
        handleNavigate={(path) => {
          setDrawerOpen(false);
          navigate(path);
        }}
      />

      {/* Topbar toggle (for mobile optional) */}
      <div className="chat-header">
        <div className="drawer-toggle" onClick={() => setDrawerOpen(true)}>
          ☰
        </div>
        <h5>{selectedUser.name}</h5>
      </div>

      <div className="chat-container">
        {/* User List */}
        <div className="chat-list">
          <h5>Members</h5>
          {users.map((user) => (
            <div
              key={user.id}
              className={`chat-list-item ${selectedUser.id === user.id ? 'active' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              <img src={user.avatar} alt={user.name} className="avatar" />
              <div className="chat-info">
                <div className="name">{user.name}</div>
                <div className="last-msg">{user.lastMessage}</div>
              </div>
              <div className="chat-time">{user.time}</div>
            </div>
          ))}
        </div>

        {/* Chat messages */}
        <div className="chat-window">
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble ${msg.fromMe ? 'me' : 'them'}`}
              >
                {!msg.fromMe && (
                  <img src={msg.avatar} alt={msg.name} className="avatar-small" />
                )}
                <div className="message-card">
                  <div className="name-time">
                    <strong>{msg.fromMe ? 'Me' : msg.name}</strong>
                    <span>{msg.time}</span>
                  </div>
                  <div className="message-text">{msg.text}</div>
                </div>
                {msg.fromMe && (
                  <img src={users[0].avatar} alt="Me" className="avatar-small" />
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input">
            <textarea
              rows={2}
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
