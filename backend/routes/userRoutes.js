import express from "express"
import jwt, { verify } from "jsonwebtoken"
import secret from process.env.secret
import User from "../Database model/userDB"

const userRouter = express.Router()


userRouter.post("/signin", async (req, res) => {
    const { username, firstname, lastname, email, password, role, yearsofExperience, shortBio, worksAt } = req.body

    try {
        const check = await User.findOne({ email: email })

        if (check) {
            res.json({
                msg: "user already exists"
            })
        } else {

            const newUser = await User.create({ username, firstname, lastname, email, password, role, yearsofExperience, shortBio, worksAt })
            const token = jwt.sign(email, secret, { expiresIn: "30d" })
            res.json({
                token
            })
        }
    } catch {
        console.error("error while signing in")
    }

})

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email })
        if (user && user.password === password) {
            const token = jwt.sign(email, secret, { expiresIn: "30d" })
            res.json({
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
        const user = await User.findById({userid})
        if(user){
            res.json(
                user.username,
                user.firstname,
                user.lastname,
                user.email,
                user.role,
                user.yearsofExperience,
                user.worksAt,
            )
        }
    }catch{
        console.error("error while finding profile info")
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


exports.default = {userRouter}