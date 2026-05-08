const express = require('express');
const router = express.Router();
const {
  getAllRoutes,
  getRoutesFromTo,
  createRoute,
  getRouteById
} = require('../controllers/routeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllRoutes);
router.get('/from-to', getRoutesFromTo);
router.get('/:id', getRouteById);
router.post('/', protect, createRoute);

module.exports = router;