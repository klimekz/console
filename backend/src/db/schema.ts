import { Database } from 'bun:sqlite';

export function createSchema(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS research_configs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      prompt TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('papers', 'news', 'markets')),
      topics TEXT NOT NULL, -- JSON array
      enabled INTEGER NOT NULL DEFAULT 1,
      schedule TEXT NOT NULL DEFAULT '0 6 * * *', -- daily at 6 AM
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
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
}

export function seedDefaultConfigs(db: Database): void {
  const defaultConfigs = [
    {
      id: 'papers-ai-computing',
      name: 'AI & Computing Papers',
      description: 'Top AI and computing research papers, white papers, and academic publications',
      prompt: `Search for the top content published since the last run up to 15 items focusing on:
- Emerging AI research papers and breakthroughs
- Computing and systems research
- Machine learning advancements
- White papers from major tech companies and research labs

Present results in structured format with:
- Title
- Source/Authors
- URL
- Brief summary (2-3 sentences)
- Relevance score (1-10)
- Publication date
- Tags for categorization`,
      category: 'papers',
      topics: JSON.stringify(['artificial intelligence', 'machine learning', 'computing', 'systems research', 'deep learning', 'LLMs']),
    },
    {
      id: 'news-tech',
      name: 'Tech Industry News',
      description: 'Top technology and startup news stories',
      prompt: `Search for the top 15 technology news stories since the last run covering:
- Major tech company announcements
- Startup funding and acquisitions
- Product launches
- Industry trends and analysis

Present results in structured format with:
- Title
- Source
- URL
- Brief summary (2-3 sentences)
- Relevance score (1-10)
- Publication date
- Tags for categorization`,
      category: 'news',
      topics: JSON.stringify(['technology', 'startups', 'AI', 'software', 'hardware']),
    },
    {
      id: 'markets-portfolio',
      name: 'Markets & Portfolio',
      description: 'Market analysis for stocks, ETFs, and crypto holdings',
      prompt: `Research and analyze market movements for portfolio holdings including:
- Major stock indices performance
- ETF sector analysis
- Cryptocurrency market trends
- Notable earnings and economic reports

Provide up to 15 key insights with:
- Title/Topic
- Source
- URL (if applicable)
- Analysis summary (2-3 sentences)
- Relevance score (1-10)
- Date
- Tags for categorization`,
      category: 'markets',
      topics: JSON.stringify(['stocks', 'ETFs', 'cryptocurrency', 'market analysis', 'economic indicators']),
    },
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO research_configs
    (id, name, description, prompt, category, topics)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const config of defaultConfigs) {
    stmt.run(config.id, config.name, config.description, config.prompt, config.category, config.topics);
  }
}
