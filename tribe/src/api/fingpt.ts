/**
 * FinGPT-style analysis via OpenRouter.
 * See: https://github.com/AI4Finance-Foundation/FinGPT
 */

import { chatCompletion, type OpenRouterModel } from './openrouter'
import {
  FINGPT_MARKET_SYSTEM_PROMPT,
  FINGPT_DOCUMENT_SYSTEM_PROMPT,
} from '../prompts'

const DEFAULT_MODEL: OpenRouterModel = 'openai/gpt-4o'

export async function fingptMarketAnalysis(params: {
  industryOrMarket: string
  apiKey: string
}): Promise<string> {
  const { industryOrMarket, apiKey } = params

  return chatCompletion({
    model: DEFAULT_MODEL,
    systemPrompt: FINGPT_MARKET_SYSTEM_PROMPT,
    userPrompt: `Generate a strategic deep dive for the following industry or market:\n\n${industryOrMarket}`,
    apiKey,
  })
}

export async function fingptDocumentAnalysis(params: {
  documentContent: string
  apiKey: string
}): Promise<string> {
  const { documentContent, apiKey } = params

  return chatCompletion({
    model: DEFAULT_MODEL,
    systemPrompt: FINGPT_DOCUMENT_SYSTEM_PROMPT,
    userPrompt: `Analyze the following document(s):\n\n${documentContent}`,
    apiKey,
  })
}
