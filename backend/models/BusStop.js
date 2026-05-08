const mongoose = require('mongoose');

if (!process.env.MONGO_URI || process.env.MONGO_URI === 'undefined') {
  module.exports = require('../utils/jsonDb').BusStop;
  return;
}

const busStopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  type: { type: String, enum: ['bus-stop', 'bus-stand', 'terminus'], default: 'bus-stop' },
  landmark: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BusStop', busStopSchema);