const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const Connection = ()=>{
     mongoose.set('strictQuery', true);

  mongoose.connect(MONGODB_URI,{useUnifiedTopology : true,useNewUrlParser: true})
  .then(()=>console.log("connection successfull .."))
  .catch((err)=>console.log("error is",err));

}

Connection();

// Models
require('./Category');
require('./recipe');
