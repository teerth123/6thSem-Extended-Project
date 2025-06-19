import dotevn from "dotenv"
dotevn.config()
import express from "express"
import jwt from "jsonwebtoken"
import {User} from "../Database model/userDB.js"
import { verifyToken } from "../middleware/verifyToken.js"
const secret= process.env.secret
export const userRouter = express.Router()


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
