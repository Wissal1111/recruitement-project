require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const eurekaClient = require('./config/eureka');

const pointsRoutes = require('./routes/point');
const paymentCardRoutes = require('./routes/paymentCards');
const walletRoutes = require('./routes/wallets');
const transactionRoutes = require('./routes/transactions');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ ADD THIS - log every request
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.path}`, 
    req.body ? JSON.stringify(req.body).substring(0, 200) : '');
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Payment Service is running' });
});

app.use('/api/points', pointsRoutes);
app.use('/api/payment-cards', paymentCardRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);

// ✅ ADD THIS - log all errors
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: err.message });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3050;
const server = app.listen(port, () => {
  console.log(`Payment Service listening on port ${port}`);
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