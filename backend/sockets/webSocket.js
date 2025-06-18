import { json } from "express";
import jwt from "jsonwebtoken"
import * as dotenv from "dotenv"
dotenv.config()
const secret = process.env.secret

export function setupWSS(wss){
    wss.on("connection", (socket, req)=>{
        console.log("new user connected")
        
        socket.on("message", async(raw)=>{
            let userID;
            try{
                const data = json.parse(raw)
                const {type, payload} = data

                if(type=="message"){
                    const {sender, reciever, message} = payload
                    
                }
            }catch(e){

            }
        })
    })
}