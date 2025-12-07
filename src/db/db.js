const mongoose=require('mongoose')

async function connectToDb(){
    await mongoose.connect(process.env.MONGO_URI)

  try{
    console.log("Connected to db");
    
  }catch(err){
    console.error("Error Connecting to Db", err)
  }
    
}

module.exports=connectToDb