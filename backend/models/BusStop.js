const mongoose = require('mongoose');

const busStopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Bus stop name is required'],
    trim: true
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: -180,
    max: 180
  },
  landmark: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['bus-stand', 'bus-stop', 'terminus'],
    default: 'bus-stop'
  }
}, { timestamps: true });

module.exports = mongoose.model('BusStop', busStopSchema);