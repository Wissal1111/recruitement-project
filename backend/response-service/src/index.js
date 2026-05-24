const nodeCrypto = require('crypto');
global.crypto = nodeCrypto.webcrypto; 

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

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
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });