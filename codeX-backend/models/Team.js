const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
    teamname:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user',
    }
});

const Team = mongoose.model('Team',teamSchema);
module.exports = Team;