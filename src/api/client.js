const BASE = 'http://52.66.251.171:8000'

function getToken() {
  return localStorage.getItem('token')
}
async function request(method, path, body = null, auth = true, formEncoded = false) {
  const url = `${BASE}${path}`

  const headers = {}

  // attach JWT if present
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let bodyPayload = undefined

  if (formEncoded && body) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    bodyPayload = new URLSearchParams(body).toString()
  } else if (body !== null && body !== undefined) {
    headers['Content-Type'] = 'application/json'
    bodyPayload = JSON.stringify(body)
  }

  // ---- REQUEST LOG ----
  console.log('[API REQUEST]', {
    method,
    url,
    headers,
    body: bodyPayload
  })

  const res = await fetch(url, {
    method,
    headers,
    body: bodyPayload,
  })

  const data = await res.json().catch(() => ({}))

  // ---- RESPONSE LOG ----
  console.log('[API RESPONSE]', {
    url,
    status: res.status,
    ok: res.ok,
    data
  })

  if (!res.ok) {
    console.error('[API ERROR]', data)
    throw new Error(data.detail || data.message || 'Request failed')
  }

  return data
}

// ---------------- AUTH ----------------
export const authApi = {
  signup: (email, password) =>
    request('POST', '/auth/signup', { email, password }, false),

  login: (email, password) =>
    request(
      'POST',
      '/auth/login',
      { username: email, password },
      false,
      true
    ),

  me: () => request('GET', '/auth/me'),
  deleteMe: () => request('DELETE', '/auth/me'),
}

// ---------------- URLS ----------------
export const urlsApi = {
  list: () => request('GET', '/urls'),

  create: (payload) =>
    request('POST', '/urls', {
      original_url: payload.original_url, // ensure clean input
    }),

  delete: (url_id) => request('DELETE', `/urls/${url_id}`),
}

export function shortUrl(code) {
  return `${BASE}/r/${code}`
}

// ---------------- ADMIN ----------------
export const adminApi = {
  links: (orphaned = false) =>
    request('GET', `/admin/links${orphaned ? '?orphaned=true' : ''}`),

  analytics: (url_id) =>
    request('GET', `/admin/links/${url_id}/analytics`),

  stats: () => request('GET', '/admin/stats'),

  deleteUrl: (url_id) =>
    request('DELETE', `/admin/delete/${url_id}`),

  reportUrl: () =>
    request('GET', '/admin/reports/download'),

  // ADMIN CHECK (your workaround approach)
  isAdmin: async () => {
    try {
      const result = await request('GET', '/admin/links')
      console.log(result)
      return true
    } catch (err) {
      return false
    }
  },
}