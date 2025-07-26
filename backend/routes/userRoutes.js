import dotenv from "dotenv"
dotenv.config()
import express from "express"
import jwt from "jsonwebtoken"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import streamifier from "streamifier"
import {User} from "../Database model/userDB.js"
import {Message} from "../Database model/messageDB.js"
import {Conversation} from "../Database model/conversationDB.js"
import {InventoryItem, Order, InventoryTransaction} from "../Database model/inventoryDB.js"
import {SharedVideoTracking} from "../Database model/sharedVideoTrackingDB.js"
import { verifyToken } from "../middleware/verifyToken.js"

const secret= process.env.secret
export const userRouter = express.Router()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || "deqnf0a9w",
  api_key: process.env.CLOUD_API_KEY || "898792876773274",
  api_secret: process.env.CLOUD_API_SECRET || "EIDrDnm5yaXfVO7SougS77OJmi4",
});

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images, videos, and documents
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('video/') || 
        file.mimetype.startsWith('audio/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype.includes('document') ||
        file.mimetype.includes('text')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

userRouter.post("/signup", async (req, res) => {
    console.log(req.body)
    
    const { username, firstname, lastname, email, password, role, yearsofExperience, shortBio, worksAt } = req.body

    try {
        const check = await User.findOne({ email: email })

        if (check) {
            res.json({
                msg: "user already exists"
            })
        } else {
            
            const newUser = await User.create({ username, firstname, lastname, email, password, role, yearsofExperience, shortBio, worksAt })
            const token = jwt.sign({_id:newUser._id}, secret, { expiresIn: "30d" })
            res.json({
                token,
                userId: newUser._id // Include user ID in the response
            })
        }
    } catch(e) {
        console.error( e + "error while signing up")
        res.status(500).json({ error: "Error creating user" })
    }
})

userRouter.post("/signin", async (req, res) => {
    console.log(req.body)
    
    const { username, firstname, lastname, email, password, role, yearsofExperience, shortBio, worksAt } = req.body

    try {
        const check = await User.findOne({ email: email })

        if (check) {
            res.json({
                msg: "user already exists"
            })
        } else {
            
            const newUser = await User.create({ username, firstname, lastname, email, password, role, yearsofExperience, shortBio, worksAt })
            const token = jwt.sign({_id:newUser._id}, secret, { expiresIn: "30d" })
            res.json({
                token,
                userId: newUser._id // Include user ID in the response
            })
        }
    } catch(e) {
        console.error( e + "error while signing in")
        res.status(500).json({ error: "Error creating user" })
    }
})

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email })
        if (user && user.password === password) {
            const token = jwt.sign({_id:user._id}, secret, { expiresIn: "30d" })
            res.json({
                secret:secret,
                msg: "user logged in succesfully",
                token,
                userId: user._id // Include user ID in the response
            })
        }
    } catch {
        console.error("error while logging in")
    }

})

userRouter.get(`/user/:id/profile`, async (req, res) => {
    const userid = req.params.id; // Get user from URL
    try {
        const user = await User.findById(userid);
        if (user) {
            res.json({
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                yearsofExperience: user.yearsofExperience,
                worksAt: user.worksAt,
            });
        } else {
            res.status(404).json({ msg: 'User not found' });
        }
    } catch (e) {
        console.error(e + ' error while finding profile info');
        res.status(500).json({ msg: 'Server error' });
    }
});

