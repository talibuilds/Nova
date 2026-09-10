const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('⚠️  Server will continue running. Please start MongoDB and restart the server.');
    console.error('   Install: https://www.mongodb.com/docs/manual/installation/');
    console.error('   Or use MongoDB Atlas: https://www.mongodb.com/atlas');
  }
};

module.exports = connectDB;
