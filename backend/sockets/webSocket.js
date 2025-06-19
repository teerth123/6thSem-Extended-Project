import { Message } from "../Database model/messageDB.js";
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
                    if (!receiverId) return;

                    const newMsg = await Message.create({
                        conversationId,
                        sender: senderId,
                        text,
                        type: msgType || "text",
                        fileUrl,
                        read: false
                    });

                    // Send to all sockets of sender and receiver
                    for (let [sock, uid] of clients.entries()) {
                        if (
                            uid.toString() === receiverId.toString() ||
                            uid.toString() === senderId.toString()
                        ) {
                            sock.send(
                                JSON.stringify({
                                    type: "new-message",
                                    payload: newMsg
                                })
                            );
                        }
                    }
                }
            } catch (e) {
                console.error("WebSocket error:", e.message);
            }
        });

        socket.on("close", () => {
            clients.delete(socket);
            console.log("Client disconnected");
        });
    });
}