import { useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const montos = [2, 5, 10, 20]

export default function Donations() {
  const [form, setForm] = useState({ nombre: '', mensaje: '', monto: 5, paymentMethodId: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    if (!form.paymentMethodId.trim()) { toast.error('Ingresa el ID del método de pago'); return }
    setLoading(true)
    try {
      await api.post('/donaciones', {
        paymentMethodId: form.paymentMethodId,
        monto: Number(form.monto),
        nombre: form.nombre,
        mensaje: form.mensaje,
      })
      setDone(true)
      toast.success('¡Gracias por tu donación!')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error al procesar el pago. Verifica el método de pago.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">💙</div>
        <h1 className="text-2xl font-bold text-gray-900">Apoya la plataforma</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
          Tu donación ayuda a mantener y mejorar el sistema de proyectos académicos de la ESFOT.
        </p>
      </div>

      {done ? (
        <div className="card p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">¡Muchas gracias!</h2>
          <p className="text-gray-500 text-sm mb-6">Tu donación de <strong>${form.monto}</strong> fue procesada exitosamente.</p>
          <button onClick={() => setDone(false)} className="btn-secondary">Donar de nuevo</button>
        </div>
      ) : (
        <div className="card p-6">
          <form onSubmit={submit} className="space-y-5">

            {/* Monto rápido */}
            <div>
              <label className="label">Monto (USD)</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {montos.map(m => (
                  <button key={m} type="button"
                    onClick={() => setForm({ ...form, monto: m })}
                    className={`py-2 rounded-lg border text-sm font-medium transition-colors ${form.monto === m ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-gray-600 border-gray-300 hover:border-primary-500'}`}>
                    ${m}
                  </button>
                ))}
              </div>
              <input name="monto" type="number" min={1} value={form.monto}
                onChange={e => setForm({ ...form, monto: e.target.value })}
                className="input" placeholder="Otro monto" />
            </div>

            <div>
              <label className="label">Tu nombre</label>
              <input name="nombre" required value={form.nombre} onChange={handle} className="input" placeholder="Juan Pérez" />
            </div>

            <div>
              <label className="label">Mensaje (opcional)</label>
              <textarea name="mensaje" value={form.mensaje} onChange={handle} rows={2}
                className="input resize-none" placeholder="¡Sigan adelante con este gran proyecto!" />
            </div>

            <div>
              <label className="label">ID del método de pago (Stripe)</label>
              <input name="paymentMethodId" value={form.paymentMethodId} onChange={handle}
                className="input font-mono text-sm" placeholder="pm_card_visa  (modo test)" />
              <p className="text-xs text-gray-400 mt-1">
                En modo test usa <code className="bg-gray-100 px-1 rounded">pm_card_visa</code>.
                En producción integra Stripe.js en el frontend para generar el PaymentMethod.
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
              {loading ? 'Procesando...' : `Donar $${form.monto}`}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
