import { Hono } from 'hono';
import * as db from '../db';

const queue = new Hono();

// Get all queue items (optionally filter by status)
queue.get('/', (c) => {
  const status = c.req.query('status');
  const items = db.getAllQueueItems(status);
  return c.json(items);
});

// Get a specific item
queue.get('/:id', (c) => {
  const id = c.req.param('id');
  const item = db.getQueueItemById(id);

  if (!item) {
    return c.json({ error: 'Item not found' }, 404);
  }

  return c.json(item);
});

// Create a new queue item
queue.post('/', async (c) => {
  const body = await c.req.json<{
    type: 'link' | 'file' | 'note';
    title?: string;
    url?: string;
    content?: string;
    notes?: string;
    tags?: string[];
  }>();

  if (!body.type) {
    return c.json({ error: 'type is required' }, 400);
  }

  // For links, try to extract title from URL if not provided
  let title = body.title;
  if (body.type === 'link' && body.url && !title) {
    // Simple domain extraction as fallback title
    try {
      const urlObj = new URL(body.url);
      title = urlObj.hostname.replace('www.', '');
    } catch {
      title = body.url;
    }
  }

  const item = db.createQueueItem({
    type: body.type,
    title,
    url: body.url,
    content: body.content,
    notes: body.notes,
    tags: body.tags,
  });

  return c.json(item, 201);
});

// Update an item
queue.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{
    title?: string;
    url?: string;
    content?: string;
    notes?: string;
    tags?: string[];
    status?: 'pending' | 'reading' | 'done' | 'archived';
    position?: number;
  }>();

  const updated = db.updateQueueItem(id, body);

  if (!updated) {
    return c.json({ error: 'Item not found' }, 404);
  }

  return c.json(updated);
});

// Delete an item
queue.delete('/:id', (c) => {
  const id = c.req.param('id');
  const deleted = db.deleteQueueItem(id);

  if (!deleted) {
    return c.json({ error: 'Item not found' }, 404);
  }

  return c.json({ success: true });
});

// Reorder items
queue.post('/reorder', async (c) => {
  const body = await c.req.json<{ itemIds: string[] }>();

  if (!body.itemIds || !Array.isArray(body.itemIds)) {
    return c.json({ error: 'itemIds array is required' }, 400);
  }

  db.reorderQueueItems(body.itemIds);
  return c.json({ success: true });
});

export default queue;
