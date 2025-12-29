import { Hono } from 'hono';
import * as db from '../db';

const audit = new Hono();

// Get current status - running entries + recent completed/failed
audit.get('/status', (c) => {
  const running = db.getRunningAuditEntries();
  const recentCompleted = db.getRecentCompletedAuditEntries(5); // last 5 minutes

  return c.json({
    running,
    recentCompleted,
  });
});

// Get specific audit entry
audit.get('/:id', (c) => {
  const id = c.req.param('id');
  const entry = db.getAuditEntry(id);

  if (!entry) {
    return c.json({ error: 'Audit entry not found' }, 404);
  }

  return c.json(entry);
});

// Get recent audit entries (for cost log)
audit.get('/', (c) => {
  const limit = parseInt(c.req.query('limit') || '50', 10);
  const entries = db.getRecentAuditEntries(limit);

  // Calculate totals
  const totals = entries.reduce(
    (acc, entry) => {
      acc.totalCostCents += entry.estimatedCostCents || 0;
      acc.totalInputTokens += entry.inputTokens || 0;
      acc.totalOutputTokens += entry.outputTokens || 0;
      acc.totalWebSearches += entry.webSearchCalls || 0;
      return acc;
    },
    { totalCostCents: 0, totalInputTokens: 0, totalOutputTokens: 0, totalWebSearches: 0 }
  );

  return c.json({
    entries,
    totals,
  });
});

export default audit;
