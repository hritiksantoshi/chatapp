const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const MsgModel = new Schema({
    text: {
        type: String,  required: true
    },
    time:{
        type: String,  required: true
    },
    senderId: {
        type: Schema.Types.ObjectId,ref:'users', required: true
    },
    recieverId: {
        type: Schema.Types.ObjectId,ref:'users',required: true
    },
    createdOn: { type: Date, default: new Date() }
});

module.exports = mongoose.model('messages', MsgModel);