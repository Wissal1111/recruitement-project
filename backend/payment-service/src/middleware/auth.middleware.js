const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // Internal service-to-service call
  if (token === process.env.SERVICE_SECRET) {
    req.user = {
      userId: req.headers['x-creator-id'],
      role: req.headers['x-creator-role'] || null,
    };
    return next();
  }

  // Normal JWT
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId || decoded.id || decoded.sub,
      role: decoded.role || null,
    };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};