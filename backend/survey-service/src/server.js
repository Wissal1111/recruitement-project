const express = require("express");
const cors = require("cors");
require("dotenv").config();
const eurekaClient = require("./config/eureka");

const connectDB = require("./config/db");
const studyRoutes = require("./routes/studyRoutes");
const communicationRoutes = require("./routes/CommunicationRoutes");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

connectDB();

app.use("/api/studies", studyRoutes);
app.use("/api/communication", communicationRoutes);

app.get("/", (req, res) => {
  res.send("API working with MongoDB + Mongoose");
});

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
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