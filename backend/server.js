import express from "express"
import cors from "cors"
import {userRouter} from "./routes/userRoutes.js"

const app = express()
app.use(express.json())
app.use(cors())
app.use("/backend/v1", userRouter)

app.listen(3000, ()=>{
    console.log("server running on 3000")
})  