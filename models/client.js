const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const ClientSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

ClientSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Client', ClientSchema)