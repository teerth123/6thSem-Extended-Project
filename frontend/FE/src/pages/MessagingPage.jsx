import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import VideoMessageWithTracking from '../Component/VideoTrackingComponents';
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
  MessageCircle,
  Image,
  FileText,
  Download,
  X,
  Upload,
  Package,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Filter
} from 'lucide-react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import Navbar from '../Component/Navbar';

let client = null;

const MessagingPage = () => {
    const token = localStorage.getItem('token');
  const { contactId } = useParams();
  const [selectedContact, setSelectedContact] = useState(contactId || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [userId, setUserId] = useState(null);
  
  // Inventory states
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryTab, setInventoryTab] = useState('orders'); // 'orders', 'items', 'create-order'
  const [orders, setOrders] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [orderForm, setOrderForm] = useState({
    items: [{ inventoryItem: '', quantity: 1 }],
    deliveryAddress: '',
    notes: '',
    requiredDate: ''
  });
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'medicine',
    description: '',
    manufacturer: '',
    batchNumber: '',
    expiryDate: '',
    unitPrice: 0
  });

  // Video tracking states
  const [videoTrackingData, setVideoTrackingData] = useState({});
  const [activeVideoIntervals, setActiveVideoIntervals] = useState({});

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const userIdFromStorage = localStorage.getItem('userId');
      setUserId(userIdFromStorage);
      const response = await axios.get(`http://localhost:3000/backend/v1/user/${userIdFromStorage}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser({ ...response.data, _id: userIdFromStorage });
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchOrders = async () => {
    if (!currentConversation) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/backend/v1/inventory/orders/${currentConversation._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/backend/v1/inventory/items', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventoryItems(response.data);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  const handleCreateOrder = async () => {
    if (!currentConversation) {
      alert('No conversation selected. Please select a contact first.');
      return;
    }
    
    // Validate form before sending
    const validItems = orderForm.items.filter(item => item.inventoryItem && item.quantity > 0);
    
    if (validItems.length === 0) {
      alert('Please select at least one item with a valid quantity.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      console.log('Sending order data:', {
        conversationId: currentConversation._id,
        items: validItems,
        deliveryAddress: orderForm.deliveryAddress,
        notes: orderForm.notes,
        requiredDate: orderForm.requiredDate
      });
      
      const response = await axios.post('http://localhost:3000/backend/v1/inventory/orders', {
        conversationId: currentConversation._id,
        items: validItems,
        deliveryAddress: orderForm.deliveryAddress,
        notes: orderForm.notes,
        requiredDate: orderForm.requiredDate
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Order created successfully:', response.data);
      
      setOrders([response.data, ...orders]);
      setOrderForm({
        items: [{ inventoryItem: '', quantity: 1 }],
        deliveryAddress: '',
        notes: '',
        requiredDate: ''
      });
      setInventoryTab('orders');
      alert('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.msg || error.response?.data?.error || 'Failed to create order. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleCreateInventoryItem = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/backend/v1/inventory/items', itemForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setInventoryItems([response.data, ...inventoryItems]);
      setItemForm({
        name: '',
        category: 'medicine',
        description: '',
        manufacturer: '',
        batchNumber: '',
        expiryDate: '',
        unitPrice: 0
      });
      alert('Inventory item created successfully!');
    } catch (error) {
      console.error('Error creating inventory item:', error);
      alert('Failed to create item. Please try again.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:3000/backend/v1/inventory/orders/${orderId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setOrders(orders.map(order => 
        order._id === orderId ? response.data : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status.');
    }
  };

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

  // Initialize video tracking for video messages
  const initializeVideoTracking = async (messageId, videoElement) => {
    try {
      const response = await axios.post(
        `/backend/v1/video/initialize`,
        { messageId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Start progress tracking
        setupVideoProgressTracking(messageId, videoElement);
      }
    } catch (error) {
      console.error('Error initializing video tracking:', error);
    }
  };

  // Setup progress tracking for video
  const setupVideoProgressTracking = (messageId, videoElement) => {
    // Clear any existing interval
    if (activeVideoIntervals[messageId]) {
      clearInterval(activeVideoIntervals[messageId]);
    }

    const interval = setInterval(async () => {
      if (videoElement && !videoElement.paused && !videoElement.ended) {
        try {
          await axios.put(
            `/backend/v1/video/progress`,
            {
              messageId,
              currentTime: videoElement.currentTime
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          // Update local tracking data
          await fetchVideoTrackingData(messageId);
        } catch (error) {
          console.error('Error updating video progress:', error);
        }
      }
    }, 5000); // Update every 5 seconds

    setActiveVideoIntervals(prev => ({
      ...prev,
      [messageId]: interval
    }));

    // Clean up interval when video ends or user leaves
    videoElement.addEventListener('ended', () => {
      clearInterval(interval);
      setActiveVideoIntervals(prev => {
        const newIntervals = { ...prev };
        delete newIntervals[messageId];
        return newIntervals;
      });
    });
  };

  // Fetch video tracking data
  const fetchVideoTrackingData = async (messageId) => {
    try {
      const response = await axios.get(
        `/backend/v1/video/tracking/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setVideoTrackingData(prev => ({
          ...prev,
          [messageId]: response.data.tracking
        }));
      }
    } catch (error) {
      console.error('Error fetching video tracking data:', error);
    }
  };

  // Handle video load for tracking
  const handleVideoLoad = async (messageId, videoElement) => {
    // Initialize tracking for this video
    await initializeVideoTracking(messageId, videoElement);
    
    // Fetch existing tracking data
    await fetchVideoTrackingData(messageId);
    
    // Set video to last watched position if available
    const tracking = videoTrackingData[messageId];
    if (tracking && tracking.currentTime > 0) {
      videoElement.currentTime = tracking.currentTime;
    }
  };

  // Refresh tracking data for sent videos (to see receiver's progress)
  useEffect(() => {
    const refreshSentVideoTracking = async () => {
      if (messages && messages.length > 0) {
        const sentVideoMessages = messages.filter(msg => 
          msg.type === 'video' && 
          msg.fileUrl && 
          msg.sender === userId
        );
        
        for (const msg of sentVideoMessages) {
          await fetchVideoTrackingData(msg._id);
        }
      }
    };

    // Refresh every 10 seconds for sent videos
    const interval = setInterval(refreshSentVideoTracking, 10000);
    
    return () => clearInterval(interval);
  }, [messages, userId]);

  useEffect(() => {
    if (selectedContact) {
      handleContactSelect(selectedContact);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize WebSocket connection with retry logic
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    
    const connectWebSocket = () => {
      try {
        client = new W3CWebSocket('ws://localhost:3000');
        
        client.onopen = () => {
          console.log('WebSocket Client Connected');
          reconnectAttempts = 0; // Reset attempts on successful connection
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
            // Check if message already exists to prevent duplicates
            // Compare by conversationId, sender, text, and timestamp (within 5 seconds)
            setMessages((prevMessages) => {
              const currentUserId = localStorage.getItem('userId');
              const incomingMessage = data.payload;
              
              // Don't add our own messages that we just sent via HTTP
              if (incomingMessage.sender._id === currentUserId) {
                // Check if we already have this message (sent via HTTP)
                const existingMessage = prevMessages.find(msg => 
                  msg.conversationId === incomingMessage.conversationId &&
                  msg.sender._id === incomingMessage.sender._id &&
                  msg.text === incomingMessage.text &&
                  msg.type === incomingMessage.type &&
                  Math.abs(new Date(msg.createdAt) - new Date(incomingMessage.createdAt)) < 5000 // Within 5 seconds
                );
                
                if (existingMessage) {
                  console.log('Skipping duplicate message from self');
                  return prevMessages;
                }
              }
              
              // Check for exact ID match (backup check)
              const messageExists = prevMessages.some(msg => msg._id === incomingMessage._id);
              if (!messageExists) {
                return [...prevMessages, incomingMessage];
              }
              return prevMessages;
            });
            scrollToBottom();
          } else if (data.type === 'auth-success') {
            console.log('WebSocket authentication successful');
          }
        };

        client.onerror = (error) => {
          console.log('WebSocket connection attempt failed, this is normal on initial load');
        };

        client.onclose = (event) => {
          console.log('WebSocket connection closed');
          
          // Attempt to reconnect if not manually closed and within retry limit
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);
            setTimeout(() => {
              connectWebSocket();
            }, 2000 * reconnectAttempts); // Exponential backoff
          }
        };
      } catch (error) {
        console.log('Failed to create WebSocket connection:', error.message);
      }
    };

    // Initial connection
    connectWebSocket();

    return () => {
      if (client && client.readyState === client.OPEN) {
        client.close(1000, 'Component unmounting'); // Clean close
      }
    };
  }, []);

  useEffect(() => {
    fetchContacts();
    fetchConnectionRequests();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (showInventoryModal && currentConversation) {
      fetchOrders();
      fetchInventoryItems();
    }
  }, [showInventoryModal, currentConversation]);

  // Video tracking useEffect
  useEffect(() => {
    if (messages && messages.length > 0) {
      // Load tracking data for all video messages
      const videoMessages = messages.filter(msg => msg.type === 'video' && msg.fileUrl);
      videoMessages.forEach(msg => {
        fetchVideoTrackingData(msg._id);
      });
    }

    // Cleanup intervals when component unmounts or conversation changes
    return () => {
      Object.values(activeVideoIntervals).forEach(interval => {
        clearInterval(interval);
      });
      setActiveVideoIntervals({});
    };
  }, [messages, currentConversation]);

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
      
      // Immediately add the message to local state for instant display
      if (sentMessage) {
        setMessages((prevMessages) => [...prevMessages, sentMessage]);
      }
      
      // Then send via WebSocket for real-time updates to other users
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'confirmed':
        return 'text-blue-400 bg-blue-400/10';
      case 'shipped':
        return 'text-purple-400 bg-purple-400/10';
      case 'delivered':
        return 'text-green-400 bg-green-400/10';
      case 'received':
        return 'text-emerald-400 bg-emerald-400/10';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-slate-400 bg-slate-400/10';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setShowFileModal(true);
    }
  };

  // Handle file attachment button click
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file upload and send as message
  const handleFileUpload = async (file) => {
    if (!file || !currentConversation) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Upload file to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await axios.post('http://localhost:3000/backend/v1/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Get file type for message
      const fileType = file.type.startsWith('image/') ? 'image' : 
                     file.type.startsWith('video/') ? 'video' : 
                     file.type.startsWith('audio/') ? 'audio' : 'document';

      // Send message with file URL
      const messageData = {
        conversationId: currentConversation._id,
        text: file.name,
        type: fileType,
        fileUrl: uploadResponse.data.url
      };

      // Send message via HTTP API
      const sentMessage = await sendMessage(messageData);
      
      // Immediately add the message to local state for instant display
      if (sentMessage) {
        setMessages((prevMessages) => [...prevMessages, sentMessage]);
      }
      
      // Send via WebSocket for real-time updates to other users
      if (client && client.readyState === client.OPEN) {
        client.send(
          JSON.stringify({
            type: 'message',
            payload: messageData,
          })
        );
      }

      console.log('File uploaded and message sent:', sentMessage);

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Modified handleFileChange to upload directly
  const handleFileChangeAndUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
      // Reset file input
      e.target.value = '';
    }
  };

  // Add file input element
  const fileInputElement = (
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileChangeAndUpload}
      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      className="hidden"
    />
  );

  // Render media message content
  const renderMessageContent = (message) => {
    const { type, text, fileUrl } = message;
    
    if (type === 'image' && fileUrl) {
      return (
        <div className="space-y-2">
          <img 
            src={fileUrl} 
            alt={text}
            className="max-w-full h-auto rounded-lg cursor-pointer"
            onClick={() => window.open(fileUrl, '_blank')}
          />
          <p className="text-xs opacity-75">{text}</p>
        </div>
      );
    } else if (type === 'video' && fileUrl) {
      return (
        <VideoMessageWithTracking
          message={message}
          currentUserId={userId}
          token={token}
        />
      );
    } else if (type === 'audio' && fileUrl) {
      return (
        <div className="space-y-2">
          <audio src={fileUrl} controls className="w-full" />
          <p className="text-xs opacity-75">{text}</p>
        </div>
      );
    } else if ((type === 'document' || type === 'file') && fileUrl) {
      return (
        <div className="flex items-center space-x-3 p-3 bg-slate-600/50 rounded-lg">
          <FileText className="h-8 w-8 text-cyan-400" />
          <div className="flex-1">
            <p className="text-sm font-medium">{text}</p>
            <p className="text-xs opacity-75">Document</p>
          </div>
          <button
            onClick={() => window.open(fileUrl, '_blank')}
            className="p-2 hover:bg-slate-500 rounded-lg transition-colors"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      );
    } else {
      return <p className="text-sm leading-relaxed">{text}</p>;
    }
  };

  // Inventory Modal Component
  const InventoryModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
          </div>
          <button
            onClick={() => setShowInventoryModal(false)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-slate-400" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700">
          {['orders', 'items', 'create-order'].map((tab) => (
            <button
              key={tab}
              onClick={() => setInventoryTab(tab)}
              className={`px-6 py-4 font-medium capitalize transition-colors ${
                inventoryTab === tab
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {inventoryTab === 'orders' && (
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Order History</h3>
                <button
                  onClick={() => setInventoryTab('create-order')}
                  className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Order</span>
                </button>
              </div>

              {/* Orders Table */}
              <div className="bg-slate-700/50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="text-left p-4 text-slate-300 font-medium">Order #</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Date</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Items</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Total</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Status</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-t border-slate-600">
                        <td className="p-4 text-white font-medium">{order.orderNumber}</td>
                        <td className="p-4 text-slate-300">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-slate-300">
                          {order.items.length} item(s)
                        </td>
                        <td className="p-4 text-slate-300">
                          ${order.totalAmount.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {/* MR Actions */}
                          {currentUser?.role === 'mr' && order.status === 'pending' && (
                            <select
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              className="bg-slate-600 text-white rounded px-3 py-1 text-sm"
                              defaultValue={order.status}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          )}
                          {currentUser?.role === 'mr' && order.status === 'confirmed' && (
                            <select
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              className="bg-slate-600 text-white rounded px-3 py-1 text-sm"
                              defaultValue={order.status}
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          )}
                          
                          {/* Doctor Actions */}
                          {currentUser?.role === 'doctor' && order.status === 'shipped' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order._id, 'received')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Mark Received</span>
                            </button>
                          )}
                          {currentUser?.role === 'doctor' && order.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Cancel Order
                            </button>
                          )}
                          
                          {/* Final States - No Actions */}
                          {(order.status === 'received' || order.status === 'cancelled') && (
                            <span className="text-slate-400 text-sm italic">
                              {order.status === 'received' ? 'Order Complete' : 'Order Cancelled'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <div className="p-8 text-center text-slate-400">
                    No orders found for this conversation.
                  </div>
                )}
              </div>
            </div>
          )}

          {inventoryTab === 'items' && (
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Inventory Items</h3>
                {currentUser?.role === 'mr' && (
                  <button
                    onClick={() => {
                      setItemForm({
                        name: '',
                        category: 'medicine',
                        description: '',
                        manufacturer: '',
                        batchNumber: '',
                        expiryDate: '',
                        unitPrice: 0
                      });
                    }}
                    className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                )}
              </div>

              {/* Add Item Form (for MRs) */}
              {currentUser?.role === 'mr' && (
                <div className="bg-slate-700/50 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Add New Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                      className="bg-slate-600 text-white rounded px-3 py-2"
                    />
                    <select
                      value={itemForm.category}
                      onChange={(e) => setItemForm({...itemForm, category: e.target.value})}
                      className="bg-slate-600 text-white rounded px-3 py-2"
                    >
                      <option value="medicine">Medicine</option>
                      <option value="equipment">Equipment</option>
                      <option value="supplies">Supplies</option>
                      <option value="device">Device</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Manufacturer"
                      value={itemForm.manufacturer}
                      onChange={(e) => setItemForm({...itemForm, manufacturer: e.target.value})}
                      className="bg-slate-600 text-white rounded px-3 py-2"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Unit Price"
                      value={itemForm.unitPrice}
                      onChange={(e) => setItemForm({...itemForm, unitPrice: parseFloat(e.target.value)})}
                      className="bg-slate-600 text-white rounded px-3 py-2"
                    />
                    <input
                      type="date"
                      placeholder="Expiry Date"
                      value={itemForm.expiryDate}
                      onChange={(e) => setItemForm({...itemForm, expiryDate: e.target.value})}
                      className="bg-slate-600 text-white rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Batch Number"
                      value={itemForm.batchNumber}
                      onChange={(e) => setItemForm({...itemForm, batchNumber: e.target.value})}
                      className="bg-slate-600 text-white rounded px-3 py-2"
                    />
                  </div>
                  <div className="mt-4">
                    <textarea
                      placeholder="Description"
                      value={itemForm.description}
                      onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                      className="w-full bg-slate-600 text-white rounded px-3 py-2 h-20"
                    />
                  </div>
                  <button
                    onClick={handleCreateInventoryItem}
                    className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Add Item
                  </button>
                </div>
              )}

              {/* Items Table */}
              <div className="bg-slate-700/50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="text-left p-4 text-slate-300 font-medium">Name</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Category</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Manufacturer</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Price</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Expiry</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Batch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems.map((item) => (
                      <tr key={item._id} className="border-t border-slate-600">
                        <td className="p-4 text-white font-medium">{item.name}</td>
                        <td className="p-4 text-slate-300 capitalize">{item.category}</td>
                        <td className="p-4 text-slate-300">{item.manufacturer}</td>
                        <td className="p-4 text-slate-300">${item.unitPrice.toFixed(2)}</td>
                        <td className="p-4 text-slate-300">
                          {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-4 text-slate-300">{item.batchNumber || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {inventoryItems.length === 0 && (
                  <div className="p-8 text-center text-slate-400">
                    No inventory items found.
                  </div>
                )}
              </div>
            </div>
          )}

          {inventoryTab === 'create-order' && (
            <div className="p-6 h-full overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-6">Create New Order</h3>
              
              <div className="bg-slate-700/50 rounded-lg p-6">
                <div className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-3">Order Items</label>
                    {orderForm.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 mb-3">
                        <select
                          value={item.inventoryItem}
                          onChange={(e) => {
                            const newItems = [...orderForm.items];
                            newItems[index].inventoryItem = e.target.value;
                            setOrderForm({...orderForm, items: newItems});
                          }}
                          className="flex-1 bg-slate-600 text-white rounded px-3 py-2"
                        >
                          <option value="">Select Item</option>
                          {inventoryItems.map((invItem) => (
                            <option key={invItem._id} value={invItem._id}>
                              {invItem.name} - ${invItem.unitPrice.toFixed(2)}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...orderForm.items];
                            newItems[index].quantity = parseInt(e.target.value);
                            setOrderForm({...orderForm, items: newItems});
                          }}
                          className="w-24 bg-slate-600 text-white rounded px-3 py-2"
                          placeholder="Qty"
                        />
                        {orderForm.items.length > 1 && (
                          <button
                            onClick={() => {
                              const newItems = orderForm.items.filter((_, i) => i !== index);
                              setOrderForm({...orderForm, items: newItems});
                            }}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setOrderForm({
                          ...orderForm,
                          items: [...orderForm.items, { inventoryItem: '', quantity: 1 }]
                        });
                      }}
                      className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  {/* Delivery Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-300 font-medium mb-2">Delivery Address</label>
                      <textarea
                        value={orderForm.deliveryAddress || ''}
                        onChange={(e) => {
                          console.log('Delivery address changed:', e.target.value);
                          setOrderForm(prev => ({...prev, deliveryAddress: e.target.value}));
                        }}
                        className="w-full bg-slate-600 text-white rounded px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Enter delivery address"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-2">Required Date</label>
                      <input
                        type="date"
                        value={orderForm.requiredDate || ''}
                        onChange={(e) => setOrderForm(prev => ({...prev, requiredDate: e.target.value}))}
                        className="w-full bg-slate-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">Notes</label>
                    <textarea
                      value={orderForm.notes || ''}
                      onChange={(e) => setOrderForm(prev => ({...prev, notes: e.target.value}))}
                      className="w-full bg-slate-600 text-white rounded px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Additional notes or requirements"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleCreateOrder}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Create Order
                    </button>
                    <button
                      onClick={() => setInventoryTab('orders')}
                      className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
                  <button
                    onClick={() => setShowInventoryModal(true)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    title="Inventory Management"
                  >
                    <Package className="h-5 w-5" />
                  </button>
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
                        {renderMessageContent(message)}
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
                  {fileInputElement}
                  <button 
                    onClick={handleAttachmentClick}
                    disabled={uploading}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50"
                  >
                    {uploading ? <Upload className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={uploading}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-cyan-500 transition-colors duration-300 disabled:opacity-50"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-white">
                      <Smile className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || uploading}
                    className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                
                {uploading && (
                  <div className="mt-2 flex items-center space-x-2 text-cyan-400">
                    <Upload className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">Uploading file...</span>
                  </div>
                )}
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

        {/* Inventory Modal */}
        {showInventoryModal && <InventoryModal />}
      </div>
    </>
  );
};

export default MessagingPage;
