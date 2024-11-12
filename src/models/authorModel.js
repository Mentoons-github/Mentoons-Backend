const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    image: {
        type: String,
        required: [true, "Image is required"]
    },
}, {timestamps: true})

module.exports = mongoose.model("Author", authorSchema)
