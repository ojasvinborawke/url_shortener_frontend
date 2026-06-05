import { useState } from 'react'
import { urlsApi } from '../api/client'

export default function CreateLinkForm({ onCreated, onCancel }) {
  const [originalUrl, setOriginalUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
  e.preventDefault()

  const trimmedUrl = originalUrl.trim()

  if (!trimmedUrl) {
    setError("URL cannot be empty")
    return
  }

  setLoading(true)
  setError(null)

  try {
    await urlsApi.create({
      original_url: trimmedUrl
    })

    setOriginalUrl('')
    onCreated?.()
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 500 }}>Shorten a URL</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Paste a URL and generate a short link
          </p>
        </div>

        {onCancel && (
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>
            ✕
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Destination URL</label>
          <input
            className="input"
            type="url"
            placeholder="https://example.com"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create short link'}
        </button>
      </form>
    </div>
  )
}