const Route = require('../models/Route');
const BusStop = require('../models/BusStop');

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find()
      .populate('from', 'name latitude longitude')
      .populate('to', 'name latitude longitude')
      .populate('via', 'name latitude longitude')
      .sort({ routeNumber: 1 });
    
    res.json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get routes from-to
// @route   GET /api/routes/from-to?from=...&to=...
// @access  Public
const getRoutesFromTo = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Both from and to stops are required'
      });
    }

    // Find routes matching from and to (direct or via)
    const routes = await Route.find({
      $or: [
        { from: from, to: to },
        { from: from, via: { $in: [to] } },
        { to: to, via: { $in: [from] } },
        { via: { $all: [from, to] } }
      ]
    })
    .populate('from', 'name latitude longitude')
    .populate('to', 'name latitude longitude')
    .populate('via', 'name latitude longitude');

    // Also find routes where both stops are in via array
    const allRoutes = await Route.find()
      .populate('from', 'name latitude longitude')
      .populate('to', 'name latitude longitude')
      .populate('via', 'name latitude longitude');

    // Filter routes where both stops appear in the route
    const matchingRoutes = allRoutes.filter(route => {
      const stopIds = [
        route.from._id.toString(),
        ...route.via.map(v => v._id.toString()),
        route.to._id.toString()
      ];
      return stopIds.includes(from) && stopIds.includes(to);
    });

    // Merge and remove duplicates
    const allMatching = [...routes, ...matchingRoutes];
    const uniqueRoutes = allMatching.filter((route, index, self) =>
      index === self.findIndex(r => r._id.toString() === route._id.toString())
    );

    res.json({
      success: true,
      count: uniqueRoutes.length,
      data: uniqueRoutes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create route (admin)
// @route   POST /api/routes
// @access  Private
const createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    const populatedRoute = await Route.findById(route._id)
      .populate('from', 'name')
      .populate('to', 'name')
      .populate('via', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: populatedRoute
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single route
// @route   GET /api/routes/:id
// @access  Public
const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('from', 'name latitude longitude')
      .populate('to', 'name latitude longitude')
      .populate('via', 'name latitude longitude');
    
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    
    res.json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllRoutes,
  getRoutesFromTo,
  createRoute,
  getRouteById
};