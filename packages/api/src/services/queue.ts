/**
 * Research queue - ensures only one research job runs at a time to avoid rate limits
 */

import { executeResearchConfig } from './research';

interface QueueItem {
  configId: string;
  addedAt: Date;
}

const queue: QueueItem[] = [];
let isProcessing = false;
let currentConfigId: string | null = null;

export function getQueueStatus() {
  return {
    isProcessing,
    currentConfigId,
    queueLength: queue.length,
    queue: queue.map(q => ({ configId: q.configId, addedAt: q.addedAt.toISOString() })),
  };
}

export function enqueueConfig(configId: string): { position: number; alreadyQueued: boolean } {
  // Check if already in queue or currently processing
  if (currentConfigId === configId) {
    return { position: 0, alreadyQueued: true };
  }

  const existingIndex = queue.findIndex(q => q.configId === configId);
  if (existingIndex >= 0) {
    return { position: existingIndex + 1, alreadyQueued: true };
  }

  queue.push({ configId, addedAt: new Date() });
  const position = queue.length;

  // Start processing if not already
  if (!isProcessing) {
    processQueue();
  }

  return { position, alreadyQueued: false };
}

export function enqueueConfigs(configIds: string[]): { queued: number; skipped: number } {
  let queued = 0;
  let skipped = 0;

  for (const configId of configIds) {
    const result = enqueueConfig(configId);
    if (result.alreadyQueued) {
      skipped++;
    } else {
      queued++;
    }
  }

  return { queued, skipped };
}

async function processQueue(): Promise<void> {
  if (isProcessing || queue.length === 0) {
    return;
  }

  isProcessing = true;

  while (queue.length > 0) {
    const item = queue.shift()!;
    currentConfigId = item.configId;

    console.log(`[Queue] Processing config: ${item.configId} (${queue.length} remaining)`);

    try {
      await executeResearchConfig(item.configId);
    } catch (error) {
      console.error(`[Queue] Failed to execute config ${item.configId}:`, error);
    }

    currentConfigId = null;
  }

  isProcessing = false;
  console.log('[Queue] Queue empty, stopping processor');
}
