require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
const notificationRoutes = require('./routes/notification.routes');
app.use("/api/notifications", notificationRoutes);
app.use('/api/profile/interests', require('./routes/interest.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/roles', require('./routes/role.routes'));



app.get('/health', (req, res) => res.json({ status: 'ok', service: 'user-service' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 user-service running on port ${PORT}`));