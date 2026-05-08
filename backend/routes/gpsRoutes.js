const express = require('express');
const router = express.Router();
const { updateGps, getLatestLocation } = require('../controllers/gpsController');

// @route   POST /api/gps
// @desc    Update bus GPS location
// @access  Public (In production, you might want to secure this with an API key)
router.post('/', updateGps);

// @route   GET /api/gps/latest
// @desc    Get the latest bus GPS location
// @access  Public
router.get('/latest', getLatestLocation);

module.exports = router;
