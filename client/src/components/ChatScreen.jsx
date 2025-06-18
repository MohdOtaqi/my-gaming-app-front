import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideDrawer from './SideDrawer';
import '../css/ChatScreen.css';
import { chatAPI, userAPI } from '../services/api';
import { FaEye, FaGamepad } from 'react-icons/fa';

const ChatScreen = () => {
  const { username: otherUserId } = useParams();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const chatBodyRef = useRef(null);

  useEffect(() => {
    const fetchChat = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await chatAPI.getChatWithUser(otherUserId);
        console.log(res)
        setMessages(res.data.messages);
        const otherRes = await userAPI.getUserById(otherUserId);
        setOtherUser(otherRes.data);
      } catch (e) {
        setError('Failed to load chat.');
        console.error('Failed to load chat:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [otherUserId, user.id]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      const res = await chatAPI.sendMessage(otherUserId, input);
      setMessages(res.data.messages);
      setInput('');
    } catch {
      setError('Failed to send message.');
    }
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
      {/* Top Bar */}
      <div className="chat-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', background: '#18191A', position: 'relative' }}>
        <span className="menu-icon" onClick={() => setDrawerOpen(true)} style={{ position: 'absolute', left: 16, cursor: 'pointer', fontSize: 24 }}>&#9776;</span>
          {otherUser && (
            <div
              className="chat-topbar-userinfo clickable"
              onClick={() => navigate(`/profile/${otherUser._id}`)}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <img
                src={otherUser.avatar || '/default-avatar.png'}
                alt="avatar"
                width={40}
                height={40}
                className="chat-topbar-avatar"
              style={{ borderRadius: '50%', marginRight: 12, border: '2px solid #FFD700' }}
              />
            <span className="chat-topbar-name" style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 18 }}>
              {otherUser.name}
            </span>
            </div>
          )}
      </div>
      {/* Chat Body */}
      <div ref={chatBodyRef} className="chat-body">
        {loading ? (
          <div className="chat-loading">Loading...</div>
        ) : error ? (
          <div className="chat-error">{error}</div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender._id.toString() === user.id.toString();
            return (
              <div
                key={i}
                className={`chat-message-row ${isMe ? 'me' : 'them'}`}
              >
                <div className={`chat-bubble-custom ${isMe ? 'me-bubble' : 'them-bubble'}`}>
                  <div className="chat-bubble-text">{msg.text}</div>
                  <div className="chat-bubble-meta">
                    <span className="chat-bubble-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Input Bar */}
      <div className="chat-input-bar">
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="chat-send-btn" onClick={sendMessage}>
          <span className="chat-send-icon">&#9658;</span>
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;
