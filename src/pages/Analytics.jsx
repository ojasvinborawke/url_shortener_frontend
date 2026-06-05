import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { adminApi, shortUrl } from '../api/client'

function BarChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No data available</p>
  }
  const entries = Object.entries(data).sort(([, a], [, b]) => Number(b) - Number(a)).slice(0, 10)
  const maxVal = Math.max(...entries.map(([, v]) => Number(v)), 1)
  return (
    <div>
      {entries.map(([k, v]) => (
        <div key={k} className="bar-row">
          <div className="bar-key" title={k}>{k}</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${Math.round((Number(v) / maxVal) * 100)}%` }}>
              {v}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { urlId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const url = location.state?.url

  useEffect(() => {
    async function load() {
      try {
        const result = await adminApi.analytics(urlId)
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [urlId])

const code = url?.shortened_url || ''

const totalClicks = data?.total_clicks ??  0
  const uniqueClicks = data?.unique_clicks ?? data?.unique ?? data?.unique_visitors ?? null

  const numericFields = data
    ? Object.entries(data).filter(([, v]) => typeof v === 'number').filter(([k]) => !['id'].includes(k))
    : []

  const objectFields = data
    ? Object.entries(data).filter(([, v]) => typeof v === 'object' && v !== null && !Array.isArray(v))
    : []

  return (
    <div className="page">
      <div className="container">

        {/* Back */}
        <div className="analytics-back" onClick={() => navigate('/admin')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to admin
        </div>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="page-title">Link analytics</h1>
          {code && <p className="page-sub" style={{ marginTop: 6 }}>Tracking data for <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{code}</span></p>}
        </div>

        {/* URL info card */}
        {url && (
          <div className="analytics-url-info">
            <div style={{
              width: 32, height: 32, background: 'var(--accent-bg)', borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              border: '1px solid var(--accent-border)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <a href={shortUrl(code)} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>
                {shortUrl(code)}
              </a>
              <div className="mono-sm" style={{ marginTop: 2 }}>{url.original_url}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)' }}>
            <span className="spinner" style={{ width: 24, height: 24, display: 'inline-block' }} />
          </div>
        ) : data ? (
          <>
            {/* Metric cards */}
            <div className="metrics-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="metric-card">
                <div className="metric-label">Total clicks</div>
                <div className="metric-value">{Number(totalClicks).toLocaleString()}</div>
              </div>
              {uniqueClicks !== null && (
                <div className="metric-card">
                  <div className="metric-label">Unique visitors</div>
                  <div className="metric-value">{Number(uniqueClicks).toLocaleString()}</div>
                </div>
              )}
              {numericFields.filter(([k]) => !['total_clicks','clicks','total','unique_clicks','unique','unique_visitors'].includes(k)).map(([key, val]) => (
                <div className="metric-card" key={key}>
                  <div className="metric-label">{key.replace(/_/g, ' ')}</div>
                  <div className="metric-value" style={{ fontSize: 28 }}>{Number(val).toLocaleString()}</div>
                </div>
              ))}
              {data.last_clicked && (
                <div className="metric-card">
                  <div className="metric-label">Last click</div>
                  <div className="metric-value" style={{ fontSize: 18 }}>
                    {new Date(data.last_clicked).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              )}
            </div>

            {/* Charts */}
            {objectFields.length > 0 ? (
              <div className="charts-grid">
                {objectFields.map(([key, obj]) => (
                  <div className="chart-section" key={key}>
                    <h3>{key.replace(/_/g, ' ')}</h3>
                    <BarChart data={obj} />
                  </div>
                ))}
              </div>
            ) : totalClicks === 0 ? (
              <div className="card">
                <div className="empty">
                  <div className="empty-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  </div>
                  <p>No click data yet for this link</p>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="empty"><p>No analytics data available.</p></div>
        )}

      </div>
    </div>
  )
}
