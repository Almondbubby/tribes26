const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta'

export async function geminiChat(params: {
  systemPrompt: string
  userPrompt: string
  apiKey: string
  model?: string
}): Promise<string> {
  const { systemPrompt, userPrompt, apiKey, model = 'gemini-2.0-flash' } = params

  const response = await fetch(
    `${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          {
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.7,
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Gemini error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (typeof text !== 'string') {
    throw new Error('Invalid response from Gemini')
  }
  return text
}
