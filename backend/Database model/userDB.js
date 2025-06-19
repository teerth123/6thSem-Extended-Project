import mongoose from "mongoose";
import dotenv from "dotenv"
import { Schema, model } from "mongoose";
dotenv.config()
const mongodb_url = process.env.mongodb_url
const connected = mongoose.connect(mongodb_url).then(()=>{console.log("connected to DB")})

const userSchema = new Schema({
    username:{
        type:String,
        required:true
    }, 
    firstname:{
        type:String,
        required:true
    }, 
    lastname:{
        type:String,
        required:true
    }, 
    email:{
        type:String,
        required:true
    }, 
    password:{
        type:String,
        required:true
    }, 
    role:{
        type:String,
        required:true
    },
    // uniqueKey :{
    //     type:String,
    //     required:true
    // }, 
    yearsofExperience:{
        type:Number,
        required:true
    },
    shortBio:String,
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    }],
    pendingConnections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    worksAt:{
        type:String,
        required:true
    },
    connectionRequests: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },
})


  export const User = new model('User', userSchema)

