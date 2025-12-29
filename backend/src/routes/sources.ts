import { Hono } from 'hono';
import * as db from '../db';

const sources = new Hono();

// Submit feedback for a source
sources.post('/feedback', async (c) => {
  try {
    const body = await c.req.json();
    const { sourceDomain, itemId, rating } = body;

    if (!sourceDomain || typeof rating !== 'number' || (rating !== 1 && rating !== -1)) {
      return c.json({ error: 'Invalid feedback data' }, 400);
    }

    db.submitSourceFeedback({
      sourceDomain,
      itemId,
      rating,
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    return c.json({ error: 'Failed to submit feedback' }, 500);
  }
});

// Get top sources by trust score
sources.get('/', (c) => {
  const category = c.req.query('category');
  const sources = db.getTopSources(category);
  return c.json(sources);
});

// Trigger trust score recalculation
sources.post('/recalculate', (c) => {
  db.recalculateTrustScores();
  return c.json({ success: true });
});

export default sources;
