const express = require("express");
const connectDB = require("./config/db");
const studyRoutes = require('./routes/studyRoutes');
const communicationRoutes = require('./routes/CommunicationRoutes');

const app = express();
app.use(express.json());

connectDB();

app.use('/api/studies', studyRoutes);
app.use('/api/communication', communicationRoutes); // Added for inter-service communication

app.get("/", (req, res) => {
  res.send("API working with MongoDB + Mongoose");
});


app.listen(4000, () => {
  console.log("Server running on port 4000");
});