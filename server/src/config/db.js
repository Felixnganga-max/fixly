const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb://felixngunga3620_db_user:uRzzFuogqDKACZRN@ac-angye3r-shard-00-00.yjxsncw.mongodb.net:27017,ac-angye3r-shard-00-01.yjxsncw.mongodb.net:27017,ac-angye3r-shard-00-02.yjxsncw.mongodb.net:27017/Fixly?ssl=true&replicaSet=atlas-6pvcpk-shard-0&authSource=admin&retryWrites=true&w=majority",
      {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      },
    );
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
