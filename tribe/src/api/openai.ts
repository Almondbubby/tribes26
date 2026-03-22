const OPENAI_BASE = 'https://api.openai.com/v1'

export async function openaiChat(params: {
  systemPrompt: string
  userPrompt: string
  apiKey: string
  model?: string
}): Promise<string> {
  const { systemPrompt, userPrompt, apiKey, model = 'gpt-4o' } = params

  const response = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `OpenAI error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    throw new Error('Invalid response from OpenAI')
  }
  return content
}
