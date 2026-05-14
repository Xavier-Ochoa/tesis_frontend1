export default function Spinner({ size = 'md', text = '' }) {
  const sizes = { sm: 20, md: 36, lg: 52 }
  const s = sizes[size]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: 12 }}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>
        <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
        <circle cx="12" cy="12" r="10" stroke="var(--border2)" strokeWidth="3"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      {text && <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>{text}</p>}
    </div>
  )
}
