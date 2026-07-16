import OpenAI from 'openai'

const openaiKey = process.env.OPENAI_API_KEY;

if (!openaiKey) {
  console.warn("⚠️ OpenAI API key (OPENAI_API_KEY) is missing. AI Semantic Search will automatically run fuzzy text fallback queries.");
}

export const openai = openaiKey
  ? new OpenAI({ apiKey: openaiKey })
  : null;
