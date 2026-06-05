import { useState } from 'react'
import { shortUrl } from '../api/client'

export default function LinkCard({ url, onDelete, showDelete = true }) {
  const [copied, setCopied] = useState(false)

  const code =
  url.shortened_url ||
  url.short_code ||
  url.code ||
  url.short ||
  ''
  const short = shortUrl(code)
  const clicks = url.clicks ?? url.click_count ?? 0
  const created = url.created_at
    ? new Date(url.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  function handleCopy() {
    navigator.clipboard.writeText(short).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
      display: 'flex', alignItems: 'center', gap: '1rem',
      flexWrap: 'wrap', transition: 'box-shadow var(--transition)',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Icon */}
      <div style={{
        width: 36, height: 36, background: 'var(--accent-bg)', borderRadius: 'var(--radius-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        border: '1px solid var(--accent-border)',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </div>

      {/* URLs */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <a
            href={short}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--accent)', textDecoration: 'none' }}
          >
            {short.replace('http://', '')}
          </a>
          <button
            onClick={handleCopy}
            title="Copy short link"
            style={{
              background: copied ? 'var(--accent-bg)' : 'none',
              border: '1px solid ' + (copied ? 'var(--accent-border)' : 'transparent'),
              borderRadius: 'var(--radius-sm)', padding: '2px 6px', cursor: 'pointer',
              color: copied ? 'var(--accent)' : 'var(--text-3)',
              fontSize: 11, fontWeight: 500, transition: 'all var(--transition)',
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}
          >
            {copied ? (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Copied
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <div className="mono-sm" title={url.original_url}>{url.original_url}</div>
      </div>

      {/* Meta */}
      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {created && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{created}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
              created
            </div>
          </div>
        )}
        {showDelete && onDelete && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => { if (window.confirm('Delete this link?')) onDelete(url.id) }}
            title="Delete link"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
