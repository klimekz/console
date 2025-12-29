import { Hono } from 'hono';
import * as db from '../db';
import { enqueueConfig, enqueueConfigs, getQueueStatus } from '../services/queue';

const reports = new Hono();

// Get today's reports (latest for each config)
reports.get('/today', (c) => {
  const todayReports = db.getTodaysReports();

  // If no reports today, return latest reports
  if (todayReports.length === 0) {
    const latestReports = db.getLatestReports();
    return c.json({
      data: latestReports,
      isLatest: true,
      message: 'No reports generated today. Showing latest available reports.',
    });
  }

  return c.json({
    data: todayReports,
    isLatest: false,
  });
});

// Get latest reports (one per config)
reports.get('/latest', (c) => {
  const latestReports = db.getLatestReports();
  return c.json(latestReports);
});

// Get historical reports (paginated, excluding today)
reports.get('/history', (c) => {
  const page = parseInt(c.req.query('page') || '1', 10);
  const pageSize = parseInt(c.req.query('pageSize') || '10', 10);

  const history = db.getYesterdaysAndOlderReports(page, pageSize);
  return c.json(history);
});

// Get reports grouped by day (newspaper-style view)
reports.get('/by-day', (c) => {
  const days = parseInt(c.req.query('days') || '3', 10);
  const offset = parseInt(c.req.query('offset') || '0', 10);

  const result = db.getReportsByDays(days, offset);
  return c.json(result);
});

// Get all reports (paginated)
reports.get('/', (c) => {
  const page = parseInt(c.req.query('page') || '1', 10);
  const pageSize = parseInt(c.req.query('pageSize') || '10', 10);
  const category = c.req.query('category');

  const result = db.getReportsHistory(page, pageSize, category);
  return c.json(result);
});

// Get a specific report
reports.get('/:id', (c) => {
  const id = c.req.param('id');
  const report = db.getReportById(id);

  if (!report) {
    return c.json({ error: 'Report not found' }, 404);
  }

  return c.json(report);
});

// Get queue status
reports.get('/queue', (c) => {
  return c.json(getQueueStatus());
});

// Trigger research run for a specific config (queued - only one runs at a time)
reports.post('/run/:configId', (c) => {
  const configId = c.req.param('configId');
  const config = db.getConfigById(configId);

  if (!config) {
    return c.json({ error: 'Config not found' }, 404);
  }

  const result = enqueueConfig(configId);

  return c.json({
    queued: true,
    position: result.position,
    alreadyQueued: result.alreadyQueued,
    configId,
    configName: config.name,
    message: result.alreadyQueued
      ? 'Already in queue'
      : result.position === 1
        ? 'Research started'
        : `Queued at position ${result.position}`,
  }, 202);
});

// Trigger research run for all enabled configs (queued sequentially)
reports.post('/run-all', (c) => {
  const configs = db.getAllConfigs().filter((cfg) => cfg.enabled);

  if (configs.length === 0) {
    return c.json({ error: 'No enabled configs' }, 400);
  }

  const result = enqueueConfigs(configs.map(cfg => cfg.id));

  return c.json({
    queued: true,
    count: result.queued,
    skipped: result.skipped,
    configs: configs.map((cfg) => ({ id: cfg.id, name: cfg.name })),
    message: `Queued ${result.queued} configs${result.skipped > 0 ? ` (${result.skipped} already in queue)` : ''}`,
  }, 202);
});

// Delete a specific item
reports.delete('/items/:itemId', (c) => {
  const itemId = c.req.param('itemId');
  const deleted = db.deleteItem(itemId);

  if (!deleted) {
    return c.json({ error: 'Item not found' }, 404);
  }

  return c.json({ success: true });
});

// Delete a specific report and all its items
reports.delete('/:reportId', (c) => {
  const reportId = c.req.param('reportId');
  const deleted = db.deleteReport(reportId);

  if (!deleted) {
    return c.json({ error: 'Report not found' }, 404);
  }

  return c.json({ success: true });
});

// Delete all reports (for debugging)
reports.delete('/clear', (c) => {
  const deleted = db.deleteAllReports();
  return c.json({ success: true, deleted });
});

export default reports;
