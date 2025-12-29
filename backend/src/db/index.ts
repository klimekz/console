import { Database } from 'bun:sqlite';
import { createSchema, seedDefaultConfigs, migrateSchema } from './schema';
import type { ResearchConfig, ResearchReport, ResearchItem, PaginatedResponse } from '../types';
import { randomUUID } from 'crypto';

const DB_PATH = process.env.DB_PATH || './data/console.db';

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    // Ensure data directory exists
    const dir = DB_PATH.substring(0, DB_PATH.lastIndexOf('/'));
    if (dir) {
      require('fs').mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA foreign_keys = ON');
    createSchema(db);
    migrateSchema(db);
    seedDefaultConfigs(db);
  }
  return db;
}

// Research Configs
export function getAllConfigs(): ResearchConfig[] {
  const db = getDb();
  const rows = db.query(`
    SELECT id, name, description, prompt, category, topics,
           preferred_sources as preferredSources, blocked_sources as blockedSources,
           enabled, schedule,
           created_at as createdAt, updated_at as updatedAt
    FROM research_configs
    ORDER BY category, name
  `).all() as any[];

  return rows.map(row => ({
    ...row,
    topics: JSON.parse(row.topics),
    preferredSources: row.preferredSources ? JSON.parse(row.preferredSources) : [],
    blockedSources: row.blockedSources ? JSON.parse(row.blockedSources) : [],
    enabled: Boolean(row.enabled),
  }));
}

export function getConfigById(id: string): ResearchConfig | null {
  const db = getDb();
  const row = db.query(`
    SELECT id, name, description, prompt, category, topics,
           preferred_sources as preferredSources, blocked_sources as blockedSources,
           enabled, schedule,
           created_at as createdAt, updated_at as updatedAt
    FROM research_configs WHERE id = ?
  `).get(id) as any;

  if (!row) return null;

  return {
    ...row,
    topics: JSON.parse(row.topics),
    preferredSources: row.preferredSources ? JSON.parse(row.preferredSources) : [],
    blockedSources: row.blockedSources ? JSON.parse(row.blockedSources) : [],
    enabled: Boolean(row.enabled),
  };
}

