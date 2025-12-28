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

// Trigger research run for a specific config
reports.post('/run/:configId', async (c) => {
  const configId = c.req.param('configId');

  try {
    const report = await executeResearchConfig(configId);

    if (!report) {
      return c.json({ error: 'Config not found or research failed' }, 404);
    }

    return c.json(report, 201);
  } catch (error) {
    console.error('Research run failed:', error);
    return c.json({ error: 'Research run failed' }, 500);
  }
});

// Trigger research run for all enabled configs
reports.post('/run-all', async (c) => {
  try {
    const reports = await executeAllEnabledConfigs();
    return c.json({
      success: true,
      count: reports.length,
      reports: reports.map(r => ({
        id: r.id,
        configName: r.configName,
        itemCount: r.items.length,
      })),
    }, 201);
  } catch (error) {
    console.error('Research run-all failed:', error);
    return c.json({ error: 'Research run failed' }, 500);
  }
});

// Delete all reports (for debugging)
reports.delete('/clear', (c) => {
  const deleted = db.deleteAllReports();
  return c.json({ success: true, deleted });
});

export default reports;
