import { useState, useEffect } from 'react'

export interface AuthUser {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

// Keycloak PKCE config — set via env vars (no client secret needed for public clients)
const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL ?? ''          // e.g. https://keycloak.snomed.org/realms/snomed
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? ''

function randomBase64(len: number): string {
  const bytes = new Uint8Array(len)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function sha256base64url(plain: string): Promise<string> {
  const encoded = new TextEncoder().encode(plain)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function login(): Promise<void> {
  if (!KEYCLOAK_URL || !KEYCLOAK_CLIENT_ID) {
    console.warn('Keycloak not configured — set VITE_KEYCLOAK_URL and VITE_KEYCLOAK_CLIENT_ID')
    return
  }

  const verifier = randomBase64(48)
  const challenge = await sha256base64url(verifier)
  const state = randomBase64(16)

  sessionStorage.setItem('pkce_verifier', verifier)
  sessionStorage.setItem('pkce_state', state)
  sessionStorage.setItem('returnTo', window.location.hash)

  const redirectUri = `${window.location.origin}${window.location.pathname}`
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: KEYCLOAK_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'openid profile email',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  window.location.href = `${KEYCLOAK_URL}/protocol/openid-connect/auth?${params}`
}

export async function logout(): Promise<void> {
  const token = sessionStorage.getItem('access_token')
  sessionStorage.removeItem('access_token')
  sessionStorage.removeItem('id_token')
  sessionStorage.removeItem('pkce_verifier')
  sessionStorage.removeItem('pkce_state')
  _cached = null
  _promise = null

  if (KEYCLOAK_URL && token) {
    const redirectUri = `${window.location.origin}${window.location.pathname}`
    window.location.href = `${KEYCLOAK_URL}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`
  } else {
    window.location.reload()
  }
}

async function handleCallback(): Promise<AuthUser | null> {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')

  if (!code) return null

  const storedState = sessionStorage.getItem('pkce_state')
  const verifier = sessionStorage.getItem('pkce_verifier')
  if (!verifier || (storedState && state !== storedState)) return null

  sessionStorage.removeItem('pkce_verifier')
  sessionStorage.removeItem('pkce_state')

  // Clean up URL without reloading
  window.history.replaceState({}, '', window.location.pathname + '#' + (sessionStorage.getItem('returnTo') ?? '/'))
  sessionStorage.removeItem('returnTo')

  const redirectUri = `${window.location.origin}${window.location.pathname}`
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: KEYCLOAK_CLIENT_ID,
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  })

  try {
    const res = await fetch(`${KEYCLOAK_URL}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (!res.ok) return null
    const data = await res.json() as { access_token: string; id_token?: string }
    sessionStorage.setItem('access_token', data.access_token)
    if (data.id_token) sessionStorage.setItem('id_token', data.id_token)
    return tokenToUser(data.access_token)
  } catch {
    return null
  }
}

function tokenToUser(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return {
      id: payload.sub ?? '',
      email: payload.email ?? '',
      name: payload.name ?? payload.preferred_username ?? payload.email ?? '',
      isAdmin: Boolean(payload.realm_access?.roles?.includes('admin') ?? false),
    }
  } catch {
    return null
  }
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem('access_token')
}

let _cached: AuthUser | null | undefined = undefined
let _promise: Promise<AuthUser | null> | null = null

async function resolveUser(): Promise<AuthUser | null> {
  // Check for PKCE callback
  if (new URLSearchParams(window.location.search).get('code')) {
    return handleCallback()
  }
  // Check stored token
  const token = sessionStorage.getItem('access_token')
  if (token) return tokenToUser(token)
  return null
}

function fetchUser(): Promise<AuthUser | null> {
  if (_promise) return _promise
  _promise = resolveUser().then(u => { _cached = u; return u })
  return _promise
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(_cached ?? null)
  const [loading, setLoading] = useState(_cached === undefined)

  useEffect(() => {
    if (_cached !== undefined) { setUser(_cached); setLoading(false); return }
    fetchUser().then(u => { setUser(u); setLoading(false) })
  }, [])

  return {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.isAdmin ?? false,
    loading,
    login,
    logout,
  }
}
