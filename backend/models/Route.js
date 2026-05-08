const mongoose = require('mongoose');

if (!process.env.MONGO_URI || process.env.MONGO_URI === 'undefined') {
  module.exports = require('../utils/jsonDb').Route;
  return;
}

const routeSchema = new mongoose.Schema({
  routeNumber: { type: String, required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'BusStop', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'BusStop', required: true },
  via: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BusStop' }],
  distance: Number,
  estimatedTime: Number,
  fare: Number,
  frequency: { type: String, enum: ['high', 'medium', 'low'] },
  operator: { type: String, default: 'TNSTC' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Route', routeSchema);