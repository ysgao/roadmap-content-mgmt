export function login(): void {}
export async function logout(): Promise<void> {}

export function useAuth() {
  return { user: null, isAdmin: false, loading: false, login, logout }
}
