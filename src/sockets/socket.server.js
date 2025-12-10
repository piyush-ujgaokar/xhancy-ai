const {Server}=require("socket.io")
const cookie=require('cookie')
const jwt=require('jsonwebtoken')
const userModel = require("../models/user.model")
const aiService=require('../service/ai.service')
const messageModel=require('../models/message.model')


function initSocketServer(httpServer){

    const io=new Server(httpServer,{})

    io.use(async (socket,next)=>{

        const cookies=cookie.parse(socket.handshake.headers?.cookie || "");

        if(!cookies){
            next(new Error("Authentication Error:No token provided"))
        }

       try{

         const decoded=jwt.verify(cookies.token,process.env.JWT_SECRET)

         const user=await userModel.findById(decoded.id)

         socket.user=user

         next()



       }catch(err){
        next(new Error("Authentication Error: Invalid Token"))
       } 

    })

    io.on("connection", (socket)=>{
        console.log("User connected successfully:", socket.user?.email);
        socket.on('ai-message',async (messagePayLoad)=>{

            await messageModel.create({
                chat:messagePayLoad.chat,
                user:socket.user._id,
                content:messagePayLoad.content,
                role:"user"
            })

            const chatHistory=await messageModel.find({
                chat:messagePayLoad.chat
            })
                       

            const response=await aiService.generateResponse(chatHistory.map(item=>{
                return {
                    role:item.role,
                    parts:[{text:item.content}]
                }
            }).sort({createdAt:-1}).limit(4).lean()).reverse()

            await messageModel.create({
                chat:messagePayLoad.chat,
                user:socket.user._id,
                content:response,
                role:"model"
            })

            socket.emit('ai-response',{
                content:response,
                chat:messagePayLoad.chat
            })
        
        // console.log(messagePayLoad);
            
           
        })

    })

}



module.exports=initSocketServer