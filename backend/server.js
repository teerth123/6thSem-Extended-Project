import express from "express"
import jwt from "jsonwebtoken"
import cors from "cors"
import {userRouter} from "./routes/userRoutes"

const app = express()
app.use(cors())
app.use("backend/v1", userRouter)

app.listen(3000, ()=>{
    console.log("server running on 3000")
})  