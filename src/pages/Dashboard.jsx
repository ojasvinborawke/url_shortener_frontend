import { useState, useEffect, useRef } from 'react'
import { urlsApi, authApi } from '../api/client'
import { useAuth } from '../App'
import CreateLinkForm from '../components/CreateLinkForm'
import LinkCard from '../components/LinkCard'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const hasLoaded = useRef(false)

  async function loadUrls() {
    if (hasLoaded.current) return
    hasLoaded.current = true

    try {
      setLoading(true)
      const data = await urlsApi.list()
      setUrls(Array.isArray(data) ? data : (data.urls || data.items || []))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUrls()
  }, [])

  async function handleDelete(id) {
    try {
      await urlsApi.delete(id)
      setUrls(prev => prev.filter(u => u.id !== id))

      setSuccess('Link deleted.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteAccount() {
    const confirmDelete = window.confirm(
      'This will permanently delete your account and all links. Continue?'
    )

    if (!confirmDelete) return

    try {
      await authApi.deleteMe()

      localStorage.removeItem('token')
      navigate('/signup')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCreated() {
    setShowForm(false)

    setSuccess('Short link created!')
    setTimeout(() => setSuccess(null), 3000)

    hasLoaded.current = false
    await loadUrls()
  }

  const totalClicks = urls.reduce(
    (s, u) => s + (u.clicks ?? u.click_count ?? 0),
    0
  )

  return (
    <div className="page">
      <div className="container">

        <div className="dashboard-header">
          <div>
            <h1 className="page-title">My links</h1>
            <p className="page-sub">
              Hello, {user?.email?.split('@')[0]} — here are all your short links
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {!showForm && (
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Shorten a URL
              </button>
            )}

            <button
              className="btn btn-danger"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </div>

        {showForm && (
          <CreateLinkForm
            onCreated={handleCreated}
            onCancel={() => setShowForm(false)}
          />
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            Loading...
          </div>
        ) : (
          <div>
            {urls.map(url => (
              <LinkCard
                key={url.id}
                url={url}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}