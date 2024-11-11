const mongoose = require('mongoose')

const requestCallSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    phone: {
        type: String,
        required: [true, "Phone is required"]
    }
}, { timestamps: true })

module.exports = mongoose.model('requestCall', requestCallSchema)
