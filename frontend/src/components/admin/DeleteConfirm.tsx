interface Props {
  itemTitle: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirm({ itemTitle, onConfirm, onCancel }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '10px',
          padding: '28px 32px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#fff5f5',
            border: '2px solid #fed7d7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            fontSize: '1.4rem',
          }}
        >
          ⚠
        </div>
        <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: '#1a202c', fontWeight: 700 }}>
          Delete item?
        </h3>
        <p style={{ margin: '0 0 24px', fontSize: '0.9rem', color: '#4a5568', lineHeight: 1.6 }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: '#1a202c' }}>&ldquo;{itemTitle}&rdquo;</strong>?{' '}
          This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: '1px solid #cbd5e0',
              background: '#fff',
              color: '#4a5568',
              fontSize: '0.87rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: 'none',
              background: '#e53e3e',
              color: '#fff',
              fontSize: '0.87rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
