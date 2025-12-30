import { Database } from 'bun:sqlite';

export function createSchema(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS research_configs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      prompt TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('papers', 'news', 'markets', 'politics')),
      topics TEXT NOT NULL, -- JSON array
      preferred_sources TEXT, -- JSON array of preferred domains
      blocked_sources TEXT, -- JSON array of blocked domains
      enabled INTEGER NOT NULL DEFAULT 1,
      schedule TEXT NOT NULL DEFAULT '0 6 * * *', -- daily at 6 AM
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Sources reputation table for feedback-based curation
  db.run(`
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      domain TEXT UNIQUE NOT NULL,
      name TEXT,
      category TEXT, -- 'academic', 'engineering_blog', 'news', 'social'
      trust_score REAL DEFAULT 0.5, -- 0-1 scale
      upvotes INTEGER DEFAULT 0,
      downvotes INTEGER DEFAULT 0,
      last_seen TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_sources_domain
    ON sources(domain)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_sources_trust
    ON sources(trust_score DESC)
  `);

  // Source feedback from users
  db.run(`
    CREATE TABLE IF NOT EXISTS source_feedback (
      id TEXT PRIMARY KEY,
      source_domain TEXT NOT NULL,
      item_id TEXT,
      rating INTEGER NOT NULL, -- 1 (upvote) or -1 (downvote)
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_source_feedback_domain
    ON source_feedback(source_domain)
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS research_reports (
      id TEXT PRIMARY KEY,
      config_id TEXT NOT NULL,
      config_name TEXT NOT NULL,
      category TEXT NOT NULL,
      generated_at TEXT NOT NULL DEFAULT (datetime('now')),
      summary TEXT,
      FOREIGN KEY (config_id) REFERENCES research_configs(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS research_items (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      title TEXT NOT NULL,
      source TEXT,
      url TEXT,
      summary TEXT,
      relevance_score REAL DEFAULT 0,
      published_at TEXT,
      category TEXT,
      tags TEXT, -- JSON array
      FOREIGN KEY (report_id) REFERENCES research_reports(id)
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_reports_generated_at
    ON research_reports(generated_at DESC)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_reports_config_id
    ON research_reports(config_id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_items_report_id
    ON research_items(report_id)
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      config_id TEXT,
      config_name TEXT,
      report_id TEXT,
      model TEXT,
      input_tokens INTEGER DEFAULT 0,
      output_tokens INTEGER DEFAULT 0,
      web_search_calls INTEGER DEFAULT 0,
      estimated_cost_cents REAL DEFAULT 0,
      runtime_ms INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'started',
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_audit_created_at
    ON audit_log(created_at DESC)
  `);
}

export function seedDefaultConfigs(db: Database): void {
  // Schedules spaced 5 minutes apart to avoid conflicts
  const defaultConfigs = [
    {
      id: 'papers-ai-computing',
      name: 'AI/ML Research',
      description: 'Substantive AI/ML research papers and technical whitepapers',
      prompt: `Prioritize papers introducing new architectures, training methods, or significant benchmark improvements.`,
      category: 'papers',
      topics: JSON.stringify(['LLMs', 'transformers', 'reasoning', 'agents', 'multimodal', 'RLHF', 'inference optimization']),
      preferredSources: JSON.stringify([
        'arxiv.org',
        'openreview.net',
        'openai.com/research',
        'anthropic.com/research',
        'deepmind.google/research',
        'ai.meta.com/research',
        'research.google',
      ]),
      blockedSources: JSON.stringify([]),
      schedule: '0 6 * * *', // 6:00 AM daily
    },
    {
      id: 'news-tech',
      name: 'Tech Industry',
      description: 'AI labs, FAANG, and startup ecosystem news',
      prompt: `Focus on substantive developments, not rumors or speculation.`,
      category: 'news',
      topics: JSON.stringify(['OpenAI', 'Anthropic', 'Google', 'Meta AI', 'xAI', 'startups', 'developer tools']),
      preferredSources: JSON.stringify([
        'techcrunch.com',
        'theverge.com',
        'arstechnica.com',
        'x.com',
      ]),
      blockedSources: JSON.stringify([]),
      schedule: '5 6 * * *', // 6:05 AM daily
    },
    {
      id: 'markets-tech',
      name: 'Markets & Finance',
      description: 'Tech equities, Mag 7, and market movers',
      prompt: `Focus on price action, earnings, and analyst moves for tech/growth names.`,
      category: 'markets',
      topics: JSON.stringify(['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'semiconductors', 'S&P tech']),
      preferredSources: JSON.stringify([
        'bloomberg.com',
        'reuters.com',
        'wsj.com',
        'seekingalpha.com',
      ]),
      blockedSources: JSON.stringify([]),
      schedule: '10 6 * * *', // 6:10 AM daily
    },
    {
      id: 'politics-tech',
      name: 'US Politics',
      description: 'US presidency, Congress, and federal policy',
      prompt: `Cover major federal developments with awareness of tech implications.`,
      category: 'politics',
      topics: JSON.stringify(['presidency', 'Congress', 'Supreme Court', 'AI regulation', 'antitrust', 'trade policy']),
      preferredSources: JSON.stringify([
        'politico.com',
        'axios.com',
        'thehill.com',
        'reuters.com',
        'apnews.com',
      ]),
      blockedSources: JSON.stringify([]),
      schedule: '15 6 * * *', // 6:15 AM daily
    },
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO research_configs
    (id, name, description, prompt, category, topics, preferred_sources, blocked_sources, schedule)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const config of defaultConfigs) {
    stmt.run(
      config.id,
      config.name,
      config.description,
      config.prompt,
      config.category,
      config.topics,
      config.preferredSources,
      config.blockedSources,
      config.schedule
    );
  }
}

// Migration for existing databases
export function migrateSchema(db: Database): void {
  // Add preferred_sources and blocked_sources columns if they don't exist
  try {
    db.run('ALTER TABLE research_configs ADD COLUMN preferred_sources TEXT');
  } catch {
    // Column already exists
  }
  try {
    db.run('ALTER TABLE research_configs ADD COLUMN blocked_sources TEXT');
  } catch {
    // Column already exists
  }
}
