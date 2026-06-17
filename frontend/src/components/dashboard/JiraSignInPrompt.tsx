import { login } from '../../services/auth'

export default function JiraSignInPrompt() {
  return (
    <div style={{
      padding: '12px 16px',
      background: '#f7fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginTop: '8px',
    }}>
      <span style={{ fontSize: '1rem' }}>🔒</span>
      <span style={{ fontSize: '0.85rem', color: '#4a5568', flex: 1 }}>
        Sign in with your SNOMED account to view linked Jira tickets
      </span>
      <button
        onClick={login}
        style={{
          padding: '5px 14px',
          background: '#4A90D9',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '0.82rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Sign in
      </button>
    </div>
  )
}
