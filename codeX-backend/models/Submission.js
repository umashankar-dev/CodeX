const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
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
        enum: ['Pending','Accepted','Wrong Answer','Time limit Exceeded','Compilation Error'],
        default: 'Pending',
    },
    judge0Token: {
        type: String,
    },
},{timestamps:true});

const Submission = mongoose.model('Submission',submissionSchema);
module.exports = Submission;