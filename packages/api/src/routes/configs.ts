import { Hono } from 'hono';
import * as db from '../db';
import { updateConfigSchedule } from '../services/scheduler';
import type { ResearchConfig } from '../types';

const configs = new Hono();

// Get all research configurations
configs.get('/', (c) => {
  const allConfigs = db.getAllConfigs();
  return c.json(allConfigs);
});

// Get a specific configuration
configs.get('/:id', (c) => {
  const id = c.req.param('id');
  const config = db.getConfigById(id);

  if (!config) {
    return c.json({ error: 'Config not found' }, 404);
  }

  return c.json(config);
});

// Create a new configuration
configs.post('/', async (c) => {
  const body = await c.req.json<Omit<ResearchConfig, 'id' | 'createdAt' | 'updatedAt'>>();

  if (!body.name || !body.prompt || !body.category) {
    return c.json({ error: 'name, prompt, and category are required' }, 400);
  }

  const config = db.createConfig({
    name: body.name,
    description: body.description || '',
    prompt: body.prompt,
    category: body.category,
    topics: body.topics || [],
    enabled: body.enabled ?? true,
    schedule: body.schedule || '0 6 * * *',
  });

  if (config.enabled) {
    updateConfigSchedule(config.id, config.schedule, true);
  }

  return c.json(config, 201);
});

// Update a configuration
configs.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Partial<ResearchConfig>>();

  const updated = db.updateConfig(id, body);

  if (!updated) {
    return c.json({ error: 'Config not found' }, 404);
  }

  updateConfigSchedule(updated.id, updated.schedule, updated.enabled);

  return c.json(updated);
});

// Delete a configuration
configs.delete('/:id', (c) => {
  const id = c.req.param('id');
  const deleted = db.deleteConfig(id);

  if (!deleted) {
    return c.json({ error: 'Config not found' }, 404);
  }

  updateConfigSchedule(id, '', false);

  return c.json({ success: true });
});

export default configs;
