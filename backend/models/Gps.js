const mongoose = require('mongoose');

if (!process.env.MONGO_URI || process.env.MONGO_URI === 'undefined') {
  module.exports = require('../utils/jsonDb').Gps;
  return;
}

const gpsSchema = new mongoose.Schema({
  busId: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gps', gpsSchema);
