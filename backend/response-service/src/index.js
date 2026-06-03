const nodeCrypto = require('crypto');
global.crypto = nodeCrypto.webcrypto; 

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const eurekaClient = require("./config/eureka");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "Response Service is running" });
});
// routes
const responseRoutes = require("./routes/ResponseRoutes");
app.use("/api/responses", responseRoutes);

const PORT = process.env.PORT || 4003;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Start Eureka client registration
    eurekaClient.start((error) => {
      if (error) {
        console.error('Eureka registration error:', error);
      } else {
        console.log('✓ Eureka client started - service registered');
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      eurekaClient.stop();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });