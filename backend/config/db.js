const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI === 'undefined') {
    console.log('⚠️  No MONGO_URI found. Running in JSON-only mode.');
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Falling back to JSON-only mode.');
  }
};

module.exports = connectDB;