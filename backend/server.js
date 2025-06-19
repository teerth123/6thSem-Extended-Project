import express from "express"
import cors from "cors"
import {userRouter} from "./routes/userRoutes.js"
import http from "http"
import  { WebSocketServer }  from "ws"
import { setupWSS } from "./sockets/webSocket.js"

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({server})

app.use(express.json())
app.use(cors())
app.use("/backend/v1", userRouter)
setupWSS(wss)

server.listen(3000, ()=>{
    console.log("server running on 3000")
})  