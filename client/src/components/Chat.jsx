import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import socket from '../utils/socket';

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const user = useSelector((state) => state.user);
  const messages = useSelector((state) => state.chat.messages);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when new message arrives
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('send_message', { user: user.name, text: message });
      setMessage('');
    }
  };

  if (!isOpen) {
    return (
      <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
        💬
      </button>
    );
  }

  return (
    <div className="chat-popup">
      <div className="chat-header">
        <span>Chat</span>
        <button onClick={() => setIsOpen(false)}>✖</button>
      </div>
      <div className="chat-body" ref={chatBodyRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.user === user.name ? 'self' : 'other'}`}>
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <form className="chat-input" onSubmit={handleSendMessage}>
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;