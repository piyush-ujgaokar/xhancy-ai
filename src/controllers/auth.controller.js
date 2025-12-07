const userModel=require('../models/user.model')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')

async function registerUser(req,res){
    const {fullName:{firstName,lastName},email,password}=req.body

    const isUserAlreadyExists=await userModel.findOne({email})

    if(isUserAlreadyExists){
        res.status(400).json("User Already Exists")
    }


   const hashPassword=await bcrypt.hash(password,10);

    const user=await userModel.create({
        fullName:{
            firstName,lastName
        },
        email,
        password:hashPassword
    })

    const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
    res.status(201).json({user,token})
    
    res.cookie("token",token)
    res.status(200).json({
        message:"User registered Successfully",
        user:{
            email:user.email,
            _id:user._id,
            fullName:user.fullName,
        }
    })
}


module.exports={
    registerUser
}