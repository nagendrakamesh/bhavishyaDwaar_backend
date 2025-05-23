require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser : true,
    useUnifiedTopology : true
}, (err) => {
    if(err){
        console.log(err);
    }
    else{
        console.log("MongoDB connected Successfully!");
    }
});