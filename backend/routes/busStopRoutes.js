const express = require('express');
const router = express.Router();
const {
  getAllStops,
  getNearbyStops,
  getStopById,
  createStop
} = require('../controllers/busStopController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllStops);
router.get('/nearby', getNearbyStops);
router.get('/:id', getStopById);
router.post('/', protect, createStop);

module.exports = router;