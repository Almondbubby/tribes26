/**
 * FinRobot-style analysis via OpenRouter.
 * Uses the same LLM infrastructure with FinRobot Market Forecaster prompts.
 * See: https://github.com/AI4Finance-Foundation/FinRobot
 */

import { chatCompletion, type OpenRouterModel } from './openrouter'
import {
  FINROBOT_SYSTEM_PROMPT,
  buildFinRobotPrompt,
  DOCUMENT_FINROBOT_SYSTEM_PROMPT,
} from '../prompts'

const DEFAULT_MODEL: OpenRouterModel = 'openai/gpt-4o'

export async function finrobotAnalysis(params: {
  tickerOrCompany: string
  apiKey: string
  model?: OpenRouterModel
}): Promise<string> {
  const { tickerOrCompany, apiKey, model = DEFAULT_MODEL } = params

  return chatCompletion({
    model,
    systemPrompt: FINROBOT_SYSTEM_PROMPT,
    userPrompt: buildFinRobotPrompt(tickerOrCompany),
    apiKey,
  })
}

export async function finrobotDocumentAnalysis(params: {
  documentContent: string
  apiKey: string
}): Promise<string> {
  const { documentContent, apiKey } = params

  return chatCompletion({
    model: DEFAULT_MODEL,
    systemPrompt: DOCUMENT_FINROBOT_SYSTEM_PROMPT,
    userPrompt: `Analyze the following document(s):\n\n${documentContent}`,
    apiKey,
  })
}
