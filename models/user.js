const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },

});

userSchema.plugin(passportLocalMongoose); // by using this plugin out mongoose will automatically adds username, hashing and salting of password

module.exports = mongoose.model('User', userSchema);