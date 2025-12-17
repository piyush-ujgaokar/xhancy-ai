const express=require('express')
const authMiddleware=require('../middlewares/auth.middlware')
const chatController=require('../controllers/chat.controller')

const router=express.Router()

router.post('/',authMiddleware.authUser,chatController.createChat)

router.get('/',authMiddleware.authUser,chatController.getChats)


module.exports=router

