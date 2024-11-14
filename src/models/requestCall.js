const mongoose = require('mongoose')

const requestCallSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    phone: {
        type: String,
        required: [true, "Phone is required"]
    },
    status: {
        type: String,
        enum: ["awaiting outreach", "reached out", "converted to lead", "conversion unsuccessful"],
        default: "awaiting outreach"
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

module.exports = mongoose.model('requestCall', requestCallSchema)
