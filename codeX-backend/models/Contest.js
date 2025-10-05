const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        unique: true,
    },
    contestKey:{
        type:String,
        required: true,
        unique: true,
    },
    startTime:{
        type:Date,
        required:true,
    },
    duration: {
        type:Number,
        required:true,
    },
    problems:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
    }]
});
const Contest = mongoose.model('Contest',contestSchema);
module.exports = Contest;