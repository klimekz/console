import cron from 'node-cron';
import * as db from '../db';
import { enqueueConfig, enqueueConfigs } from './queue';

interface ScheduledTask {
  configId: string;
  task: cron.ScheduledTask;
}

const scheduledTasks: Map<string, ScheduledTask> = new Map();

export function initializeScheduler(): void {
  console.log('Initializing research scheduler...');

  const configs = db.getAllConfigs();

  for (const config of configs) {
    if (config.enabled) {
      scheduleConfig(config.id, config.schedule);
    }
  }

  console.log(`Scheduled ${scheduledTasks.size} research tasks`);
}

export function scheduleConfig(configId: string, cronExpression: string): boolean {
  // Validate cron expression
  if (!cron.validate(cronExpression)) {
    console.error(`Invalid cron expression for config ${configId}: ${cronExpression}`);
    return false;
  }

  // Stop existing task if any
  stopConfig(configId);

  const task = cron.schedule(cronExpression, () => {
    console.log(`Scheduled research triggered for config: ${configId}`);
    enqueueConfig(configId);
  });

  scheduledTasks.set(configId, { configId, task });
  console.log(`Scheduled config ${configId} with cron: ${cronExpression}`);
  return true;
}

export function stopConfig(configId: string): void {
  const existing = scheduledTasks.get(configId);
  if (existing) {
    existing.task.stop();
    scheduledTasks.delete(configId);
    console.log(`Stopped scheduled task for config: ${configId}`);
  }
}

export function updateConfigSchedule(configId: string, cronExpression: string, enabled: boolean): boolean {
  stopConfig(configId);

  if (enabled) {
    return scheduleConfig(configId, cronExpression);
  }

  return true;
}

export function getScheduledConfigs(): string[] {
  return Array.from(scheduledTasks.keys());
}

export function stopAllSchedules(): void {
  for (const [configId, { task }] of scheduledTasks) {
    task.stop();
    console.log(`Stopped task: ${configId}`);
  }
  scheduledTasks.clear();
}

// Run research immediately (via queue)
export function runNow(configId?: string): void {
  if (configId) {
    enqueueConfig(configId);
  } else {
    const configs = db.getAllConfigs().filter(c => c.enabled);
    enqueueConfigs(configs.map(c => c.id));
  }
}
