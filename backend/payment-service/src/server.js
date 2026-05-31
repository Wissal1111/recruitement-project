require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const pointsRoutes = require('./routes/point');
const paymentCardRoutes = require('./routes/paymentCards');
const walletRoutes = require('./routes/wallets');
const transactionRoutes = require('./routes/transactions');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Payment Service is running' });
});

app.use('/api/points', pointsRoutes);
app.use('/api/payment-cards', paymentCardRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3050;
app.listen(port, () => {
  console.log(`Payment Service listening on port ${port}`);
});