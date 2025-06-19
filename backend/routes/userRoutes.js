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
                token
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
                token
            })
        }
    } catch {
        console.error("error while logging in")
    }

})

userRouter.get(`/user/:id/profile`, async(req , res)=>{
    const userid = req.params.id  //get user from url
    try{
        const user = await User.findById(userid)
        if(user){
            res.json({
                username:user.username,
                firstname:user.firstname,
                lastname:user.lastname,
                email:user.email,
                role:user.role,
                yearsofExperience:user.yearsofExperience,
                worksAt:user.worksAt,
            })
        }
    }catch(e){
        console.error(e+" error while finding profile info")
    }
})

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
