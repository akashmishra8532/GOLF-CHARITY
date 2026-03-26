import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint for monitoring
 * @access  Public
 */
router.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    services: {
      api: 'up',
      database: mongoose.connection.readyState === 1 ? 'up' : 'down'
    }
  };

  try {
    res.status(200).json(healthcheck);
  } catch (error: any) {
    healthcheck.message = error.message || 'Error';
    healthcheck.status = 'unhealthy';
    res.status(503).json(healthcheck);
  }
});

/**
 * @route   GET /api/ready
 * @desc    Readiness probe for Kubernetes/Docker
 * @access  Public
 */
router.get('/ready', (req, res) => {
  const isDatabaseReady = mongoose.connection.readyState === 1;
  
  if (isDatabaseReady) {
    res.status(200).json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/live
 * @desc    Liveness probe for Kubernetes
 * @access  Public
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/info
 * @desc    API information endpoint
 * @access  Public
 */
router.get('/info', (req, res) => {
  res.status(200).json({
    name: 'Golf Charity Platform API',
    version: '1.0.0',
    description: 'Backend API for Golf Charity Subscription Platform',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api-docs',
    endpoints: {
      health: '/api/health',
      ready: '/api/ready',
      live: '/api/live',
      auth: '/api/auth',
      users: '/api/users',
      subscriptions: '/api/subscription',
      charities: '/api/charities',
      scores: '/api/scores',
      draws: '/api/draws',
      admin: '/api/admin'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
