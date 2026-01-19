const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./utils/recurringTasks'); // Initialize recurring tasks cron job

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/boards', require('./routes/boardRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/subitems', require('./routes/subItemRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/mywork', require('./routes/myWorkRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

