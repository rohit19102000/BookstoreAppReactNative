import express from 'express'
import User from '../models/User.js';
import jwt from 'jsonwebtoken';


const router= express.Router();

const generateToken = (userId)=>{
    console.log(process.env.JWT_SECRET)
   return jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"15d"})
}






router.post("/register", async (req,res)=>{
    try {
        const {email,username,password } = req.body ;

        if(!username || !email || !password){
            return res.status(400).json({message:"All fields are required "})
        } 


        if(password.length < 6){
            return res.status(400).json({message:"password should be atleast 6 characters long "});
        }
        if(username.length < 3){
            return res.status(400).json({message:"username should be atleast 3 characters long "});
        }
        

        // check if user already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
        }


        const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`

        const user = new User ({
            email,
            username,
            password,
            profileImage,
        })

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user:{
                _id:user._id,
                username:user.username,
                email:user.email,
                profileImage:user.profileImage
            }
        })

    } catch (err) {
        console.error("error in register route",err);
        res.status(500).json({message: "Internal server error"});
    }
    
})


router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password)
        return res.status(400).json({ message: "All fields are required" });
  
      // check if user exists
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Invalid credentials" });
  
      // check if password is correct
      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect)
        return res.status(400).json({ message: "Invalid credentials" });
  
      // generate token
      const token = generateToken(user._id);
  
      res.status(200).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
        },
      });
    } catch (error) {
      console.log("Error in login route", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

export default router

// TEx7d9WQF9LwR0vH