userRouter.put('/user/:id/update', verifyToken, async (req, res) => {
    const userId = req.params.id;
    const updateData = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true } // returns the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({
            username: updatedUser.username,
            firstname: updatedUser.firstname,
            lastname: updatedUser.lastname,
            email: updatedUser.email,
            role: updatedUser.role,
            yearsofExperience: updatedUser.yearsofExperience,
            worksAt: updatedUser.worksAt
        });
    } catch (err) {
        console.error('Error while updating user profile:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

userRouter.get('/contacts', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id; // Extract user ID from the token
        const user = await User.findById(userId).populate('connections', 'username email role');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user.connections);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

userRouter.post('/contacts/add', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id; // Extract user ID from the token
        const { contactId } = req.body;

        if (!contactId) {
            return res.status(400).json({ msg: 'Contact ID is required' });
        }

        const user = await User.findById(userId);
        const contact = await User.findById(contactId);

        if (!user || !contact) {
            return res.status(404).json({ msg: 'User or contact not found' });
        }

        if (user.connections.includes(contactId)) {
            return res.status(400).json({ msg: 'Contact already added' });
        }

        user.connections.push(contactId);
        contact.connections.push(userId);

        await user.save();
        await contact.save();

        res.json({ msg: 'Contact added successfully' });
    } catch (error) {
        console.error('Error adding contact:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

userRouter.get('/connection-requests', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id; // Extract user ID from the token
        const user = await User.findById(userId).populate('connectionRequests', 'username email role');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user.connectionRequests);
    } catch (error) {
        console.error('Error fetching connection requests:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

userRouter.post('/connection-requests/:id/accept', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id; // Extract user ID from the token
        const requestId = req.params.id;

        const user = await User.findById(userId);
        const requester = await User.findById(requestId);

        if (!user || !requester) {
            return res.status(404).json({ msg: 'User or requester not found' });
        }

        if (!user.connectionRequests.includes(requestId)) {
            return res.status(400).json({ msg: 'Connection request not found' });
        }

        user.connectionRequests = user.connectionRequests.filter(id => id.toString() !== requestId);
        user.connections.push(requestId);
        requester.connections.push(userId);

        await user.save();
        await requester.save();

        res.json({ msg: 'Connection request accepted' });
    } catch (error) {
        console.error('Error accepting connection request:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

userRouter.post('/connection-requests/:id/deny', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id; // Extract user ID from the token
        const requestId = req.params.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!user.connectionRequests.includes(requestId)) {
            return res.status(400).json({ msg: 'Connection request not found' });
        }

        user.connectionRequests = user.connectionRequests.filter(id => id.toString() !== requestId);

        await user.save();

        res.json({ msg: 'Connection request denied' });
    } catch (error) {
        console.error('Error denying connection request:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Fetch all users except the current user
userRouter.get('/users', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id; // Extract user ID from the token
        const users = await User.find({ _id: { $ne: userId } }, 'username email role');

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Send a connection request
userRouter.post('/connection-requests/send', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id; // Extract user ID from the token
        const { recipientId } = req.body;

        if (!recipientId) {
            return res.status(400).json({ msg: 'Recipient ID is required' });
        }

        const user = await User.findById(userId);
        const recipient = await User.findById(recipientId);

        if (!user || !recipient) {
            return res.status(404).json({ msg: 'User or recipient not found' });
        }

        // Check if users are already connected
        if (user.connections.includes(recipientId)) {
            return res.status(400).json({ msg: 'Users are already connected' });
        }

        if (recipient.connectionRequests.includes(userId)) {
            return res.status(400).json({ msg: 'Connection request already sent' });
        }

        recipient.connectionRequests.push(userId);
        await recipient.save();

        res.json({ msg: 'Connection request sent successfully' });
    } catch (error) {
        console.error('Error sending connection request:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Find or create a conversation between two users
userRouter.get('/conversations/:contactId', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const { contactId } = req.params;

        // Sort participant IDs to ensure consistent conversation lookup
        const participants = [userId, contactId].sort();
        
        let conversation = await Conversation.findOne({
            participants: { $all: participants, $size: 2 }
        });

        if (!conversation) {
            try {
                // Create new conversation if it doesn't exist
                conversation = await Conversation.create({
                    participants: participants
                });
            } catch (createError) {
                // If creation fails due to duplicate key, try to find the existing one
                if (createError.code === 11000) {
                    conversation = await Conversation.findOne({
                        participants: { $all: participants, $size: 2 }
                    });
                    if (!conversation) {
                        throw new Error('Failed to create or find conversation');
                    }
                } else {
                    throw createError;
                }
            }
        }

        res.json(conversation);
    } catch (error) {
        console.error('Error finding/creating conversation:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

// Fetch messages for a specific conversation
userRouter.get('/messages/:conversationId', verifyToken, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .populate('sender', 'username')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Send a new message
userRouter.post('/messages', verifyToken, async (req, res) => {
    try {
        const senderId = req.user._id;
        const { conversationId, text, type = 'text', fileUrl } = req.body;

        const newMessage = await Message.create({
            conversationId,
            sender: senderId,
            text,
            type,
            fileUrl,
            read: false
        });

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: text,
            lastMessageTime: new Date()
        });

        const populatedMessage = await Message.findById(newMessage._id)
            .populate('sender', 'username');

        res.json(populatedMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Upload a file (image, video, document) to Cloudinary
userRouter.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
                if (error) {
                    return res.status(500).json({ msg: 'Error uploading file', error });
                }
                res.json({ 
                    msg: 'File uploaded successfully', 
                    url: result.secure_url,
                    public_id: result.public_id 
                });
            }
        );

        // Read the file buffer and pipe it to Cloudinary
        streamifier.createReadStream(file.buffer).pipe(result);

    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Delete a file from Cloudinary
userRouter.delete('/upload', verifyToken, async (req, res) => {
    try {
        const { public_id } = req.body;

        if (!public_id) {
            return res.status(400).json({ msg: 'Public ID is required' });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(public_id);

        res.json({ msg: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// ==================== INVENTORY MANAGEMENT ROUTES ====================

// Get all inventory items (for MRs to manage their catalog)
userRouter.get('/inventory/items', verifyToken, async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { manufacturer: { $regex: search, $options: 'i' } }
            ];
        }

        const items = await InventoryItem.find(query).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Create new inventory item (MR only)
userRouter.post('/inventory/items', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.role !== 'mr') {
            return res.status(403).json({ msg: 'Only Medical Representatives can add inventory items' });
        }

        const newItem = await InventoryItem.create(req.body);
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating inventory item:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update inventory item (MR only)
userRouter.put('/inventory/items/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.role !== 'mr') {
            return res.status(403).json({ msg: 'Only Medical Representatives can update inventory items' });
        }

        const updatedItem = await InventoryItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ msg: 'Inventory item not found' });
        }

        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating inventory item:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Delete inventory item (MR only)
userRouter.delete('/inventory/items/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.role !== 'mr') {
            return res.status(403).json({ msg: 'Only Medical Representatives can delete inventory items' });
        }

        const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);
        
        if (!deletedItem) {
            return res.status(404).json({ msg: 'Inventory item not found' });
        }

        res.json({ msg: 'Inventory item deleted successfully' });
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get orders for a specific conversation
userRouter.get('/inventory/orders/:conversationId', verifyToken, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const orders = await Order.find({ conversationId })
            .populate('doctorId', 'username email')
            .populate('mrId', 'username email')
            .populate('items.inventoryItem')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Create new order
userRouter.post('/inventory/orders', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        const { conversationId, items, deliveryAddress, notes, requiredDate } = req.body;

        console.log('Creating order with data:', { conversationId, items, deliveryAddress, notes, requiredDate });

        // Validate required fields
        if (!conversationId) {
            return res.status(400).json({ msg: 'Conversation ID is required' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ msg: 'At least one item is required' });
        }

        // Validate that all items have inventoryItem and quantity
        for (let item of items) {
            if (!item.inventoryItem || !item.quantity || item.quantity <= 0) {
                return res.status(400).json({ msg: 'All items must have a valid inventory item and quantity greater than 0' });
            }
        }

        // Get conversation to determine participants
        const conversation = await Conversation.findById(conversationId).populate('participants', 'role username');
        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }

        console.log('Conversation participants:', conversation.participants);

        // Find doctor and MR in conversation participants
        const doctor = conversation.participants.find(p => p.role === 'doctor');
        const mr = conversation.participants.find(p => p.role === 'mr');

        console.log('Found doctor:', doctor);
        console.log('Found MR:', mr);

        // If we don't have both roles, we'll still allow the order but assign roles based on current user
        let doctorId, mrId;

        if (doctor && mr) {
            // Ideal case: conversation has both doctor and MR
            doctorId = doctor._id;
            mrId = mr._id;
        } else if (user.role === 'doctor') {
            // Current user is doctor, find any MR in participants or use current user as placeholder
            doctorId = userId;
            mrId = mr ? mr._id : userId; // Use MR if available, otherwise placeholder
        } else if (user.role === 'mr') {
            // Current user is MR, find any doctor in participants or use current user as placeholder
            mrId = userId;
            doctorId = doctor ? doctor._id : userId; // Use doctor if available, otherwise placeholder
        } else {
            // Fallback: use current user for both (this shouldn't happen in normal flow)
            doctorId = userId;
            mrId = userId;
        }

        // Process items and calculate totals
        const processedItems = await Promise.all(items.map(async (item) => {
            const inventoryItem = await InventoryItem.findById(item.inventoryItem);
            if (!inventoryItem) {
                throw new Error(`Inventory item ${item.inventoryItem} not found`);
            }
            
            return {
                inventoryItem: item.inventoryItem,
                itemName: inventoryItem.name,
                quantity: item.quantity,
                unitPrice: inventoryItem.unitPrice,
                totalPrice: item.quantity * inventoryItem.unitPrice
            };
        }));

        // Generate order number manually as backup
        const orderCount = await Order.countDocuments();
        const orderNumber = `ORD-${Date.now()}-${String(orderCount + 1).padStart(4, '0')}`;

        const newOrder = await Order.create({
            orderNumber: orderNumber, // Explicitly set the order number
            doctorId: doctorId,
            mrId: mrId,
            conversationId,
            items: processedItems,
            deliveryAddress: deliveryAddress || '',
            notes: notes || '',
            requiredDate: requiredDate ? new Date(requiredDate) : undefined
        });

        // Create transaction record
        await InventoryTransaction.create({
            orderId: newOrder._id,
            userId: userId,
            transactionType: 'order_placed',
            description: `Order ${newOrder.orderNumber} placed by ${user.username}`
        });

        const populatedOrder = await Order.findById(newOrder._id)
            .populate('doctorId', 'username email')
            .populate('mrId', 'username email')
            .populate('items.inventoryItem');

        console.log('Order created successfully:', populatedOrder);

        res.status(201).json(populatedOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

// Update order status
userRouter.put('/inventory/orders/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.user._id;
        const user = await User.findById(userId);

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Check permissions
        if (!order.doctorId.equals(userId) && !order.mrId.equals(userId)) {
            return res.status(403).json({ msg: 'Not authorized to update this order' });
        }

        // Role-based status update permissions
        if (user.role === 'mr') {
            // MRs can update: pending -> confirmed/cancelled, confirmed -> shipped
            const allowedTransitions = {
                'pending': ['confirmed', 'cancelled'],
                'confirmed': ['shipped', 'cancelled'],
                'shipped': [], // MRs cannot update from shipped
                'delivered': [], // MRs cannot update from delivered
                'received': [] // MRs cannot update from received
            };
            
            if (!allowedTransitions[order.status]?.includes(status)) {
                return res.status(400).json({ 
                    msg: `MRs cannot change order status from ${order.status} to ${status}` 
                });
            }
        } else if (user.role === 'doctor') {
            // Doctors can only mark shipped orders as received
            if (order.status === 'shipped' && status === 'received') {
                // This is allowed
            } else if (order.status === 'pending' && status === 'cancelled') {
                // Doctors can cancel pending orders
            } else {
                return res.status(400).json({ 
                    msg: `Doctors can only mark shipped orders as received or cancel pending orders` 
                });
            }
        }

        order.status = status;
        await order.save();

        // Create transaction record
        const actionDescription = status === 'received' ? 'marked as received' : status;
        await InventoryTransaction.create({
            orderId: order._id,
            userId: userId,
            transactionType: `order_${status}`,
            description: `Order ${order.orderNumber} ${actionDescription} by ${user.username}`
        });

        const populatedOrder = await Order.findById(order._id)
            .populate('doctorId', 'username email')
            .populate('mrId', 'username email')
            .populate('items.inventoryItem');

        res.json(populatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get order by ID
userRouter.get('/inventory/orders/single/:id', verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('doctorId', 'username email')
            .populate('mrId', 'username email')
            .populate('items.inventoryItem');

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Check permissions
        const userId = req.user._id;
        if (!order.doctorId._id.equals(userId) && !order.mrId._id.equals(userId)) {
            return res.status(403).json({ msg: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get user's orders (both as doctor and MR)
userRouter.get('/inventory/orders/user', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, page = 1, limit = 10 } = req.query;

        let query = {
            $or: [
                { doctorId: userId },
                { mrId: userId }
            ]
        };

        if (status && status !== 'all') {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('doctorId', 'username email')
            .populate('mrId', 'username email')
            .populate('items.inventoryItem')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        res.json({
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// =====================================================
// SHARED VIDEO TRACKING ROUTES
// =====================================================

// Initialize video tracking when receiver first opens a shared video
userRouter.post("/video/initialize", verifyToken, async (req, res) => {
    try {
        const { messageId, videoUrl, duration } = req.body;
        const userId = req.user.id;

        // Get the message to find sender and conversation
        const message = await Message.findById(messageId)
            .populate('conversationId');
        
        if (!message) {
            return res.status(404).json({ msg: 'Message not found' });
        }

        // Verify user is part of the conversation
        const conversation = await Conversation.findById(message.conversationId);
        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ msg: 'Not authorized to view this video' });
        }

        // Check if tracking already exists
        let tracking = await SharedVideoTracking.findOne({
            messageId,
            receiverId: userId,
            conversationId: message.conversationId
        });

        if (!tracking) {
            // Create new tracking record
            tracking = new SharedVideoTracking({
                messageId,
                senderId: message.sender,
                receiverId: userId,
                conversationId: message.conversationId,
                videoUrl,
                duration,
                firstWatchedAt: new Date()
            });
        } else {
            // Update duration if it changed
            tracking.duration = duration;
        }

        await tracking.save();

        res.json({
            msg: 'Video tracking initialized',
            tracking: {
                currentTime: tracking.currentTime,
                watchPercentage: tracking.watchPercentage,
                isCompleted: tracking.isCompleted
            }
        });
    } catch (error) {
        console.error('Error initializing video tracking:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update video progress (called every 5 seconds while watching)
userRouter.put("/video/progress", verifyToken, async (req, res) => {
    try {
        const { messageId, currentTime, duration } = req.body;
        const userId = req.user.id;

        const tracking = await SharedVideoTracking.findOne({
            messageId,
            receiverId: userId
        });

        if (!tracking) {
            return res.status(404).json({ msg: 'Video tracking not found' });
        }

        // Update progress
        tracking.currentTime = Math.max(tracking.currentTime, currentTime); // Only move forward
        tracking.duration = duration;
        tracking.lastWatchedAt = new Date();
        tracking.totalWatchTime += 5; // Assuming 5-second intervals
        tracking.viewCount += 1;

        await tracking.save();

        res.json({
            msg: 'Progress updated',
            watchPercentage: tracking.watchPercentage,
            isCompleted: tracking.isCompleted
        });
    } catch (error) {
        console.error('Error updating video progress:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get video tracking info for both sender and receiver
userRouter.get("/video/tracking/:messageId", verifyToken, async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        // Get the message to verify access
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ msg: 'Message not found' });
        }

        // Verify user is sender or receiver
        const conversation = await Conversation.findById(message.conversationId);
        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Get tracking info
        const tracking = await SharedVideoTracking.findOne({
            messageId
        }).populate('senderId', 'username firstname lastname')
          .populate('receiverId', 'username firstname lastname');

        if (!tracking) {
            return res.json({
                msg: 'No tracking data available',
                tracking: null
            });
        }

        // Return different data based on user role
        const isSender = tracking.senderId._id.toString() === userId;
        const isReceiver = tracking.receiverId._id.toString() === userId;

        const responseData = {
            messageId: tracking.messageId,
            videoUrl: tracking.videoUrl,
            watchPercentage: tracking.watchPercentage,
            isCompleted: tracking.isCompleted,
            lastWatchedAt: tracking.lastWatchedAt,
            firstWatchedAt: tracking.firstWatchedAt,
            sender: {
                id: tracking.senderId._id,
                username: tracking.senderId.username,
                name: `${tracking.senderId.firstname} ${tracking.senderId.lastname}`
            },
            receiver: {
                id: tracking.receiverId._id,
                username: tracking.receiverId.username,
                name: `${tracking.receiverId.firstname} ${tracking.receiverId.lastname}`
            }
        };

        // Add additional data for receiver
        if (isReceiver) {
            responseData.currentTime = tracking.currentTime;
            responseData.duration = tracking.duration;
            responseData.totalWatchTime = tracking.totalWatchTime;
        }

        res.json({
            msg: 'Tracking data retrieved',
            tracking: responseData,
            userRole: isSender ? 'sender' : 'receiver'
        });
    } catch (error) {
        console.error('Error getting video tracking:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get all video tracking stats for a conversation (for analytics)
userRouter.get("/video/conversation/:conversationId", verifyToken, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        // Verify user is part of the conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const trackingData = await SharedVideoTracking.find({
            conversationId
        }).populate('senderId', 'username firstname lastname')
          .populate('receiverId', 'username firstname lastname')
          .populate('messageId', 'createdAt')
          .sort({ createdAt: -1 });

        res.json({
            msg: 'Conversation video tracking retrieved',
            trackingData
        });
    } catch (error) {
        console.error('Error getting conversation video tracking:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get videos sent by user (sender's dashboard)
userRouter.get("/video/sent", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const sentVideos = await SharedVideoTracking.find({
            senderId: userId
        }).populate('receiverId', 'username firstname lastname')
          .populate('conversationId')
          .populate('messageId', 'createdAt')
          .sort({ createdAt: -1 });

        res.json({
            msg: 'Sent videos tracking retrieved',
            sentVideos
        });
    } catch (error) {
        console.error('Error getting sent videos:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get videos received by user (receiver's dashboard)
userRouter.get("/video/received", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const receivedVideos = await SharedVideoTracking.find({
            receiverId: userId
        }).populate('senderId', 'username firstname lastname')
          .populate('conversationId')
          .populate('messageId', 'createdAt')
          .sort({ lastWatchedAt: -1 });

        res.json({
            msg: 'Received videos tracking retrieved',
            receivedVideos
        });
    } catch (error) {
        console.error('Error getting received videos:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});
