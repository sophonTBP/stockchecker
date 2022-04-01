const mongoose = require('mongoose');
require('dotenv').config();
main().catch(err => console.log(err));

async function main() { await mongoose.connect(process.env['DB'],{ useNewUrlParser: true });
}


//mongoose.set('useCreateIndex', true);

const UserSchema = new mongoose.Schema({

userID :  {type: String, required: true} ,
likedStonks :  Array 
//userSoftware : String
});




module.exports = mongoose.model('User', UserSchema)