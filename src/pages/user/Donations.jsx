import { useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const montos = [2, 5, 10, 20]

export default function Donations() {
  const [form, setForm] = useState({ nombre:'', mensaje:'', monto:5, paymentMethodId:'' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    if (!form.paymentMethodId.trim()) { toast.error('Ingresa el ID del método de pago'); return }
    setLoading(true)
    try {
      await api.post('/donaciones', { paymentMethodId: form.paymentMethodId, monto: Number(form.monto), nombre: form.nombre, mensaje: form.mensaje })
      setDone(true); toast.success('¡Gracias por tu donación!')
    } catch (err) {
      const data = err.response?.data
      if (data?.errores?.length) data.errores.forEach(e => toast.error(e.mensaje))
      else toast.error(data?.msg || 'Error al procesar el pago')
    }
    finally { setLoading(false) }
  }

  return (
    <div className="page" style={{ maxWidth: 500, animation: 'slideUp 0.4s ease-out' }}>
      <div style={{ textAlign:'center', marginBottom:'2rem' }}>
        <div style={{ fontSize:52, marginBottom:12 }}>💙</div>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'var(--text-1)', margin:'0 0 6px', letterSpacing:'-0.03em' }}>Apoya la plataforma</h1>
        <p style={{ fontSize:14, color:'var(--text-3)', margin:0 }}>Tu donación ayuda a mantener y mejorar el sistema académico.</p>
      </div>

      {done ? (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'3rem 2rem', textAlign:'center', boxShadow:'var(--shadow-lg)' }}>
          <p style={{ fontSize:52, marginBottom:12 }}>🎉</p>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'var(--text-1)', margin:'0 0 6px' }}>¡Muchas gracias!</h2>
          <p style={{ fontSize:14, color:'var(--text-3)', margin:'0 0 1.5rem' }}>Tu donación de <strong style={{ color:'var(--primary)' }}>${form.monto}</strong> fue procesada.</p>
          <button onClick={() => setDone(false)} className="btn-secondary">Donar de nuevo</button>
        </div>
      ) : (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'2rem', boxShadow:'var(--shadow-lg)' }}>
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div>
              <label className="label">Monto (USD)</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:8 }}>
                {montos.map(m => (
                  <button key={m} type="button" onClick={() => setForm({...form,monto:m})} style={{
                    padding:'10px', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                    background: form.monto===m ? 'var(--primary)' : 'var(--surface3)',
                    color: form.monto===m ? 'white' : 'var(--text-2)',
                    border: `1px solid ${form.monto===m ? 'var(--primary)' : 'var(--border2)'}`,
                  }}>${m}</button>
                ))}
              </div>
              <input name="monto" type="number" min={1} value={form.monto} onChange={e => setForm({...form,monto:e.target.value})} className="input" placeholder="Otro monto" />
            </div>
            <div>
              <label className="label">Tu nombre</label>
              <input name="nombre" required value={form.nombre} onChange={handle} className="input" placeholder="Juan Pérez" />
            </div>
            <div>
              <label className="label">Mensaje (opcional)</label>
              <textarea name="mensaje" value={form.mensaje} onChange={handle} rows={2} className="input" style={{ resize:'none' }} placeholder="¡Sigan adelante!" />
            </div>
            <div>
              <label className="label">ID del método de pago (Stripe)</label>
              <input name="paymentMethodId" value={form.paymentMethodId} onChange={handle} className="input" style={{ fontFamily:'JetBrains Mono,monospace', fontSize:13 }} placeholder="pm_card_visa  (modo test)" />
              <p style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>En modo test usa <code style={{ background:'var(--surface3)', padding:'1px 5px', borderRadius:4 }}>pm_card_visa</code></p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary btn-lg" style={{ width:'100%' }}>
              {loading ? 'Procesando...' : `Donar $${form.monto}`}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
