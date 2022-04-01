const mongoose = require('mongoose');


main().catch(err => console.log(err));

async function main() { await mongoose.connect(process.env['DB'], { useNewUrlParser: true });
}


const StonkSchema = new mongoose.Schema({
  stonkName : {type: String, required: true},
  fans : Array,
  likes : Number
})

module.exports = mongoose.model("Stonk",StonkSchema)