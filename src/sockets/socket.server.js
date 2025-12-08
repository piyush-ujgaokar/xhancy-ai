const {Server}=require("socket.io")
const cookie=require('cookie')
const jwt=require('jsonwebtoken')
const userModel = require("../models/user.model")
const aiService=require('../service/ai.service')



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
        socket.on('ai-message',async (messagePayload)=>{
            console.log("Event received!");
            // const response=await aiService.generateResponse(messagePayLoad.content)

            // socket.emit('ai-response',{
            //     content:response,
            //     chat:messagePayLoad.chat
            // })
        
        console.log(messagePayload);
            
           
        })

    })

}



module.exports=initSocketServer