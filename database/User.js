const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    unique_id: { type: Number },
    fusername: {
        type: String,
        required: true
    },

    lusername: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    }
})

UserSchema.pre('save', function(next) {
    const user = this

    bcrypt.hash(user.password, 10, function(error, encrypted) {
        user.password = encrypted
        next()
    })
})
const User = mongoose.model('User', UserSchema);
module.exports = User;