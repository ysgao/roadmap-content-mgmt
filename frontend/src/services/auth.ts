import { useState, useEffect } from 'react'

export interface AuthUser {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export function login(): void {
  sessionStorage.setItem('returnTo', window.location.hash)
  window.location.href = `${BACKEND_URL}/auth/login`
}

export async function logout(): Promise<void> {
  await fetch(`${BACKEND_URL}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {})
  window.location.reload()
}

export async function getMe(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, { credentials: 'include' })
    if (!res.ok) return null
    const data = await res.json() as { user: AuthUser | null }
    return data.user
  } catch {
    return null
  }
}

let _cached: AuthUser | null | undefined = undefined
let _promise: Promise<AuthUser | null> | null = null

function fetchUser(): Promise<AuthUser | null> {
  if (_promise) return _promise
  _promise = getMe().then(u => { _cached = u; return u })
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
