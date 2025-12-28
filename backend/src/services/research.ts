import OpenAI from 'openai';
import type { ResearchConfig, DeepResearchResponse, ResearchItem } from '../types';
import * as db from '../db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a research analyst that finds and summarizes the most relevant, recent content based on user queries.
You MUST respond with valid JSON in this exact format:
{
  "summary": "A brief 2-3 sentence overview of the findings",
  "items": [
    {
      "title": "Article/Paper Title",
      "source": "Source name (publication, website, author)",
      "url": "Full URL to the content",
      "summary": "2-3 sentence summary of this item",
      "relevanceScore": 8.5,
      "publishedAt": "2024-01-15 or null if unknown",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Rules:
- Return up to 15 items maximum
- Sort by relevance score (highest first)
- relevanceScore must be between 1-10
- Focus on recent content (last 24-72 hours preferred, up to 1 week)
- Ensure URLs are valid and accessible
- Tags should be lowercase, single words or short phrases`;

export async function runDeepResearch(config: ResearchConfig): Promise<DeepResearchResponse> {
  const topicsStr = config.topics.join(', ');
  const userPrompt = `${config.prompt}

Topics to focus on: ${topicsStr}
Category: ${config.category}

Find up to 15 of the most relevant, recent items. Return your response as valid JSON.`;

  try {
    // Use OpenAI's responses API with web search tool for deep research
    const response = await openai.responses.create({
      model: 'gpt-4o',
      tools: [{ type: 'web_search_preview' }],
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    });

    // Extract the text response
    let textContent = '';
    for (const item of response.output) {
      if (item.type === 'message') {
        for (const content of item.content) {
          if (content.type === 'output_text') {
            textContent += content.text;
          }
        }
      }
    }

    // Parse the JSON response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', textContent);
      return { summary: 'Failed to parse research results', items: [] };
    }

    const parsed = JSON.parse(jsonMatch[0]) as DeepResearchResponse;
    return parsed;
  } catch (error) {
    console.error('Deep research error:', error);

    // Fallback to standard chat completion if responses API fails
    return runFallbackResearch(config, topicsStr);
  }
}

async function runFallbackResearch(config: ResearchConfig, topicsStr: string): Promise<DeepResearchResponse> {
  const userPrompt = `${config.prompt}

Topics to focus on: ${topicsStr}
Category: ${config.category}

Based on your training data, provide up to 15 relevant items that would typically be trending or important in these areas. Return your response as valid JSON.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return { summary: 'No response from AI', items: [] };
  }

  return JSON.parse(content) as DeepResearchResponse;
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
