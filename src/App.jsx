import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { authApi, adminApi } from './api/client'

import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Analytics from './pages/Analytics'
import './App.css'


const AuthContext = createContext(null)
export function useAuth() {
  return useContext(AuthContext)
}

/*
  ProtectedRoute:
  - blocks access if user not logged in
  - shows loading state while auth is resolving
*/
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: '4rem', textAlign: 'center', color: 'var(--text-3)' }}>
          Loading...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

/*
  AdminRoute:
  - ensures user exists
  - ensures role is admin safely (no crash if role missing)
*/

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  // CHECK ADMIN FROM CONTEXT (not inside hook again)
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  async function loadUser() {
    const token = localStorage.getItem('token')

    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const me = await authApi.me()
      setUser(me)
      try {
        await adminApi.links()
        setIsAdmin(true)
      } catch {
        setIsAdmin(false)
      }
    } catch (err) {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  async function login(token, userData) {
    localStorage.setItem('token', token)
    setUser(userData)

    try {
      await adminApi.links()
      setIsAdmin(true)
    } catch {
      setIsAdmin(false)
    }
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
    setIsAdmin(false)
  }

  const contextValue = {
    user,
    loading,
    login,
    logout,
    reload: loadUser,
    isAdmin,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route
            path="/"
            element={
              loading ? (
                <div>Loading...</div>
              ) : user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/analytics/:urlId"
            element={
              <AdminRoute>
                <Analytics />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}