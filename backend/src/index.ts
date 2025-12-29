import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import configsRoutes from './routes/configs';
import reportsRoutes from './routes/reports';
import auditRoutes from './routes/audit';
import sourcesRoutes from './routes/sources';
import { initializeScheduler, getScheduledConfigs } from './services/scheduler';
import { getDb } from './db';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    scheduledConfigs: getScheduledConfigs(),
  });
});

// API routes
app.route('/api/configs', configsRoutes);
app.route('/api/reports', reportsRoutes);
app.route('/api/audit', auditRoutes);
app.route('/api/sources', sourcesRoutes);

// Initialize database and scheduler
console.log('Initializing database...');
getDb();
console.log('Database initialized');

initializeScheduler();

const port = parseInt(process.env.PORT || '3001', 10);

console.log(`Starting server on port ${port}...`);

export default {
  port,
  fetch: app.fetch,
  // Deep research can take several minutes, increase timeout from 10s default
  idleTimeout: 255, // Max allowed by Bun (4.25 minutes)
};
