const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const querySchema = new Schema({
  name: {
    type: String,
    // required: true,
    trim: true
  },
  email: {
    type: String,
    // required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    // required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  responseMessage: {
    type: String,
    trim: true
  },
  respondedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const Query = mongoose.model('Query', querySchema);
module.exports = Query;