const BusStop = require('../models/BusStop');
const { calculateDistance } = require('../utils/helpers');

// @desc    Get all bus stops
// @route   GET /api/stops
// @access  Public
const getAllStops = async (req, res) => {
  try {
    const stops = await BusStop.find().sort({ name: 1 });
    res.json({
      success: true,
      count: stops.length,
      data: stops
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get nearby bus stops
// @route   GET /api/stops/nearby?lat=...&lng=...&radius=...
// @access  Public
const getNearbyStops = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query; // radius in km, default 5km

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const allStops = await BusStop.find();
    
    // Calculate distance for each stop and filter
    const nearbyStops = allStops
      .map(stop => ({
        ...stop.toObject(),
        distance: calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          stop.latitude,
          stop.longitude
        )
      }))
      .filter(stop => stop.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      count: nearbyStops.length,
      data: nearbyStops
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single bus stop
// @route   GET /api/stops/:id
// @access  Public
const getStopById = async (req, res) => {
  try {
    const stop = await BusStop.findById(req.params.id);
    if (!stop) {
      return res.status(404).json({ success: false, message: 'Bus stop not found' });
    }
    res.json({ success: true, data: stop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create bus stop (admin)
// @route   POST /api/stops
// @access  Private
const createStop = async (req, res) => {
  try {
    const stop = await BusStop.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Bus stop created successfully',
      data: stop
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllStops,
  getNearbyStops,
  getStopById,
  createStop
};