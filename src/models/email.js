const mongoose = require('mongoose')
const validator = require('validator')

const emailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is Requied'],
        minlength: [3, 'Name should be more than 3 characters'],
        maxlength: [50, 'Name should be more than 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is Requied'],
        validate: {
            validator: validator.isEmail,
            message: 'Use a valid email',
        }
    },
    phone: {
        type: String,
        required: [true, 'Phone Number is required'],
        validator: function (value) {
            return validator.isMobilePhone(value, 'en-IN');
        },
        message: 'Please provide a valid phone number'
    },
    message: {
        type: String,
        maxlength: [500, 'Message cannot be more than 500 characters'],

    },
})


const Email = mongoose.model('Email', emailSchema)

module.exports = Email