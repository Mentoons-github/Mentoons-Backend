const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workshopEnquiriesSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    age: {
        type: String,
        required: [true, "Age is required"],
    },
    guardianName: {
        type: String,
        required: [true, "Guardian's name is required"],
    },
    guardianContact: {
        type: String,
        required: [true, "Guardian's phone no is required"],
    },
    guardianEmail: {
        type: String,
        required: [true, "Guardian's email is required!"],
    },
    city: {
        type: String,
        lowercase: true,
        required: [true, "City is required"],
    },
    duration:{
        type: String,
        required: [true, "Duration is required"],
        enum: ["2days", "6months", "12months"],
    },
    workshop:{
        type:String,
        enum:['6-12','13-19','20+','Parents'],
        required:[true,"Workshop is required"]
    }
},
{timestamps:true}
);

module.exports = mongoose.model('workshopEnquiries', workshopEnquiriesSchema);