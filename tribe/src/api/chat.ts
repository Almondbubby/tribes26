import { openaiChat } from './openai'
import { geminiChat } from './gemini'

export type ChatModelId = 'gpt-4o' | 'gemini-2.0-flash'

export async function chatCompletion(params: {
  model: ChatModelId
  systemPrompt: string
  userPrompt: string
  openaiKey: string
  geminiKey: string
}): Promise<string> {
  const { model, systemPrompt, userPrompt, openaiKey, geminiKey } = params

  if (model === 'gpt-4o') {
    if (!openaiKey) throw new Error('Add VITE_OPENAI_API_KEY to your .env file')
    return openaiChat({ systemPrompt, userPrompt, apiKey: openaiKey, model: 'gpt-4o' })
  }

  if (model === 'gemini-2.0-flash') {
    if (!geminiKey) throw new Error('Add VITE_GEMINI_API_KEY to your .env file')
    return geminiChat({ systemPrompt, userPrompt, apiKey: geminiKey, model: 'gemini-2.0-flash' })
  }

  throw new Error(`Unknown model: ${model}`)
}
