import OpenAI from 'openai';
import type { ResearchConfig, DeepResearchResponse, ResearchItem } from '../types';
import * as db from '../db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getSystemPrompt(): string {
  const today = getTodayDate();
  return `You are a research analyst finding the LATEST content published TODAY or in the last 24-48 hours.

TODAY'S DATE: ${today}

CRITICAL: Only include content published on or after ${today} or within the last 48 hours. Do NOT include old content from weeks or months ago.

You MUST respond with valid JSON in this exact format:
{
  "summary": "A brief 2-3 sentence overview of today's key findings",
  "items": [
    {
      "title": "Article/Paper Title",
      "source": "Source name (publication, website, author)",
      "url": "Full URL to the content",
      "summary": "2-3 sentence summary of this item",
      "relevanceScore": 8.5,
      "publishedAt": "${today}",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Rules:
- ONLY include content from the last 48 hours (published on or after ${today} minus 2 days)
- Return up to 15 items maximum
- Sort by relevance score (highest first)
- relevanceScore must be between 1-10
- publishedAt MUST be a real date in YYYY-MM-DD format, recent dates only
- Ensure URLs are real and accessible
- Tags should be lowercase`;
}

export async function runDeepResearch(config: ResearchConfig): Promise<DeepResearchResponse> {
  const today = getTodayDate();
  const topicsStr = config.topics.join(', ');

  const userPrompt = `Find the TOP ${config.category === 'papers' ? 'research papers and technical articles' : config.category === 'news' ? 'tech news stories and announcements' : 'market news and financial updates'} published TODAY (${today}) or in the last 48 hours.

${config.prompt}

Topics: ${topicsStr}

IMPORTANT: Today is ${today}. Only return content published on ${today} or within the last 2 days. No old content.

Return as JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { summary: 'No response from AI', items: [] };
    }

    const parsed = JSON.parse(content) as DeepResearchResponse;
    return parsed;
  } catch (error) {
    console.error('Deep research error:', error);
    return { summary: 'Research failed: ' + (error as Error).message, items: [] };
  }
}

export async function executeResearchConfig(configId: string): Promise<db.ResearchReport | null> {
  const config = db.getConfigById(configId);
  if (!config) {
    console.error(`Config not found: ${configId}`);
    return null;
  }

  console.log(`Running research for config: ${config.name}`);

  const research = await runDeepResearch(config);

  const reportItems: Omit<ResearchItem, 'id' | 'reportId'>[] = research.items.map(item => ({
    title: item.title,
    source: item.source,
    url: item.url,
    summary: item.summary,
    relevanceScore: item.relevanceScore,
    publishedAt: item.publishedAt,
    category: config.category,
    tags: item.tags,
  }));

  const report = db.createReport(
    {
      configId: config.id,
      configName: config.name,
      category: config.category,
      summary: research.summary,
    },
    reportItems
  );

  console.log(`Created report ${report.id} with ${report.items.length} items`);
  return report;
}

export async function executeAllEnabledConfigs(): Promise<db.ResearchReport[]> {
  const configs = db.getAllConfigs().filter(c => c.enabled);
  const reports: db.ResearchReport[] = [];

  for (const config of configs) {
    try {
      const report = await executeResearchConfig(config.id);
      if (report) {
        reports.push(report);
      }
    } catch (error) {
      console.error(`Failed to execute research for ${config.name}:`, error);
    }
  }

  return reports;
}
