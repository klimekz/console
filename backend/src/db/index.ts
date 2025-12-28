import { Database } from 'bun:sqlite';
import { createSchema, seedDefaultConfigs } from './schema';
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
    seedDefaultConfigs(db);
  }
  return db;
}

// Research Configs
export function getAllConfigs(): ResearchConfig[] {
  const db = getDb();
  const rows = db.query(`
    SELECT id, name, description, prompt, category, topics, enabled, schedule,
           created_at as createdAt, updated_at as updatedAt
    FROM research_configs
    ORDER BY category, name
  `).all() as any[];

  return rows.map(row => ({
    ...row,
    topics: JSON.parse(row.topics),
    enabled: Boolean(row.enabled),
  }));
}

export function getConfigById(id: string): ResearchConfig | null {
  const db = getDb();
  const row = db.query(`
    SELECT id, name, description, prompt, category, topics, enabled, schedule,
           created_at as createdAt, updated_at as updatedAt
    FROM research_configs WHERE id = ?
  `).get(id) as any;

  if (!row) return null;

  return {
    ...row,
    topics: JSON.parse(row.topics),
    enabled: Boolean(row.enabled),
  };
}

export function createConfig(config: Omit<ResearchConfig, 'id' | 'createdAt' | 'updatedAt'>): ResearchConfig {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.run(`
    INSERT INTO research_configs (id, name, description, prompt, category, topics, enabled, schedule, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, config.name, config.description, config.prompt, config.category, JSON.stringify(config.topics), config.enabled ? 1 : 0, config.schedule, now, now]);

  return { ...config, id, createdAt: now, updatedAt: now };
}

export function updateConfig(id: string, updates: Partial<ResearchConfig>): ResearchConfig | null {
  const db = getDb();
  const existing = getConfigById(id);
  if (!existing) return null;

  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };

  db.run(`
    UPDATE research_configs
    SET name = ?, description = ?, prompt = ?, category = ?, topics = ?,
        enabled = ?, schedule = ?, updated_at = ?
    WHERE id = ?
  `, [updated.name, updated.description, updated.prompt, updated.category, JSON.stringify(updated.topics), updated.enabled ? 1 : 0, updated.schedule, updated.updatedAt, id]);

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
