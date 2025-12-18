const userModel=require('../models/user.model')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')

async function registerUser(req,res){
    const {fullName:{firstName,lastName},email,password}=req.body

    const isUserAlreadyExists=await userModel.findOne({email})

    if(isUserAlreadyExists){
       return res.status(400).json({message:"User Already Exists"})
    }


   const hashPassword=await bcrypt.hash(password,10);

    const user=await userModel.create({
        fullName:{
            firstName,lastName
        },
        email,
        password:hashPassword
    })

    const token=jwt.sign({id:user._id},process.env.JWT_SECRET, { expiresIn: "7d" })
    
   res.cookie("token", token, {
    httpOnly: true,
    secure: true,        // REQUIRED on Render (HTTPS)
    sameSite: "none",    // REQUIRED for cross-origin
    maxAge: 7 * 24 * 60 * 60 * 1000
});
    res.status(200).json({
        message:"User registered Successfully",
        user:{
            email:user.email,
            _id:user._id,
            fullName:user.fullName,
        }
    })
}

async function loginUser(req,res){

    const {email,password}=req.body;

    const user=await userModel.findOne({
        email
    })

    if(!user){
       return res.status(400).json({
            message:"Invalid Email & Password"
        })
    }

    const isPasswordValid=await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
       return res.status(400).json({
            message:"Invalid Email or Password"
        })
    }

    const token=jwt.sign({id:user._id},process.env.JWT_SECRET, { expiresIn: "7d" })

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,        // REQUIRED on Render (HTTPS)
    sameSite: "none",    // REQUIRED for cross-origin
    maxAge: 7 * 24 * 60 * 60 * 1000
});

    res.status(200).json({
        message:"User Login Successfully",
        user:{
            email:user.email,
            _id:user._id,
            fullName:user.fullName
        }
    })

}

module.exports={
    registerUser,
    loginUser
}