export function createConfig(config: Omit<ResearchConfig, 'id' | 'createdAt' | 'updatedAt'>): ResearchConfig {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.run(`
    INSERT INTO research_configs (id, name, description, prompt, category, topics, preferred_sources, blocked_sources, enabled, schedule, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    config.name,
    config.description,
    config.prompt,
    config.category,
    JSON.stringify(config.topics),
    JSON.stringify(config.preferredSources || []),
    JSON.stringify(config.blockedSources || []),
    config.enabled ? 1 : 0,
    config.schedule,
    now,
    now,
  ]);

  return { ...config, id, createdAt: now, updatedAt: now, preferredSources: config.preferredSources || [], blockedSources: config.blockedSources || [] };
}

export function updateConfig(id: string, updates: Partial<ResearchConfig>): ResearchConfig | null {
  const db = getDb();
  const existing = getConfigById(id);
  if (!existing) return null;

  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };

  db.run(`
    UPDATE research_configs
    SET name = ?, description = ?, prompt = ?, category = ?, topics = ?,
        preferred_sources = ?, blocked_sources = ?, enabled = ?, schedule = ?, updated_at = ?
    WHERE id = ?
  `, [
    updated.name,
    updated.description,
    updated.prompt,
    updated.category,
    JSON.stringify(updated.topics),
    JSON.stringify(updated.preferredSources || []),
    JSON.stringify(updated.blockedSources || []),
    updated.enabled ? 1 : 0,
    updated.schedule,
    updated.updatedAt,
    id,
  ]);

  return updated;
}

export function deleteConfig(id: string): boolean {
  const db = getDb();
  const result = db.run('DELETE FROM research_configs WHERE id = ?', [id]);
  return result.changes > 0;
}

// Research Reports
export function createReport(report: Omit<ResearchReport, 'id' | 'generatedAt' | 'items'>, items: Omit<ResearchItem, 'id' | 'reportId'>[]): ResearchReport {
  const db = getDb();
  const reportId = randomUUID();
  const now = new Date().toISOString();

  db.run(`
    INSERT INTO research_reports (id, config_id, config_name, category, generated_at, summary)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [reportId, report.configId, report.configName, report.category, now, report.summary]);

  const itemStmt = db.prepare(`
    INSERT INTO research_items (id, report_id, title, source, url, summary, relevance_score, published_at, category, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const savedItems: ResearchItem[] = [];
  for (const item of items) {
    const itemId = randomUUID();
    itemStmt.run(itemId, reportId, item.title, item.source, item.url, item.summary, item.relevanceScore, item.publishedAt, item.category, JSON.stringify(item.tags));
    savedItems.push({ ...item, id: itemId, reportId });
  }

  return {
    id: reportId,
    configId: report.configId,
    configName: report.configName,
    category: report.category,
    generatedAt: now,
    summary: report.summary,
    items: savedItems,
  };
}

export function getLatestReports(): ResearchReport[] {
  const db = getDb();

  // Get the latest report for each config
  const reports = db.query(`
    SELECT r.id, r.config_id as configId, r.config_name as configName, r.category,
           r.generated_at as generatedAt, r.summary
    FROM research_reports r
    INNER JOIN (
      SELECT config_id, MAX(generated_at) as max_date
      FROM research_reports
      GROUP BY config_id
    ) latest ON r.config_id = latest.config_id AND r.generated_at = latest.max_date
    ORDER BY r.generated_at DESC
  `).all() as any[];

  return reports.map(report => ({
    ...report,
    items: getReportItems(report.id),
  }));
}

export function getReportItems(reportId: string): ResearchItem[] {
  const db = getDb();
  const items = db.query(`
    SELECT id, report_id as reportId, title, source, url, summary,
           relevance_score as relevanceScore, published_at as publishedAt, category, tags
    FROM research_items
    WHERE report_id = ?
    ORDER BY relevance_score DESC
  `).all(reportId) as any[];

  return items.map(item => ({
    ...item,
    tags: item.tags ? JSON.parse(item.tags) : [],
  }));
}

export function deleteItem(itemId: string): boolean {
  const db = getDb();
  const result = db.run('DELETE FROM research_items WHERE id = ?', [itemId]);
  return result.changes > 0;
}

export function deleteReport(reportId: string): boolean {
  const db = getDb();
  db.run('DELETE FROM research_items WHERE report_id = ?', [reportId]);
  const result = db.run('DELETE FROM research_reports WHERE id = ?', [reportId]);
  return result.changes > 0;
}

export function getReportById(id: string): ResearchReport | null {
  const db = getDb();
  const report = db.query(`
    SELECT id, config_id as configId, config_name as configName, category,
           generated_at as generatedAt, summary
    FROM research_reports WHERE id = ?
  `).get(id) as any;

  if (!report) return null;

  return {
    ...report,
    items: getReportItems(report.id),
  };
}

export function getReportsHistory(page: number = 1, pageSize: number = 10, category?: string): PaginatedResponse<ResearchReport> {
  const db = getDb();
  const offset = (page - 1) * pageSize;

  let countQuery = 'SELECT COUNT(*) as count FROM research_reports';
  let dataQuery = `
    SELECT id, config_id as configId, config_name as configName, category,
           generated_at as generatedAt, summary
    FROM research_reports
  `;

  const params: any[] = [];

  if (category) {
    countQuery += ' WHERE category = ?';
    dataQuery += ' WHERE category = ?';
    params.push(category);
  }

  dataQuery += ' ORDER BY generated_at DESC LIMIT ? OFFSET ?';

  const { count } = db.query(countQuery).get(...params) as { count: number };
  const reports = db.query(dataQuery).all(...params, pageSize, offset) as any[];

  const reportsWithItems = reports.map(report => ({
    ...report,
    items: getReportItems(report.id),
  }));

  return {
    data: reportsWithItems,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize),
  };
}

export function getTodaysReports(): ResearchReport[] {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const reports = db.query(`
    SELECT id, config_id as configId, config_name as configName, category,
           generated_at as generatedAt, summary
    FROM research_reports
    WHERE date(generated_at) = date(?)
    ORDER BY generated_at DESC
  `).all(today) as any[];

  return reports.map(report => ({
    ...report,
    items: getReportItems(report.id),
  }));
}

export function getYesterdaysAndOlderReports(page: number = 1, pageSize: number = 10): PaginatedResponse<ResearchReport> {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const offset = (page - 1) * pageSize;

  const { count } = db.query(`
    SELECT COUNT(*) as count FROM research_reports
    WHERE date(generated_at) < date(?)
  `).get(today) as { count: number };

  const reports = db.query(`
    SELECT id, config_id as configId, config_name as configName, category,
           generated_at as generatedAt, summary
    FROM research_reports
    WHERE date(generated_at) < date(?)
    ORDER BY generated_at DESC
    LIMIT ? OFFSET ?
  `).all(today, pageSize, offset) as any[];

  const reportsWithItems = reports.map(report => ({
    ...report,
    items: getReportItems(report.id),
  }));

  return {
    data: reportsWithItems,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize),
  };
}

export function deleteAllReports(): number {
  const db = getDb();
  db.run('DELETE FROM research_items');
  const result = db.run('DELETE FROM research_reports');
  return result.changes;
}

// Audit Log
export interface AuditEntry {
  id: string;
  eventType: string;
  configId?: string;
  configName?: string;
  reportId?: string;
  model?: string;
  inputTokens: number;
  outputTokens: number;
  webSearchCalls: number;
  estimatedCostCents: number;
  runtimeMs: number;
  status: 'started' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export function createAuditEntry(entry: {
  eventType: string;
  configId?: string;
  configName?: string;
  model?: string;
}): string {
  const db = getDb();
  const id = randomUUID();

  db.run(`
    INSERT INTO audit_log (id, event_type, config_id, config_name, model, status)
    VALUES (?, ?, ?, ?, ?, 'started')
  `, [id, entry.eventType, entry.configId || null, entry.configName || null, entry.model || null]);

  return id;
}

export function updateAuditEntry(id: string, updates: {
  reportId?: string;
  inputTokens?: number;
  outputTokens?: number;
  webSearchCalls?: number;
  estimatedCostCents?: number;
  runtimeMs?: number;
  status?: 'started' | 'completed' | 'failed';
  errorMessage?: string;
}): void {
  const db = getDb();
  const now = new Date().toISOString();

  const setClauses: string[] = [];
  const params: any[] = [];

  if (updates.reportId !== undefined) {
    setClauses.push('report_id = ?');
    params.push(updates.reportId);
  }
  if (updates.inputTokens !== undefined) {
    setClauses.push('input_tokens = ?');
    params.push(updates.inputTokens);
  }
  if (updates.outputTokens !== undefined) {
    setClauses.push('output_tokens = ?');
    params.push(updates.outputTokens);
  }
  if (updates.webSearchCalls !== undefined) {
    setClauses.push('web_search_calls = ?');
    params.push(updates.webSearchCalls);
  }
  if (updates.estimatedCostCents !== undefined) {
    setClauses.push('estimated_cost_cents = ?');
    params.push(updates.estimatedCostCents);
  }
  if (updates.runtimeMs !== undefined) {
    setClauses.push('runtime_ms = ?');
    params.push(updates.runtimeMs);
  }
  if (updates.status !== undefined) {
    setClauses.push('status = ?');
    params.push(updates.status);
    if (updates.status === 'completed' || updates.status === 'failed') {
      setClauses.push('completed_at = ?');
      params.push(now);
    }
  }
  if (updates.errorMessage !== undefined) {
    setClauses.push('error_message = ?');
    params.push(updates.errorMessage);
  }

  if (setClauses.length === 0) return;

  params.push(id);
  db.run(`UPDATE audit_log SET ${setClauses.join(', ')} WHERE id = ?`, params);
}

export function getRecentAuditEntries(limit: number = 50): AuditEntry[] {
  const db = getDb();
  const rows = db.query(`
    SELECT id, event_type as eventType, config_id as configId, config_name as configName,
           report_id as reportId, model, input_tokens as inputTokens, output_tokens as outputTokens,
           web_search_calls as webSearchCalls, estimated_cost_cents as estimatedCostCents,
           runtime_ms as runtimeMs, status, error_message as errorMessage,
           created_at as createdAt, completed_at as completedAt
    FROM audit_log
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit) as AuditEntry[];

  return rows;
}

