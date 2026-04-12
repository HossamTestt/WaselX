/**
 * WaselX Backend — Main Application Entry Point
 * Express REST API for the logistics marketplace
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { testConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/users.routes');
const shipmentRoutes = require('./modules/shipments/shipments.routes');
const bidRoutes = require('./modules/bids/bids.routes');
const trackingRoutes = require('./modules/tracking/tracking.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security Middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));

// ─── Request Parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Static Files (uploads) ───────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'WaselX API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 + Error Handling ─────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────
async function startServer() {
  await testConnection(); // Verify DB connection
  app.listen(PORT, () => {
    console.log(`\n🚚 WaselX API running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health\n`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app; // For testing
