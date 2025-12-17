const {Server}=require("socket.io")
const cookie=require('cookie')
const jwt=require('jsonwebtoken')
const userModel = require("../models/user.model")
const aiService=require('../service/ai.service')
const messageModel=require('../models/message.model')
const {createMemory,queryMemory}=require('../service/vector.service')


function initSocketServer(httpServer){

    const io=new Server(httpServer, {
        cors:{
            origin:"http://localhost:5173",
            allowedHeaders:["Content-Type","Authorization"],
            credentials:true
        }
    })

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
        
            /*
           const message= await messageModel.create({
                chat:messagePayLoad.chat,
                user:socket.user._id,
                content:messagePayLoad.content,
                role:"user"
            })

            const vectors=await aiService.generateVector(messagePayLoad.content)
            */

            const [message,vectors]=await Promise.all([
                messageModel.create({
                chat:messagePayLoad.chat,
                user:socket.user._id,
                content:messagePayLoad.content,
                role:"user"
            }),

            aiService.generateVector(messagePayLoad.content),
            ])

            await createMemory({
                vectors,
                messageId:message._id,
                metadata:{
                    chat:messagePayLoad.chat ,
                    user:socket.user._id,
                    text:messagePayLoad.content
                }

            })

            
            /*
            const memory=await queryMemory({
                queryVector:vectors,
                limit:3,
                metadata:{
                    user:socket.user._id
                }
            })
            
            const chatHistory=(await messageModel.find({
                chat:messagePayLoad.chat
            }).sort({createdAt:-1}).limit(4).lean()).reverse()
            */

            const[memory,chatHistory]=await Promise.all([
                queryMemory({
                queryVector:vectors,
                limit:3,
                metadata:{
                    user:socket.user._id
                }
            }),
            messageModel.find({
                chat:messagePayLoad.chat
            }).sort({createdAt:-1}).limit(4).lean().then(messages => messages.reverse())
            ])
                       
            const stm=chatHistory.map(item=>{ //stm=> short term memory
                return {
                    role:item.role,
                    parts:[{text:item.content}]
                }
            })

            const ltm=[
                {
                    role:'user',
                    parts:[{text:`
                            these are some previous messages from the chat, use them to generate response
                            ${memory.map(item=> item.metadata.text).join('\n')}

                        `}]
                }
            ]
            console.log(ltm[0]);
            console.log(stm);
            

            const response=await aiService.generateResponse([...ltm,...stm])
            
            /*
            const responseMessage=  await messageModel.create({
                chat:messagePayLoad.chat,
                user:socket.user._id,
                content:response,
                role:"model"
                })  
            const responseVectors=await aiService.generateVector(response)
            */

            socket.emit('ai-response',{
                content:response,
                chat:messagePayLoad.chat
            })

              const [responseMessage,responseVectors]=await Promise.all([
                    messageModel.create({
                chat:messagePayLoad.chat,
                user:socket.user._id,
                content:response,
                role:"model"
                }) ,
                aiService.generateVector(response)
            ])

            await createMemory({
                vectors:responseVectors,
                messageId:responseMessage._id,
                metadata:{
                    chat:messagePayLoad.chat,
                    user:socket.user._id,
                    text:response
                }
            })
        
        // console.log(messagePayLoad);
            
           
        })

    })

}



module.exports=initSocketServer