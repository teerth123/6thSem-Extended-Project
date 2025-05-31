import mongoose from "mongoose";
import mongodb_url from process.env.mongodb_url
import { Schema, model } from "mongoose";

mongoose.connect(mongodb_url)

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
    uniqueKey :{
        type:String,
        required:true
    }, 
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
    }
})


  const User = new model('User', userSchema)

  exports.default = {User}