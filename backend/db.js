const mongoose = require('mongoose');
const mongoURL = "mongodb://localhost:27017/inotebook"

const connectToMongo = () =>{
    mongoose.connect(mongoURL, ()=>{
        console.log("Connect to Mongo Successfully")
    })
}

module.exports = connectToMongo;