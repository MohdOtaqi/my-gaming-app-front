import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ChatList.css';
import TopBar from './TopBar';
import SideDrawer from './SideDrawer';
import { chatAPI } from '../services/api';
import { Modal, Button } from 'react-bootstrap';

const ChatListPage = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const res = await chatAPI.getChats();
        setChats(res.data);
      } catch {
        setChats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleDeleteClick = (e, chatId) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    if (chatToDelete) {
      setDeleting(chatToDelete);
      try {
        await chatAPI.deleteChat(chatToDelete);
        setChats(chats => chats.filter(chat => chat._id !== chatToDelete));
      } catch {}
      setDeleting('');
      setChatToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setChatToDelete(null);
  };

  return (
    <div className="chatlist-wrapper">
      <TopBar onMenuClick={() => setDrawerOpen(true)} />

      <SideDrawer
        show={drawerOpen}
        handleClose={() => setDrawerOpen(false)}
        handleNavigate={(path) => {
          setDrawerOpen(false);
          navigate(path);
        }}
      />

      <div className="chatlist-content">
        {loading ? (
          <div>Loading...</div>
        ) : (
          chats.length === 0 ? (
            <div>No chats yet.</div>
          ) : (
            chats.map((chat) => {
              // Find the other participant
              const other = chat.participants.find(p => p._id.toString() !== user.id.toString());
              const lastMsg = chat.messages[chat.messages.length - 1];
              return (
                <div
                  key={chat._id}
                  className="chat-card"
                  onClick={() => navigate(`/chats/${other._id}`)}
                >
                  <div className="chat-left">
                    <img src={other.avatar || '/default-avatar.png'} alt={other.name} className="chat-avatar" />
                    <div className="chat-info">
                      <div className="chat-name">{other.name}</div>
                      <div className="chat-message">{lastMsg ? lastMsg.text : ''}</div>
                    </div>
                  </div>
                  <div className="chat-timestamp">
                    {lastMsg ? new Date(lastMsg.timestamp).toLocaleString() : ''}
                  </div>
                  <button
                    className="chat-delete-btn"
                    onClick={e => handleDeleteClick(e, chat._id)}
                    disabled={deleting === chat._id}
                    style={{ marginLeft: 10, background: '#dc3545', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
                  >
                    {deleting === chat._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              );
            })
          )
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal show={showConfirm} onHide={handleCancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this chat?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ChatListPage;
