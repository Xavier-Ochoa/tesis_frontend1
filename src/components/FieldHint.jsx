import { useState, useEffect, useRef } from 'react'

export default function FieldHint({ text, required = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 6 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: 16, height: 16, borderRadius: '50%',
          background: open ? 'var(--primary)' : 'var(--surface3)',
          color: open ? 'white' : 'var(--text-3)',
          border: `1px solid ${open ? 'var(--primary)' : 'var(--border2)'}`,
          fontSize: 9, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.15s',
          fontFamily: 'monospace',
        }}
        aria-label="Ver reglas del campo"
      >i</button>

      {open && (
        <div style={{
          position: 'absolute', left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)',
          zIndex: 100, width: 220,
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          borderRadius: 10, padding: '10px 12px',
          boxShadow: 'var(--shadow-lg)',
          fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6,
          animation: 'fadeIn 0.15s ease-out',
        }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            {required
              ? <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--danger-l)', color: 'var(--danger)', padding: '2px 7px', borderRadius: 100 }}>Obligatorio</span>
              : <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--surface3)', color: 'var(--text-3)', padding: '2px 7px', borderRadius: 100 }}>Opcional</span>
            }
          </div>
          {text}
          <span style={{ position: 'absolute', left: -5, top: '50%', transform: 'translateY(-50%)', borderWidth: 5, borderStyle: 'solid', borderColor: 'transparent var(--border2) transparent transparent' }} />
        </div>
      )}
    </span>
  )
}
