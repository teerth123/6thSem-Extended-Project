import { Message } from "../Database model/messageDB.js";
import { Conversation } from "../Database model/conversationDB.js";
import { User } from "../Database model/userDB.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.secret;
const clients = new Map(); // socket -> userId

export function setupWSS(wss) {
    wss.on("connection", async (socket) => {
        console.log("New user connected");

        socket.on("message", async (raw) => {
            try {
                const data = JSON.parse(raw);
                const { type, payload } = data;

                if (type === "auth") {
                    const { token } = payload;
                    const decoded = jwt.verify(token, secret);
                    const user = await User.findById(decoded._id);
                    
                    if (user) {
                        clients.set(socket, user._id);
                        console.log(`${user.username} authenticated`);
                        socket.send(JSON.stringify({
                            type: "auth-success",
                            payload: { message: "Authentication successful" }
                        }));
                    } else {
                        console.log("User not found");
                        socket.close();
                    }
                }

                if (type === "message") {
                    const senderId = clients.get(socket);
                    if (!senderId) {
                        console.log("Unauthenticated sender");
                        return;
                    }

                    const { conversationId, receiverId, text, type: msgType, fileUrl } = payload;
                    if (!conversationId || (!text && !fileUrl)) {
                        console.log("Missing required fields");
                        return;
                    }

                    const newMsg = await Message.create({
                        conversationId,
                        sender: senderId,
                        text: text || '',
                        type: msgType || "text",
                        fileUrl: fileUrl || undefined,
                        read: false
                    });

                    // Update conversation's last message
                    const lastMessage = msgType === 'text' ? text : `Sent a ${msgType}`;
                    await Conversation.findByIdAndUpdate(conversationId, {
                        lastMessage: lastMessage,
                        lastMessageTime: new Date()
                    });

                    // Populate the message with sender info
                    const populatedMsg = await Message.findById(newMsg._id).populate('sender', 'username');

                    // Send to all sockets of participants in this conversation
                    const conversation = await Conversation.findById(conversationId);
                    for (let [sock, uid] of clients.entries()) {
                        if (conversation.participants.some(p => p.toString() === uid.toString())) {
                            sock.send(
                                JSON.stringify({
                                    type: "new-message",
                                    payload: populatedMsg
                                })
                            );
                        }
                    }
                }
            } catch (e) {
                console.error("WebSocket error:", e.message);
                socket.send(JSON.stringify({
                    type: "error",
                    payload: { message: e.message }
                }));
            }
        });

        socket.on("close", () => {
            clients.delete(socket);
            console.log("Client disconnected");
        });
    });
}