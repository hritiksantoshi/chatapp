const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const UserModel = new Schema({
    email: {
        type: String, index: true, required: true
    },
    username: {
        type: String, index: true, required: true
    },
    password: {
        type: String, index: true, required: true
    },
    loggedIn:{
        type:Boolean,
        require:true
    },
    createdOn: { type: Date, default: new Date() },
    updatedOn: { type: Date, default: new Date() }
});

module.exports = mongoose.model('users', UserModel);