export function getRunningAuditEntries(): AuditEntry[] {
  const db = getDb();
  const rows = db.query(`
    SELECT id, event_type as eventType, config_id as configId, config_name as configName,
           report_id as reportId, model, input_tokens as inputTokens, output_tokens as outputTokens,
           web_search_calls as webSearchCalls, estimated_cost_cents as estimatedCostCents,
           runtime_ms as runtimeMs, status, error_message as errorMessage,
           created_at as createdAt, completed_at as completedAt
    FROM audit_log
    WHERE status = 'started'
    ORDER BY created_at DESC
  `).all() as AuditEntry[];

  return rows;
}

export function getAuditEntry(id: string): AuditEntry | null {
  const db = getDb();
  const row = db.query(`
    SELECT id, event_type as eventType, config_id as configId, config_name as configName,
           report_id as reportId, model, input_tokens as inputTokens, output_tokens as outputTokens,
           web_search_calls as webSearchCalls, estimated_cost_cents as estimatedCostCents,
           runtime_ms as runtimeMs, status, error_message as errorMessage,
           created_at as createdAt, completed_at as completedAt
    FROM audit_log
    WHERE id = ?
  `).get(id) as AuditEntry | null;

  return row;
}

// Get recent completed/failed entries (for showing results after refresh)
export function getRecentCompletedAuditEntries(sinceMinutes: number = 5): AuditEntry[] {
  const db = getDb();
  const rows = db.query(`
    SELECT id, event_type as eventType, config_id as configId, config_name as configName,
           report_id as reportId, model, input_tokens as inputTokens, output_tokens as outputTokens,
           web_search_calls as webSearchCalls, estimated_cost_cents as estimatedCostCents,
           runtime_ms as runtimeMs, status, error_message as errorMessage,
           created_at as createdAt, completed_at as completedAt
    FROM audit_log
    WHERE status IN ('completed', 'failed')
      AND completed_at > datetime('now', '-' || ? || ' minutes')
    ORDER BY completed_at DESC
  `).all(sinceMinutes) as AuditEntry[];

  return rows;
}

