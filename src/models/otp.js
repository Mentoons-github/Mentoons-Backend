const mongoose = require('mongoose');

const phoneRegex = /^\d{10,15}$/; 
const countryCodeRegex = /^\+[1-9]{1}[0-9]{1,3}$/;
const otpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function(phone) {
                return phoneRegex.test(phone); 
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    countryCode: {
        type: String,
        required: [true, 'Country code is required'],
        validate: {
            validator: function(cc) {
                return countryCodeRegex.test(cc);             },
            message: props => `${props.value} is not a valid country code!`
        }
    },
    otp: { 
        type: String, 
        required: true,
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 600,
    }
});

module.exports = mongoose.model('OTP', otpSchema);
