import OpenAI from 'openai';
import type { ResearchConfig, DeepResearchResponse, ResearchItem } from '../types';
import * as db from '../db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 5 * 60 * 1000, // 5 minutes timeout
});

// Use GPT-4o for research tasks - reliable and capable
const RESEARCH_MODEL = 'gpt-4o';

// Retry configuration for rate limits
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 5_000; // Start with 5 seconds for rate limits

// Token pricing for GPT-4o (per 1M tokens, as of Dec 2024)
const INPUT_TOKEN_COST_PER_MILLION = 250; // $2.50 per 1M input tokens
const OUTPUT_TOKEN_COST_PER_MILLION = 1000; // $10.00 per 1M output tokens

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('429') || error.message.includes('Rate limit');
  }
  return false;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function buildResearchPrompt(config: ResearchConfig): string {
  const today = getTodayDate();
  const topicsStr = config.topics.join(', ');

  return `TODAY'S DATE: ${today}

You are a research analyst. Find the TOP ${config.category === 'papers' ? 'research papers and technical articles' : config.category === 'news' ? 'tech news stories and announcements' : 'market news and financial updates'} published in the last 48 hours.

${config.prompt}

Topics to focus on: ${topicsStr}

IMPORTANT REQUIREMENTS:
- Only include content published within the last 48 hours (since ${today})
- Return up to 15 items maximum
- Provide real, verifiable URLs
- Sort by relevance (most relevant first)

Return your findings as JSON in this exact format:
{
  "summary": "A brief 2-3 sentence overview of the key findings",
  "items": [
    {
      "title": "Article/Paper Title",
      "source": "Source name (publication, website, author)",
      "url": "Full URL to the content",
      "summary": "2-3 sentence summary of this item",
      "relevanceScore": 8.5,
      "publishedAt": "YYYY-MM-DD",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Rules:
- relevanceScore must be between 1-10
- publishedAt must be in YYYY-MM-DD format
- tags should be lowercase
- Only return valid JSON`;
}

function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * INPUT_TOKEN_COST_PER_MILLION * 100; // in cents
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_TOKEN_COST_PER_MILLION * 100; // in cents
  return inputCost + outputCost;
}

export async function runDeepResearch(config: ResearchConfig, auditId: string): Promise<DeepResearchResponse> {
  const prompt = buildResearchPrompt(config);
  const startTime = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`Rate limit hit, waiting ${delayMs / 1000}s before retry ${attempt}/${MAX_RETRIES}...`);
        await sleep(delayMs);
      }

      // Use the chat completions API with JSON response format
      const response = await openai.chat.completions.create({
        model: RESEARCH_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a research analyst assistant. Always respond with valid JSON matching the requested format. Be thorough and provide accurate, relevant information.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4096,
      });

      const runtimeMs = Date.now() - startTime;

      // Extract usage info from the standard response format
      const usage = response.usage;
      const inputTokens = usage?.prompt_tokens || 0;
      const outputTokens = usage?.completion_tokens || 0;

      // Calculate cost
      const estimatedCostCents = calculateCost(inputTokens, outputTokens);

      // Extract the text output from the chat completion response
      const outputText = response.choices[0]?.message?.content;

      if (!outputText) {
        console.error('No output text found in response:', JSON.stringify(response, null, 2));
        db.updateAuditEntry(auditId, {
          inputTokens,
          outputTokens,
          webSearchCalls: 0,
          estimatedCostCents,
          runtimeMs,
          status: 'failed',
          errorMessage: 'No output text in response',
        });
        return { summary: 'No response from research', items: [] };
      }

      // Parse JSON from the response
      // Try to extract JSON from markdown code blocks if present
      let jsonStr = outputText;
      const jsonMatch = outputText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr) as DeepResearchResponse;

      // Update audit entry with success metrics
      db.updateAuditEntry(auditId, {
        inputTokens,
        outputTokens,
        webSearchCalls: 0,
        estimatedCostCents,
        runtimeMs,
        status: 'completed',
      });

      console.log(`Research completed in ${(runtimeMs / 1000).toFixed(1)}s - ${inputTokens}/${outputTokens} tokens, $${(estimatedCostCents / 100).toFixed(4)}`);

      return parsed;
    } catch (error) {
      lastError = error as Error;
      console.error(`Research attempt ${attempt + 1} failed:`, lastError.message);

      // If it's a rate limit error and we have retries left, continue
      if (isRateLimitError(error) && attempt < MAX_RETRIES) {
        console.log(`Rate limit error on attempt ${attempt + 1}, will retry...`);
        continue;
      }

      // For non-rate-limit errors or exhausted retries, fail immediately
      break;
    }
  }

  // All retries exhausted or non-retryable error
  const runtimeMs = Date.now() - startTime;
  const errorMessage = lastError?.message || 'Unknown error';

  db.updateAuditEntry(auditId, {
    runtimeMs,
    status: 'failed',
    errorMessage,
  });

  console.error('Research failed after retries:', lastError);
  return { summary: 'Research failed: ' + errorMessage, items: [] };
}

export async function executeResearchConfig(configId: string): Promise<db.ResearchReport | null> {
  const config = db.getConfigById(configId);
  if (!config) {
    console.error(`Config not found: ${configId}`);
    return null;
  }

  console.log(`Running deep research for config: ${config.name}`);

  // Create audit entry
  const auditId = db.createAuditEntry({
    eventType: 'research_run',
    configId: config.id,
    configName: config.name,
    model: RESEARCH_MODEL,
  });

  const research = await runDeepResearch(config, auditId);

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

  // Update audit with report ID
  db.updateAuditEntry(auditId, { reportId: report.id });

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
