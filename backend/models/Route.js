const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeNumber: {
    type: String,
    required: [true, 'Route number is required'],
    trim: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusStop',
    required: [true, 'Origin stop is required']
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusStop',
    required: [true, 'Destination stop is required']
  },
  via: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusStop'
  }],
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: 0
  },
  estimatedTime: {
    type: Number, // in minutes
    required: [true, 'Estimated time is required'],
    min: 0
  },
  fare: {
    type: Number,
    default: 0
  },
  frequency: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  operator: {
    type: String,
    default: 'TNSTC'
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for faster queries
routeSchema.index({ from: 1, to: 1 });

module.exports = mongoose.model('Route', routeSchema);