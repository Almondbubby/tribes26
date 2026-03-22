import { useState, useCallback } from 'react'
import { chatCompletion, type ChatModelId } from '../api/chat'
import { DOCUMENT_ANALYSIS_SYSTEM_PROMPT } from '../prompts'
import { extractTextFromFile } from '../utils/fileParser'
import './DocumentAnalysis.css'

const MODELS: { id: ChatModelId; name: string }[] = [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
]

const ACCEPT_TYPES = '.pdf,.csv,.txt,.json,.md'

type FileWithText = {
  file: File
  extractedText: string
}

export function DocumentAnalysis() {
  const [files, setFiles] = useState<FileWithText[]>([])
  const [model, setModel] = useState<ChatModelId>(MODELS[0].id)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY

  const processFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList?.length) return
    setError(null)
    const results: FileWithText[] = []
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      try {
        const text = await extractTextFromFile(file)
        results.push({ file, extractedText: text })
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to parse ${file.name}`)
      }
    }
    setFiles((prev) => [...prev, ...results])
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      processFiles(e.dataTransfer.files)
    },
    [processFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files)
      e.target.value = ''
    },
    [processFiles]
  )

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAnalyze = async () => {
    if (!files.length) {
      setError('Add at least one file')
      return
    }
    if (model === 'gpt-4o' && !openaiKey) {
      setError('Add VITE_OPENAI_API_KEY to your .env file')
      return
    }
    if (model === 'gemini-2.0-flash' && !geminiKey) {
      setError('Add VITE_GEMINI_API_KEY to your .env file')
      return
    }

    setIsLoading(true)
    setAnalysis(null)
    setError(null)

    try {
      const combinedContent = files
        .map(
          (f) =>
            `--- ${f.file.name} ---\n${f.extractedText}`
        )
        .join('\n\n')

      const content = await chatCompletion({
        model,
        systemPrompt: DOCUMENT_ANALYSIS_SYSTEM_PROMPT,
        userPrompt: `Analyze the following document(s):\n\n${combinedContent}`,
        openaiKey: openaiKey ?? '',
        geminiKey: geminiKey ?? '',
      })
      setAnalysis(content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze documents')
      setAnalysis(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="doc-analysis">
      <header className="doc-header">
        <h1>Document Analysis</h1>
        <p className="doc-subtitle">Upload files to analyze with AI. Supports PDF, CSV, TXT, JSON, and MD.</p>
      </header>

      <div className="model-selector doc-model">
        <label htmlFor="doc-model">Model</label>
        <select
          id="doc-model"
          value={model}
          onChange={(e) => setModel(e.target.value as ChatModelId)}
          disabled={isLoading}
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div
        className={`dropzone ${isDragging ? 'dropzone-active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          id="file-input"
          accept={ACCEPT_TYPES}
          multiple
          onChange={handleFileInput}
          className="dropzone-input"
        />
        <label htmlFor="file-input" className="dropzone-label">
          <span className="dropzone-icon">📄</span>
          <span>Drag and drop files here, or click to browse</span>
          <span className="dropzone-hint">PDF, CSV, TXT, JSON, MD</span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <h3>Files ({files.length})</h3>
          <ul>
            {files.map(({ file }, i) => (
              <li key={`${file.name}-${i}`} className="file-item">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                <button
                  type="button"
                  className="file-remove"
                  onClick={() => removeFile(i)}
                  disabled={isLoading}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      <button
        className="generate-btn doc-analyze-btn"
        onClick={handleAnalyze}
        disabled={isLoading || files.length === 0}
      >
        {isLoading ? (
          <>
            <span className="spinner" />
            Analyzing...
          </>
        ) : (
          'Analyze Documents'
        )}
      </button>

      {(isLoading || analysis) && (
        <section className="output-section doc-output">
          <h2>Analysis</h2>
          {isLoading ? (
            <div className="loading-placeholder">
              <div className="loading-bar" />
              <div className="loading-bar delay-1" />
              <div className="loading-bar delay-2" />
            </div>
          ) : analysis ? (
            <div className="deep-dive-content">
              {analysis.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return <h3 key={i}>{line.slice(3)}</h3>
                }
                if (line.startsWith('1. ') || line.startsWith('- ') || line.startsWith('* ')) {
                  return <p key={i} className="list-item">{line}</p>
                }
                return <p key={i}>{line || <br />}</p>
              })}
            </div>
          ) : null}
        </section>
      )}
    </div>
  )
}
