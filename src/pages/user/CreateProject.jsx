import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import FieldHint from '../../components/FieldHint'

const MAX_IMAGENES = 5
const defaultForm = {
  titulo:'', descripcion:'', categoria:'academico', fechaInicio:'',
  fechaFin:'', carrera:'', tecnologias:'', repositorio:'', enlaceDemo:'',
  asignatura:'', tags:'', nivel:'', publico:'false',
}

// ── Modal IA ──────────────────────────────────────────────────────────────────
function AIModal({ descripcion, onSelect, onClose }) {
  const [titulos, setTitulos]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [selected, setSelected] = useState(null)
  const [error, setError]       = useState('')

  const generar = async () => {
    if (!descripcion || descripcion.trim().length < 15) {
      setError('Escribe al menos 15 caracteres en la descripción antes de generar.')
      return
    }
    setError(''); setLoading(true); setTitulos([]); setSelected(null)
    try {
      const { data } = await api.post('/ia/generar-titulo', { descripcion })
      const lista = data.data?.titulos || data.titulos || []
      if (lista.length === 0) { setError('La IA no devolvió sugerencias. Intenta de nuevo.'); return }
      setTitulos(lista)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al conectar con la IA.')
    } finally { setLoading(false) }
  }

  useEffect(() => { generar() }, [])

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, width:'100%', maxWidth:480, padding:'1.75rem', boxShadow:'var(--shadow-lg)', animation:'slideUp 0.2s ease-out' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:22 }}>🤖</span>
            <div>
              <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:17, fontWeight:800, color:'var(--text-1)', margin:0 }}>Sugerencias de título</h2>
              <p style={{ fontSize:12, color:'var(--text-3)', margin:0 }}>Generado con IA · Elige una opción</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text-3)', lineHeight:1, padding:'4px' }}>×</button>
        </div>

        {loading && (
          <div style={{ textAlign:'center', padding:'2rem 0' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ animation:'spin 0.75s linear infinite', margin:'0 auto 10px', display:'block' }}>
              <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
              <circle cx="12" cy="12" r="10" stroke="var(--border2)" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize:13, color:'var(--text-3)' }}>Generando sugerencias...</p>
          </div>
        )}

        {error && !loading && (
          <div style={{ background:'var(--danger-l)', border:'1px solid var(--danger)', borderRadius:10, padding:'12px 14px', fontSize:13, color:'var(--danger)', marginBottom:14 }}>{error}</div>
        )}

        {titulos.length > 0 && !loading && (
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:'1.25rem' }}>
            {titulos.map((t, i) => (
              <button key={i} onClick={() => setSelected(t)} style={{
                width:'100%', textAlign:'left', padding:'12px 14px', borderRadius:12, cursor:'pointer',
                fontSize:14, fontWeight:500, fontFamily:'inherit', transition:'all 0.15s',
                background: selected===t ? 'var(--primary-l)' : 'var(--surface2)',
                color: selected===t ? 'var(--primary)' : 'var(--text-1)',
                border: `1.5px solid ${selected===t ? 'var(--primary)' : 'var(--border)'}`,
              }}>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', display:'block', marginBottom:3 }}>Opción {i+1}</span>
                {t}
              </button>
            ))}
          </div>
        )}

        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button onClick={() => { if (selected) { onSelect(selected); onClose() } else toast.error('Selecciona una opción') }} disabled={!selected || loading} className="btn-primary" style={{ flex:1 }}>Usar este título</button>
          <button onClick={generar} disabled={loading} className="btn-secondary" style={{ flex:1 }}>{loading ? 'Generando...' : '🔄 Regenerar'}</button>
          <button onClick={onClose} className="btn-ghost" style={{ width:'100%', marginTop:2 }}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

