import { useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function AIGenerator() {
  const [descripcion, setDescripcion] = useState('')
  const [resultado, setResultado]     = useState('')
  const [loading, setLoading]         = useState(false)

  const submit = async e => {
    e.preventDefault()
    if (descripcion.length < 15) { toast.error('Escribe al menos 15 caracteres'); return }
    setLoading(true); setResultado('')
    try {
      const { data } = await api.post('/ia/generar-titulo', { descripcion })
      setResultado(data.titulo || data.data || JSON.stringify(data))
    } catch (err) {
      toast.error(err.response?.data?.msg || err.response?.data?.message || 'Error al generar. Verifica HF_API_KEY en el backend.')
    } finally { setLoading(false) }
  }

  const copy = () => { navigator.clipboard.writeText(resultado); toast.success('Copiado') }

  return (
    <div className="page" style={{ maxWidth: 640, animation: 'slideUp 0.4s ease-out' }}>
      <div style={{ textAlign:'center', marginBottom:'2rem' }}>
        <div style={{ fontSize:52, marginBottom:12 }}>🤖</div>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'var(--text-1)', margin:'0 0 6px', letterSpacing:'-0.03em' }}>Generador de títulos con IA</h1>
        <p style={{ fontSize:14, color:'var(--text-3)', margin:0 }}>Describe tu proyecto y la IA sugerirá un título adecuado.</p>
      </div>

      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'2rem', boxShadow:'var(--shadow)' }}>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div>
            <label className="label">Descripción del proyecto</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={6} className="input" style={{ resize:'none' }}
              placeholder="Ej: Sistema que monitorea la calidad del aire usando sensores IoT, almacena datos en MongoDB y visualiza estadísticas en tiempo real con gráficas interactivas..." />
            <p style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>{descripcion.length} caracteres (mín. 15)</p>
          </div>
          <button type="submit" disabled={loading || descripcion.length < 15} className="btn-primary btn-lg" style={{ width:'100%' }}>
            {loading ? '🤔 Generando...' : '✨ Generar título'}
          </button>
        </form>

        {resultado && (
          <div style={{ marginTop:'1.5rem', background:'var(--primary-l)', border:'1px solid var(--primary)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
              <div>
                <p style={{ fontSize:10, fontWeight:700, color:'var(--primary)', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 6px' }}>Título sugerido</p>
                <p style={{ fontFamily:'Syne,sans-serif', fontSize:17, fontWeight:700, color:'var(--text-1)', margin:0 }}>{resultado}</p>
              </div>
              <button onClick={copy} className="btn-secondary btn-sm" style={{ flexShrink:0 }}>Copiar</button>
            </div>
          </div>
        )}
      </div>

      <p style={{ fontSize:12, color:'var(--text-3)', textAlign:'center', marginTop:'1.25rem' }}>
        Powered by Hugging Face · Los resultados son sugerencias.
      </p>
    </div>
  )
}
