import { Hono } from 'hono';
import * as db from '../db';
import { executeResearchConfig, executeAllEnabledConfigs } from '../services/research';

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

// Trigger research run for a specific config (async - returns immediately)
reports.post('/run/:configId', (c) => {
  const configId = c.req.param('configId');
  const config = db.getConfigById(configId);

  if (!config) {
    return c.json({ error: 'Config not found' }, 404);
  }

  // Fire and forget - run in background
  executeResearchConfig(configId).catch((error) => {
    console.error('Research run failed:', error);
  });

  return c.json({
    started: true,
    configId,
    configName: config.name,
    message: 'Research started. Poll /api/audit/status for progress.',
  }, 202);
});

// Trigger research run for all enabled configs (async - returns immediately)
reports.post('/run-all', (c) => {
  const configs = db.getAllConfigs().filter((cfg) => cfg.enabled);

  if (configs.length === 0) {
    return c.json({ error: 'No enabled configs' }, 400);
  }

  // Fire and forget - run in background
  executeAllEnabledConfigs().catch((error) => {
    console.error('Research run-all failed:', error);
  });

  return c.json({
    started: true,
    count: configs.length,
    configs: configs.map((cfg) => ({ id: cfg.id, name: cfg.name })),
    message: 'Research started. Poll /api/audit/status for progress.',
  }, 202);
});

// Delete all reports (for debugging)
reports.delete('/clear', (c) => {
  const deleted = db.deleteAllReports();
  return c.json({ success: true, deleted });
});

export default reports;
