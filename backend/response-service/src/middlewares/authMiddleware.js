const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  console.log("JWT_SECRET:", process.env.JWT_SECRET); // ← add this
  console.log("Auth header:", req.headers.authorization); // ← and this
  
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    console.log("JWT error:", err.message); // ← and this
    return res.status(401).json({ message: "Invalid token" });
  }
};