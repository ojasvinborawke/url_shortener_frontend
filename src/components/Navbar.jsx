import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../App'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth() // FIX: use isAdmin from context
  const navigate = useNavigate()
  const location = useLocation()

  const isAuth = location.pathname === '/login' || location.pathname === '/signup'
  if (isAuth) return null

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 'var(--nav-h)',
      background: 'rgba(247,245,240,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)', zIndex: 100,
      display: 'flex', alignItems: 'center', padding: '0 1.5rem',
      justifyContent: 'space-between',
    }}>
      
      {/* Brand */}
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <div style={{
          width: 30, height: 30, background: 'var(--accent)', borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--text)' }}>
          Snip.link
        </span>
      </Link>

      {/* Right side */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          
          {/* FIX: use isAdmin instead of user.role */}
          {isAdmin && (
            <Link to="/admin">
              <button
                className={`btn btn-ghost btn-sm ${
                  location.pathname.startsWith('/admin') ? 'active' : ''
                }`}
                style={
                  location.pathname.startsWith('/admin')
                    ? { color: 'var(--accent)', background: 'var(--accent-bg)' }
                    : {}
                }
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Admin
              </button>
            </Link>
          )}

          <Link to="/dashboard">
            <button
              className={`btn btn-ghost btn-sm ${
                location.pathname === '/dashboard' ? 'active' : ''
              }`}
              style={
                location.pathname === '/dashboard'
                  ? { color: 'var(--accent)', background: 'var(--accent-bg)' }
                  : {}
              }
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              Dashboard
            </button>
          </Link>

          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

          <span style={{
            fontSize: 12,
            color: 'var(--text-3)',
            maxWidth: 160,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {user.email}
          </span>

          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}