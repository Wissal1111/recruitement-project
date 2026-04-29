const express = require("express");
const cors = require("cors");

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

app.listen(4000, () => {
  console.log("Server running on port 4000");
});