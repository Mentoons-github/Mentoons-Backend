const mongoose = require('mongoose');
const jobApplicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email']
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    portfolioLink: {
        type: String,
        required: [true, 'Please add a Portfolio Link']
    },
    gender: {
        type: String,
        required: [true, 'Please add a gender']
    },
    coverNote: {
        type: String,
        required: [true, 'Please add a cover note']
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: [true, 'Please add a job id']
    },
    coverLetter: {
        type: String,
        required: [true, 'Please add a cover letter']
    },
    resume: {
        type: String,
        required: [true, 'Please add a resume']
    },
}, { timestamps: true });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
module.exports = JobApplication;
