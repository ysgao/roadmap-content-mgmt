export interface AuthUser {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

export function login(): void {}
export async function logout(): Promise<void> {}

export function useAuth() {
  return { user: null as AuthUser | null, isAuthenticated: false, isAdmin: false, loading: false, login, logout }
}