// Source Feedback
export interface SourceFeedback {
  sourceDomain: string;
  itemId?: string;
  rating: 1 | -1;
}

export interface Source {
  id: string;
  domain: string;
  name: string | null;
  category: string | null;
  trustScore: number;
  upvotes: number;
  downvotes: number;
  lastSeen: string | null;
  createdAt: string;
}

export function submitSourceFeedback(feedback: SourceFeedback): void {
  const db = getDb();
  const id = randomUUID();

  // Insert feedback
  db.run(`
    INSERT INTO source_feedback (id, source_domain, item_id, rating)
    VALUES (?, ?, ?, ?)
  `, [id, feedback.sourceDomain, feedback.itemId || null, feedback.rating]);

  // Upsert source entry
  db.run(`
    INSERT INTO sources (id, domain, upvotes, downvotes, last_seen)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(domain) DO UPDATE SET
      upvotes = upvotes + ?,
      downvotes = downvotes + ?,
      last_seen = datetime('now')
  `, [
    randomUUID(),
    feedback.sourceDomain,
    feedback.rating === 1 ? 1 : 0,
    feedback.rating === -1 ? 1 : 0,
    feedback.rating === 1 ? 1 : 0,
    feedback.rating === -1 ? 1 : 0,
  ]);

  // Recalculate trust score for this source
  recalculateSourceTrustScore(feedback.sourceDomain);
}

function recalculateSourceTrustScore(domain: string): void {
  const db = getDb();

  // Get current votes
  const source = db.query(`
    SELECT upvotes, downvotes FROM sources WHERE domain = ?
  `).get(domain) as { upvotes: number; downvotes: number } | null;

  if (!source) return;

  const total = source.upvotes + source.downvotes;
  if (total === 0) return;

  // Wilson score interval for confidence-weighted rating
  // This gives better results than simple ratio for sources with few votes
  const pos = source.upvotes;
  const n = total;
  const z = 1.96; // 95% confidence

  // Lower bound of Wilson score interval
  const phat = pos / n;
  const score = (phat + z * z / (2 * n) - z * Math.sqrt((phat * (1 - phat) + z * z / (4 * n)) / n)) / (1 + z * z / n);

  db.run(`
    UPDATE sources SET trust_score = ? WHERE domain = ?
  `, [Math.max(0, Math.min(1, score)), domain]);
}

export function recalculateTrustScores(): void {
  const db = getDb();
  const sources = db.query('SELECT domain FROM sources').all() as { domain: string }[];

  for (const source of sources) {
    recalculateSourceTrustScore(source.domain);
  }
}

export function getTopSources(category?: string): Source[] {
  const db = getDb();

  let query = `
    SELECT id, domain, name, category, trust_score as trustScore,
           upvotes, downvotes, last_seen as lastSeen, created_at as createdAt
    FROM sources
  `;

  const params: any[] = [];
  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }

  query += ' ORDER BY trust_score DESC LIMIT 50';

  return db.query(query).all(...params) as Source[];
}

export function getHighTrustSources(minScore: number = 0.6, limit: number = 10): string[] {
  const db = getDb();
  const rows = db.query(`
    SELECT domain FROM sources
    WHERE trust_score >= ?
    ORDER BY trust_score DESC
    LIMIT ?
  `).all(minScore, limit) as { domain: string }[];

  return rows.map(r => r.domain);
}
