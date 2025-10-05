const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    teamname: {
        type: String,
        required: true,
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Problem',
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    languageId: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: 'In queue',
    },
    verdict: {
        type: String,
    },
    executionTime: {
        type: Number,
    },
    memory: {
        type: Number,
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    judge0Token: {
        type: String,
    },
},);

const Submission = mongoose.model('Submission',submissionSchema);
module.exports = Submission;