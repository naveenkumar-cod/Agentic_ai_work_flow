const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const config = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const orchestrator = require('./agents/orchestrator');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const executionRoutes = require('./routes/executionRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO Real-Time Engine
initSocket(server);

// Security & Performance Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);

      // In development / local testing: allow localhost, 127.0.0.1, private LAN subnets, and configured client URL
      const isAllowed =
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin) ||
        origin === config.clientUrl;

      if (isAllowed || config.nodeEnv === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

// API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Agentflow_AI Backend',
    port: config.port,
    langGraph: orchestrator.getLangGraphStatus(),
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  console.error(`❌ [Server Error] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// Server Initialization
async function startServer() {
  try {
    await connectDB();
    server.listen(config.port, '0.0.0.0', () => {
      console.log(`\n==================================================`);
      console.log(`🤖 Agentflow_AI Backend Server Running`);
      console.log(`📡 Local:   http://localhost:${config.port}`);
      console.log(`📡 Network: http://0.0.0.0:${config.port}`);
      console.log(`🌐 Client Target: ${config.clientUrl}`);
      console.log(`🧠 LangGraph Status: ${orchestrator.getLangGraphStatus()}`);
      console.log(`==================================================\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start Agentflow server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };
