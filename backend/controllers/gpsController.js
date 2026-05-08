const Gps = require('../models/Gps');

const updateGps = async (req, res) => {
  try {
    const { lat, lng, busId } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const newLocation = await Gps.create({
      busId: busId || 'BUS-001',
      latitude: parseFloat(lat),
      longitude: parseFloat(lng)
    });

    // Emit socket event if io is attached to app
    const io = req.app.get('socketio');
    if (io) {
      io.emit('locationUpdate', {
        busId: newLocation.busId,
        lat: newLocation.latitude,
        lng: newLocation.longitude,
        timestamp: newLocation.timestamp
      });
    }

    res.status(201).json({
      success: true,
      message: 'Location updated successfully',
      data: newLocation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLatestLocation = async (req, res) => {
  try {
    const latest = await Gps.findOne().sort({ timestamp: -1 });
    res.status(200).json({ success: true, data: latest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  updateGps,
  getLatestLocation
};
