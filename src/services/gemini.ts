import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface AnalysisResult {
  category: 'BUG' | 'COMPLAINT' | 'SUGGESTION' | 'FEATURE_REQUEST' | 'OTHER';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  summary: string;
}

export async function analyzeFeedback(text: string): Promise<AnalysisResult> {
  if (!text || text.trim().length === 0) {
    return {
      category: 'OTHER',
      priority: 'LOW',
      sentiment: 'NEUTRAL',
      summary: 'Empty feedback submitted.',
    };
  }

  // If Gemini API Key is missing, run local rule-based fallback
  if (!genAI) {
    console.log('[Gemini Service] No API Key found. Running local rule-based analyzer.');
    return ruleBasedAnalysis(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are an expert customer feedback AI classifier. 
Analyze the customer feedback and return a strictly formatted JSON object.
Do NOT output any markdown tags (like \`\`\`json) or any conversational text. Simply return the JSON raw text.

The JSON object must contain exactly these fields:
1. "category": Must be one of the following strings: "BUG", "COMPLAINT", "SUGGESTION", "FEATURE_REQUEST", "OTHER".
2. "priority": Must be one of: "HIGH", "MEDIUM", "LOW".
3. "sentiment": Must be one of: "POSITIVE", "NEUTRAL", "NEGATIVE".
4. "summary": A concise 1-sentence summary of the customer's issue (maximum 12 words).

Example of expected output format:
{
  "category": "BUG",
  "priority": "HIGH",
  "sentiment": "NEGATIVE",
  "summary": "Application crashes immediately when clicking the login button."
}`;

    const prompt = `${systemPrompt}\n\nCustomer Feedback: "${text}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Clean any accidental markdown code blocks
    const cleanedJson = responseText
      .replace(/^```json\s*/i, '')
      .replace(/```$/, '')
      .trim();

    const parsed = JSON.parse(cleanedJson);

    // Validate values against expected types
    const categories = ['BUG', 'COMPLAINT', 'SUGGESTION', 'FEATURE_REQUEST', 'OTHER'];
    const priorities = ['HIGH', 'MEDIUM', 'LOW'];
    const sentiments = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];

    const category = categories.includes(parsed.category) ? parsed.category : 'OTHER';
    const priority = priorities.includes(parsed.priority) ? parsed.priority : 'MEDIUM';
    const sentiment = sentiments.includes(parsed.sentiment) ? parsed.sentiment : 'NEUTRAL';
    const summary = parsed.summary || (text.length > 80 ? text.substring(0, 77) + '...' : text);

    return {
      category: category as any,
      priority: priority as any,
      sentiment: sentiment as any,
      summary,
    };
  } catch (error) {
    console.error('[Gemini Service] Error calling Gemini API, falling back to local analyzer:', error);
    return ruleBasedAnalysis(text);
  }
}

function ruleBasedAnalysis(text: string): AnalysisResult {
  const lower = text.toLowerCase();

  // 1. Determine Category
  let category: AnalysisResult['category'] = 'OTHER';
  if (
    lower.includes('bug') ||
    lower.includes('error') ||
    lower.includes('crash') ||
    lower.includes('broken') ||
    lower.includes('fail') ||
    lower.includes('not working') ||
    lower.includes('freeze') ||
    lower.includes('incorrect')
  ) {
    category = 'BUG';
  } else if (
    lower.includes('suggest') ||
    lower.includes('idea') ||
    lower.includes('would be nice') ||
    lower.includes('improve') ||
    lower.includes('could you')
  ) {
    category = 'SUGGESTION';
  } else if (
    lower.includes('request') ||
    lower.includes('feature') ||
    lower.includes('add') ||
    lower.includes('want to see') ||
    lower.includes('missing')
  ) {
    category = 'FEATURE_REQUEST';
  } else if (
    lower.includes('bad') ||
    lower.includes('slow') ||
    lower.includes('hate') ||
    lower.includes('horrible') ||
    lower.includes('disappointed') ||
    lower.includes('annoying') ||
    lower.includes('frustrated') ||
    lower.includes('terrible')
  ) {
    category = 'COMPLAINT';
  }

  // 2. Determine Priority
  let priority: AnalysisResult['priority'] = 'MEDIUM';
  if (
    lower.includes('urgent') ||
    lower.includes('critical') ||
    lower.includes('broken') ||
    lower.includes('asap') ||
    lower.includes('crash') ||
    lower.includes('stop') ||
    lower.includes('cannot log') ||
    lower.includes('payment')
  ) {
    priority = 'HIGH';
  } else if (
    lower.includes('minor') ||
    lower.includes('low') ||
    lower.includes('future') ||
    lower.includes('eventually') ||
    lower.includes('typo')
  ) {
    priority = 'LOW';
  }

  // 3. Determine Sentiment
  let sentiment: AnalysisResult['sentiment'] = 'NEUTRAL';
  if (
    lower.includes('love') ||
    lower.includes('great') ||
    lower.includes('awesome') ||
    lower.includes('best') ||
    lower.includes('good') ||
    lower.includes('helpful') ||
    lower.includes('happy') ||
    lower.includes('amazing')
  ) {
    sentiment = 'POSITIVE';
  } else if (
    lower.includes('bad') ||
    lower.includes('broken') ||
    lower.includes('fail') ||
    lower.includes('terrible') ||
    lower.includes('worst') ||
    lower.includes('annoying') ||
    lower.includes('slow') ||
    lower.includes('hate') ||
    lower.includes('disappointed') ||
    lower.includes('frustrated')
  ) {
    sentiment = 'NEGATIVE';
  }

  // 4. Summarize (concise 1-sentence, max 12 words)
  let summary = text;
  if (text.length > 60) {
    // Take the first clause or first 8 words
    const words = text.split(/\s+/);
    if (words.length > 8) {
      summary = words.slice(0, 8).join(' ') + '...';
    }
  }

  return {
    category,
    priority,
    sentiment,
    summary,
  };
}
