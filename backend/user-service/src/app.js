require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/profile/interests', require('./routes/interest.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/auth', require('./routes/auth.routes'));


app.get('/health', (req, res) => res.json({ status: 'ok', service: 'user-service' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 user-service running on port ${PORT}`));