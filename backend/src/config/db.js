const mongoose = require("mongoose");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Chemin absolu vers le .env dans backend/

const connectDB = async () => {
  try {
    // 1. Cherche dans le .env (votre URL admin)
    // 2. Sinon, cherche l'URL Docker (mongo)
    // 3. Sinon, utilise localhost par défaut
    const dbUrl = process.env.MONGO_URI || "mongodb://mongo:27017/mydb";
    
    await mongoose.connect(dbUrl);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;