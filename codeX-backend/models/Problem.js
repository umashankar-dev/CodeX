const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
    contestId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Contest',
        required: true,
    },
    problemLetter:{
        type:String,
        required: true,
    },
    title:{
        type:String,
        required: true,
    },
    description:{
        type:String,
        required:true,
    },
    constraints:{
        type:String,
        required:true,
    },
    sampleTestCases:[{
        input:{
            type:String,
            required:true,
        },
        output:{
            type:String,
            required:true,
        }
    }],
    hiddenTestCases:[{
        input:{
            type:String,
            required:true,
        },
        output:{
            type:String,
            required:true,
        }
    }],
    score:{
        type: Number,
        required:true,
    },
});
problemSchema.index({ contestId: 1, problemLetter: 1 }, { unique: true });
const Problem = mongoose.model('Problem',problemSchema);
module.exports = Problem;