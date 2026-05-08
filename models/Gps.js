const mongoose = require('mongoose');

const GpsSchema = new mongoose.Schema({
  busId: {
    type: String,
    default: 'BUS-001'
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Gps', GpsSchema);
