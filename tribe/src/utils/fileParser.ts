import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

const MAX_TEXT_LENGTH = 120_000

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

  if (ext === 'pdf') {
    return extractPdfText(file)
  }
  if (ext === 'csv' || ext === 'txt' || ext === 'json' || ext === 'md') {
    return extractTextFile(file)
  }

  throw new Error(`Unsupported file type: ${ext}. Use PDF, CSV, TXT, JSON, or MD.`)
}

async function extractTextFile(file: File): Promise<string> {
  const text = await file.text()
  return truncate(text)
}

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const numPages = pdf.numPages
  const parts: string[] = []

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    parts.push(text)
  }

  const full = parts.join('\n\n')
  return truncate(full)
}

function truncate(text: string): string {
  if (text.length <= MAX_TEXT_LENGTH) return text
  return text.slice(0, MAX_TEXT_LENGTH) + '\n\n[... truncated for length ...]'
}
