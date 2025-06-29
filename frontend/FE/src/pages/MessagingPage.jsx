import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  MessageCircle
} from 'lucide-react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import Navbar from '../Component/Navbar';

let client = null;

const MessagingPage = () => {
  const { contactId } = useParams();
  const [selectedContact, setSelectedContact] = useState(contactId || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/backend/v1/contacts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter out duplicate connections
      const uniqueContacts = response.data.filter((contact, index, self) =>
        index === self.findIndex((c) => c._id === contact._id)
      );
      setContacts(uniqueContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchOrCreateConversation = async (contactId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/backend/v1/conversations/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentConversation(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching/creating conversation:', error);
      return null;
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/backend/v1/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async (messageData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/backend/v1/messages', messageData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const fetchConnectionRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/backend/v1/connection-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConnectionRequests(response.data);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:3000/backend/v1/connection-requests/${requestId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConnectionRequests((prev) => prev.filter((req) => req.id !== requestId));
      fetchContacts(); // Refresh contacts list
    } catch (error) {
      console.error('Error accepting connection request:', error);
    }
  };

  const handleDenyRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:3000/backend/v1/connection-requests/${requestId}/deny`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConnectionRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error) {
      console.error('Error denying connection request:', error);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedContactData = contacts.find(contact => contact._id === selectedContact);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedContact) {
      handleContactSelect(selectedContact);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize WebSocket connection
    client = new W3CWebSocket('ws://localhost:3000');
    
    client.onopen = () => {
      console.log('WebSocket Client Connected');
      const token = localStorage.getItem('token');
      if (token) {
        client.send(
          JSON.stringify({
            type: 'auth',
            payload: { token },
          })
        );
      }
    };

    client.onmessage = (message) => {
      const data = JSON.parse(message.data);
      console.log('WebSocket message received:', data);
      
      if (data.type === 'new-message') {
        setMessages((prevMessages) => [...prevMessages, data.payload]);
        scrollToBottom();
      } else if (data.type === 'auth-success') {
        console.log('WebSocket authentication successful');
      }
    };

    client.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (client) {
        client.close();
      }
    };
  }, []);

  useEffect(() => {
    fetchContacts();
    fetchConnectionRequests();
  }, []);

  const handleContactSelect = async (contactId) => {
    setSelectedContact(contactId);
    const conversation = await fetchOrCreateConversation(contactId);
    if (conversation) {
      fetchMessages(conversation._id);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !currentConversation) return;

    const messageData = {
      conversationId: currentConversation._id,
      text: newMessage,
      type: 'text',
    };

    try {
      // Send via HTTP first to ensure message is saved
      const sentMessage = await sendMessage(messageData);
      
      // Then send via WebSocket for real-time updates
      if (client && client.readyState === client.OPEN) {
        client.send(
          JSON.stringify({
            type: 'message',
            payload: {
              conversationId: currentConversation._id,
              text: newMessage,
              type: 'text',
            },
          })
        );
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Check className="h-4 w-4 text-slate-400" />;
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-slate-400" />;
      case 'read':
        return <CheckCheck className="h-4 w-4 text-cyan-400" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="h-screen bg-slate-900 flex pt-16">
        {/* Sidebar */}
        <div className="w-full md:w-96 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact) => (
              <div
                key={contact._id}
                onClick={() => handleContactSelect(contact._id)}
                className={`p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700/50 transition-colors duration-300 ${
                  selectedContact === contact._id ? 'bg-slate-700/80' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {contact.username.charAt(0).toUpperCase()}
                    </div>
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold truncate">{contact.username}</h3>
                      <span className="text-slate-400 text-sm">{contact.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-slate-400 text-sm truncate pr-2">{contact.email}</p>
                      {contact.unreadCount > 0 && (
                        <span className="bg-cyan-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col ${!selectedContact && 'hidden md:flex'}`}>
          {selectedContact && selectedContactData ? (
            <>
              <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedContactData.username.charAt(0).toUpperCase()}
                    </div>
                    {selectedContactData.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedContactData.username}</h3>
                    <p className="text-slate-400 text-sm">
                      {selectedContactData.isOnline ? 'Online' : 'Last seen recently'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                    <Info className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const currentUserId = localStorage.getItem('userId');
                  const isMyMessage = message.sender._id === currentUserId;
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          isMyMessage
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                            : 'bg-slate-700 text-white'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <div className={`flex items-center justify-end space-x-1 mt-2 ${
                          isMyMessage ? 'text-cyan-100' : 'text-slate-400'
                        }`}>
                          <span className="text-xs">
                            {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          {isMyMessage && getStatusIcon(message.read ? 'read' : 'sent')}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-slate-800 border-t border-slate-700 p-4">
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-white">
                      <Smile className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-900">
              <div className="text-center">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-12 w-12 text-slate-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Select a conversation</h3>
                <p className="text-slate-400 max-w-md">
                  Choose a contact from the sidebar to start messaging with healthcare professionals
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MessagingPage;