// ── Formulario ────────────────────────────────────────────────────────────────
export default function CreateProject() {
  const navigate = useNavigate()
  const [form, setForm]         = useState(defaultForm)
  const [images, setImages]     = useState([])       // File[]
  const [previews, setPreviews] = useState([])       // string[] (object URLs)
  const [loading, setLoading]   = useState(false)
  const [showAI, setShowAI]     = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleImages = e => {
    const files = Array.from(e.target.files || [])
    const total = images.length + files.length
    if (total > MAX_IMAGENES) {
      toast.error(`Máximo ${MAX_IMAGENES} imágenes. Ya tienes ${images.length}.`)
      return
    }
    const nuevas = files.slice(0, MAX_IMAGENES - images.length)
    setImages(prev => [...prev, ...nuevas])
    setPreviews(prev => [...prev, ...nuevas.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
      images.forEach(img => fd.append('imagenes', img))
      const { data } = await api.post('/proyectos', fd)
      toast.success('Proyecto creado. Pendiente de revisión.')
      navigate(`/proyectos/${data.data?._id || data._id}`)
    } catch (err) {
      const errores = err.response?.data?.errores
      if (errores) errores.forEach(e => toast.error(e.mensaje))
      else toast.error(err.response?.data?.message || 'Error al crear')
    } finally { setLoading(false) }
  }

  return (
    <div className="page" style={{ maxWidth:680, animation:'slideUp 0.4s ease-out' }}>
      <div style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'var(--text-1)', margin:'0 0 4px', letterSpacing:'-0.03em' }}>Nuevo Proyecto</h1>
        <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>El proyecto quedará pendiente de aprobación por el administrador.</p>
      </div>

      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

        {/* ── Galería de imágenes ── */}
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>
            Imágenes del proyecto
            <FieldHint text={`Hasta ${MAX_IMAGENES} imágenes. JPG, PNG o WEBP, máx 5MB cada una.`} />
            <span style={{ marginLeft:'auto', fontSize:11, color:'var(--text-3)', fontWeight:400 }}>
              {images.length}/{MAX_IMAGENES}
            </span>
          </label>

          {/* Miniaturas */}
          {previews.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))', gap:8, marginBottom:10 }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position:'relative', borderRadius:10, overflow:'hidden', aspectRatio:'1', border:'1px solid var(--border)' }}>
                  <img src={src} alt={`img-${i}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <button type="button" onClick={() => removeImage(i)}
                    style={{ position:'absolute', top:4, right:4, width:20, height:20, borderRadius:'50%', background:'rgba(0,0,0,0.7)', color:'white', border:'none', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>
                    ×
                  </button>
                  {i === 0 && (
                    <span style={{ position:'absolute', bottom:4, left:4, fontSize:9, fontWeight:700, background:'var(--primary)', color:'white', padding:'2px 5px', borderRadius:4 }}>PORTADA</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Botón agregar */}
          {images.length < MAX_IMAGENES && (
            <div onClick={() => document.getElementById('imgs-create').click()}
              style={{ border:`2px dashed var(--border2)`, borderRadius:12, padding:'1.25rem', textAlign:'center', cursor:'pointer', background:'var(--surface2)', transition:'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
            >
              <p style={{ fontSize:24, margin:'0 0 4px' }}>🖼️</p>
              <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>
                {images.length === 0 ? 'Haz clic para agregar imágenes' : `Agregar más (${MAX_IMAGENES - images.length} restantes)`}
              </p>
            </div>
          )}
          <input id="imgs-create" type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleImages} />
        </div>

        {/* Título + IA */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
            <label className="label" style={{ display:'flex', alignItems:'center', margin:0 }}>
              Título <FieldHint required text="Entre 5 y 200 caracteres." />
            </label>
            <button type="button" onClick={() => {
              if (!form.descripcion || form.descripcion.trim().length < 15) { toast.error('Escribe la descripción primero (mín. 15 caracteres).'); return }
              setShowAI(true)
            }} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, color:'var(--primary)', background:'var(--primary-l)', border:'1px solid var(--primary)', borderRadius:8, padding:'4px 10px', cursor:'pointer' }}>
              ✨ Sugerir con IA
            </button>
          </div>
          <input name="titulo" required value={form.titulo} onChange={handle} className="input" placeholder="Nombre del proyecto — o usa IA ↑" />
        </div>

        {/* Descripción */}
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Descripción <FieldHint required text="Entre 20 y 2000 caracteres. La IA usa este texto para sugerir títulos." /></label>
          <textarea name="descripcion" required value={form.descripcion} onChange={handle} rows={4} className="input" style={{ resize:'none' }} placeholder="Describe tu proyecto..." />
          <p style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>{form.descripcion.length}/2000</p>
        </div>

        {/* Categoría + Carrera */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Categoría <FieldHint required text="Académico: materia/tesis. Extracurricular: proyecto personal." /></label>
            <select name="categoria" value={form.categoria} onChange={handle} className="input">
              <option value="academico">Académico</option>
              <option value="extracurricular">Extracurricular</option>
            </select>
          </div>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Carrera <FieldHint required text="Selecciona la carrera a la que pertenece el proyecto." /></label>
            <select name="carrera" required value={form.carrera} onChange={handle} className="input">
              <option value="">Selecciona una carrera</option>
              <option>Agua y Saneamiento Ambiental</option>
              <option>Desarrollo de Software</option>
              <option>Electromecánica</option>
              <option>Redes y Telecomunicaciones</option>
              <option>Procesamiento de Alimentos</option>
              <option>Procesamiento Industrial de la Madera</option>
            </select>
          </div>
        </div>

        {/* Fechas */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Fecha inicio <FieldHint required text="Formato YYYY-MM-DD." /></label>
            <input name="fechaInicio" type="date" required value={form.fechaInicio} onChange={handle} className="input" />
          </div>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Fecha fin <FieldHint text="Opcional." /></label>
            <input name="fechaFin" type="date" value={form.fechaFin} onChange={handle} className="input" />
          </div>
        </div>

        {/* Tecnologías */}
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Tecnologías <FieldHint text="Separadas por coma. Ej: React, Node.js" /></label>
          <input name="tecnologias" value={form.tecnologias} onChange={handle} className="input" placeholder="React, Node.js, MongoDB" />
        </div>

        {/* Asignatura */}
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Asignatura <FieldHint text="Materia relacionada con el proyecto." /></label>
          <input name="asignatura" value={form.asignatura} onChange={handle} className="input" placeholder="Redes de Computadoras" />
        </div>

        {/* Repositorio + Demo */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Repositorio <FieldHint text="URL completa." /></label>
            <input name="repositorio" type="url" value={form.repositorio} onChange={handle} className="input" placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Demo <FieldHint text="URL del proyecto en producción." /></label>
            <input name="enlaceDemo" type="url" value={form.enlaceDemo} onChange={handle} className="input" placeholder="https://demo.vercel.app" />
          </div>
        </div>

        {/* Nivel + Público */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Semestre / Nivel <FieldHint text="Número del 1 al 6." /></label>
            <input name="nivel" type="number" min={1} max={6} value={form.nivel} onChange={handle} className="input" placeholder="1 - 6" />
          </div>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>¿Público? <FieldHint text="Público: visible si está aprobado. Privado: solo tú." /></label>
            <select name="publico" value={form.publico} onChange={handle} className="input">
              <option value="false">🔒 Privado</option>
              <option value="true">🌐 Público</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Tags <FieldHint text="Palabras clave separadas por coma." /></label>
          <input name="tags" value={form.tags} onChange={handle} className="input" placeholder="iot, python, redes" />
        </div>

        <div style={{ display:'flex', gap:10, paddingTop:4 }}>
          <button type="submit" disabled={loading} className="btn-primary btn-lg" style={{ flex:1 }}>{loading ? 'Creando...' : 'Crear Proyecto'}</button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary btn-lg" style={{ flex:1 }}>Cancelar</button>
        </div>
      </form>

      {showAI && (
        <AIModal
          descripcion={form.descripcion}
          onSelect={titulo => setForm(f => ({ ...f, titulo }))}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  )
}
