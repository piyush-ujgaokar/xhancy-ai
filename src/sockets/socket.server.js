const {Server}=require("socket.io")
const cookie=require('cookie')
const jwt=require('jsonwebtoken')
const userModel = require("../models/user.model")
const aiService=require('../service/ai.service')
const messageModel=require('../models/message.model')
const {createMemory,queryMemory}=require('../service/vector.service')


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

           const message= await messageModel.create({
                chat:messagePayLoad.chat,
                user:socket.user._id,
                content:messagePayLoad.content,
                role:"user"
            })

            const vectors=await aiService.generateVector(messagePayLoad.content)
            
            await createMemory({
                vectors,
                messageId:message._id,
                metadata:{
                    chat:messagePayLoad.chat ,
                    user:socket.user._id,
                }

            })
            


            const chatHistory=(await messageModel.find({
                chat:messagePayLoad.chat
            }).sort({createdAt:-1}).limit(4).lean()).reverse()
                       

            const response=await aiService.generateResponse(chatHistory.map(item=>{
                return {
                    role:item.role,
                    parts:[{text:item.content}]
                }
            }))

          const responseMessage=  await messageModel.create({
                chat:messagePayLoad.chat,
                user:socket.user._id,
                content:response,
                role:"model"
            })  

            const responseVectors=await aiService.generateVector(response)
            await createMemory({
                vectors:responseVectors,
                messageId:responseMessage._id,
                metadata:{
                    chat:messagePayLoad.chat,
                    user:socket.user._id
                }
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