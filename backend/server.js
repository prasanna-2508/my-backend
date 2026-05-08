require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const BusStop = require('./models/BusStop');
const Route = require('./models/Route');

const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Set socketio to app for use in controllers
app.set('socketio', io);

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for demo. In production, specify your frontend URL
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected');
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/gps', require('./routes/gpsRoutes'));
app.use('/api/stops', require('./routes/busStopRoutes'));
app.use('/api/routes', require('./routes/routeRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Find My Bus API is running 🚌' });
});

// Seed demo data (moved inside to avoid multiple triggers if server restarts)
const seedData = async () => {
  try {
    const stopCount = await BusStop.countDocuments();
    if (stopCount === 0) {
      console.log('🌱 Seeding Coimbatore bus stops...');
      
      const stops = await BusStop.insertMany([
        { name: 'Gandhipuram Bus Stand', latitude: 11.0185, longitude: 76.9685, type: 'bus-stand', landmark: 'Central Bus Terminal' },
        { name: 'Ukkadam Bus Stand', latitude: 11.0012, longitude: 76.9556, type: 'bus-stand', landmark: 'Old Bus Stand' },
        { name: 'Singanallur Bus Stand', latitude: 10.9987, longitude: 77.0325, type: 'bus-stand', landmark: 'Near Singanallur Lake' },
        { name: 'Peelamedu Bus Stop', latitude: 11.0245, longitude: 77.0078, type: 'bus-stop', landmark: 'Near PSG College' },
        { name: 'Town Hall', latitude: 11.0102, longitude: 76.9668, type: 'bus-stop', landmark: 'City Center' },
        { name: 'Railway Station', latitude: 11.0008, longitude: 76.9706, type: 'terminus', landmark: 'Coimbatore Junction' },
        { name: 'Saibaba Colony', latitude: 11.0248, longitude: 76.9402, type: 'bus-stop', landmark: 'Saibaba Temple' },
        { name: 'Ramanathapuram', latitude: 10.9989, longitude: 76.9823, type: 'bus-stop', landmark: 'Ramanathapuram Signal' },
        { name: 'Sungam', latitude: 10.9945, longitude: 76.9789, type: 'bus-stop', landmark: 'Sungam Roundana' },
        { name: 'Ondipudur', latitude: 11.0089, longitude: 77.0423, type: 'bus-stop', landmark: 'Ondipudur Junction' },
        { name: 'Sulur', latitude: 11.0234, longitude: 77.1234, type: 'bus-stand', landmark: 'Sulur Bus Terminus' },
        { name: 'Thondamuthur', latitude: 10.9723, longitude: 76.8765, type: 'bus-stand', landmark: 'Thondamuthur Bus Stand' },
        { name: 'Perur', latitude: 10.9767, longitude: 76.9012, type: 'bus-stop', landmark: 'Perur Temple' },
        { name: 'Kovaipudur', latitude: 10.9456, longitude: 76.9234, type: 'bus-stop', landmark: 'Kovaipudur Colony' },
        { name: 'SITRA', latitude: 11.0345, longitude: 77.0234, type: 'bus-stop', landmark: 'SITRA Industrial Area' },
        { name: 'Hope College', latitude: 11.0389, longitude: 77.0189, type: 'bus-stop', landmark: 'Near Hope College' },
        { name: 'Lakshmi Mills', latitude: 11.0123, longitude: 77.0012, type: 'bus-stop', landmark: 'Lakshmi Mills Junction' },
        { name: 'Podanur', latitude: 10.9876, longitude: 76.9567, type: 'bus-stop', landmark: 'Podanur Railway Station' },
        { name: 'Maruthamalai', latitude: 11.0456, longitude: 76.8890, type: 'bus-stand', landmark: 'Maruthamalai Temple' },
        { name: 'Vadavalli', latitude: 11.0234, longitude: 76.9012, type: 'bus-stop', landmark: 'Vadavalli Junction' }
      ]);

      console.log(`✅ ${stops.length} bus stops seeded`);

      // Create routes based on real Coimbatore data
      const stopMap = {};
      stops.forEach(s => stopMap[s.name] = s._id);

      const routes = await Route.insertMany([
        {
          routeNumber: '27A',
          from: stopMap['Gandhipuram Bus Stand'],
          to: stopMap['Thondamuthur'],
          via: [stopMap['Town Hall'], stopMap['Perur'], stopMap['Kovaipudur']],
          distance: 18.5,
          estimatedTime: 45,
          fare: 25,
          frequency: 'high',
          operator: 'TNSTC'
        },
        {
          routeNumber: '95',
          from: stopMap['Gandhipuram Bus Stand'],
          to: stopMap['Singanallur Bus Stand'],
          via: [stopMap['Lakshmi Mills'], stopMap['Peelamedu Bus Stop'], stopMap['Hope College']],
          distance: 8.2,
          estimatedTime: 25,
          fare: 15,
          frequency: 'high',
          operator: 'TNSTC'
        },
        {
          routeNumber: '30',
          from: stopMap['Ukkadam Bus Stand'],
          to: stopMap['Sulur'],
          via: [stopMap['Town Hall'], stopMap['Ramanathapuram'], stopMap['Ondipudur']],
          distance: 22.0,
          estimatedTime: 55,
          fare: 30,
          frequency: 'medium',
          operator: 'TNSTC'
        },
        {
          routeNumber: '41',
          from: stopMap['Gandhipuram Bus Stand'],
          to: stopMap['Sulur'],
          via: [stopMap['Lakshmi Mills'], stopMap['SITRA'], stopMap['Ondipudur']],
          distance: 20.5,
          estimatedTime: 50,
          fare: 28,
          frequency: 'high',
          operator: 'TNSTC'
        },
        {
          routeNumber: '96',
          from: stopMap['Gandhipuram Bus Stand'],
          to: stopMap['Maruthamalai'],
          via: [stopMap['Town Hall'], stopMap['Saibaba Colony'], stopMap['Vadavalli']],
          distance: 15.0,
          estimatedTime: 40,
          fare: 22,
          frequency: 'medium',
          operator: 'TNSTC'
        },
        {
          routeNumber: '33',
          from: stopMap['Railway Station'],
          to: stopMap['Ukkadam Bus Stand'],
          via: [stopMap['Town Hall'], stopMap['Ramanathapuram']],
          distance: 5.5,
          estimatedTime: 15,
          fare: 10,
          frequency: 'high',
          operator: 'TNSTC'
        },
        {
          routeNumber: '19',
          from: stopMap['Town Hall'],
          to: stopMap['Ukkadam Bus Stand'],
          via: [stopMap['Ramanathapuram'], stopMap['Sungam']],
          distance: 4.0,
          estimatedTime: 12,
          fare: 10,
          frequency: 'high',
          operator: 'TNSTC'
        },
        {
          routeNumber: 'S1',
          from: stopMap['Ondipudur'],
          to: stopMap['Sulur'],
          via: [stopMap['Singanallur Bus Stand']],
          distance: 12.0,
          estimatedTime: 30,
          fare: 18,
          frequency: 'medium',
          operator: 'TNSTC'
        },
        {
          routeNumber: '28',
          from: stopMap['Thondamuthur'],
          to: stopMap['Singanallur Bus Stand'],
          via: [stopMap['Perur'], stopMap['Town Hall'], stopMap['Ramanathapuram']],
          distance: 25.0,
          estimatedTime: 60,
          fare: 35,
          frequency: 'medium',
          operator: 'TNSTC'
        },
        {
          routeNumber: '43',
          from: stopMap['Saibaba Colony'],
          to: stopMap['Ondipudur'],
          via: [stopMap['Gandhipuram Bus Stand'], stopMap['Lakshmi Mills'], stopMap['Peelamedu Bus Stop']],
          distance: 14.0,
          estimatedTime: 35,
          fare: 20,
          frequency: 'medium',
          operator: 'TNSTC'
        }
      ]);

      console.log(`✅ ${routes.length} routes seeded`);
      console.log('🎉 Demo data ready! Coimbatore bus data loaded.');
    }
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  }
};

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  seedData();
});