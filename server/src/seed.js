const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/admin");

const MONGO_URI =
  "mongodb://felixngunga3620_db_user:uRzzFuogqDKACZRN@ac-angye3r-shard-00-00.yjxsncw.mongodb.net:27017,ac-angye3r-shard-00-01.yjxsncw.mongodb.net:27017,ac-angye3r-shard-00-02.yjxsncw.mongodb.net:27017/Fixly?ssl=true&replicaSet=atlas-6pvcpk-shard-0&authSource=admin&retryWrites=true&w=majority";

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("✅  MongoDB connected");

    // Delete existing to avoid duplicate
    await Admin.deleteOne({ email: "felixngunga22@gmail.com" });
    console.log("🗑️   Cleared any existing admin");

    // Hash password manually — model has no pre-save hook
    const hashedPassword = await bcrypt.hash("Promise@2020", 12);

    await Admin.create({
      name: "Felix Ngunga",
      email: "felixngunga22@gmail.com",
      password: hashedPassword,
      role: "superadmin",
      active: true,
    });

    console.log("🌱  Admin created: felixngunga22@gmail.com (superadmin)");
    console.log("✅  Seeding complete");
  } catch (err) {
    console.error("❌  Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌  Disconnected from MongoDB");
    process.exit(0);
  }
};

seed();
