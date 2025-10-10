const mongoose = require('mongoose');

const responderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Responder name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Responder phone is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Police', 'Medical', 'Fire', 'Tourist Police', 'Emergency Services'],
    default: 'Emergency Services'
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  responseTime: {
    type: Number,
    default: 15 // minutes
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Responder', responderSchema);

