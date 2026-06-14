import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import FieldHint from '../../components/FieldHint'
import Spinner from '../../components/Spinner'

const MAX_IMAGENES = 5
const CARRERAS = [
  'Agua y Saneamiento Ambiental','Desarrollo de Software','Electromecánica',
  'Redes y Telecomunicaciones','Procesamiento de Alimentos','Procesamiento Industrial de la Madera',
]

export default function CreateVersion() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [proyectoBase, setProyectoBase] = useState(null)
  const [form, setForm]                 = useState(null)
  const [keepImages, setKeepImages]     = useState([])
  const [newImages, setNewImages]       = useState([])
  const [newPreviews, setNewPreviews]   = useState([])
  const [documento, setDocumento]       = useState(null)
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [enviarAlAdmin, setEnviarAlAdmin] = useState(true)

  useEffect(() => {
    api.get(`/proyectos/${id}`)
      .then(r => {
        const p = r.data?.data || r.data
        setProyectoBase(p)
        setKeepImages(p.imagenes || [])
        setForm({
          titulo:             p.titulo             || '',
          descripcion:        p.descripcion        || '',
          categoria:          p.categoria          || 'academico',
          carrera:            p.carrera            || '',
          lineaInvestigacion: p.lineaInvestigacion || '',
          tecnologias:        Array.isArray(p.tecnologias) ? p.tecnologias.join(', ') : '',
          repositorio:        p.repositorio        || '',
          enlaceDemo:         p.enlaceDemo         || '',
          palabrasClave:      Array.isArray(p.palabrasClave) ? p.palabrasClave.join(', ') : '',
          fechaInicio:        p.fechaInicio ? p.fechaInicio.slice(0, 10) : '',
          fechaFin:           p.fechaFin    ? p.fechaFin.slice(0, 10)    : '',
        })
      })
      .catch(() => { toast.error('No se pudo cargar el proyecto'); navigate('/mis-proyectos') })
      .finally(() => setLoading(false))
  }, [id])

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleNewImages = e => {
    const files = Array.from(e.target.files || [])
    const total = newImages.length + files.length
    if (total > MAX_IMAGENES) { toast.error(`Máximo ${MAX_IMAGENES} imágenes nuevas.`); return }
    const nuevas = files.slice(0, MAX_IMAGENES - newImages.length)
    setNewImages(prev => [...prev, ...nuevas])
    setNewPreviews(prev => [...prev, ...nuevas.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }

  const removeNewImage = idx => {
    setNewImages(prev => prev.filter((_, i) => i !== idx))
    setNewPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const submit = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
      newImages.forEach(img => fd.append('imagenes', img))
      if (documento) fd.append('documento', documento)
      fd.append('enviarAlAdmin', enviarAlAdmin)
      const { data } = await api.post(`/proyectos/${id}/versiones`, fd)
      const newId = data.data?._id || data._id
      const ver   = data.version || data.data?.version || ''
      const msg = enviarAlAdmin
        ? `Versión ${ver} creada y enviada al administrador para revisión.`
        : `Versión ${ver} creada como borrador privado.`
      toast.success(msg)
      navigate(`/proyectos/${newId}`)
    } catch (err) {
      const errores = err.response?.data?.errors || err.response?.data?.errores
      if (errores) errores.forEach(e => toast.error(e.mensaje || e.message || e))
      else toast.error(err.response?.data?.message || 'Error al crear la versión')
    } finally { setSaving(false) }
  }

  if (loading || !form) return <Spinner />

  const totalNewImages = newImages.length
  const verActual = proyectoBase?.version ? `v${String(proyectoBase.version).padStart(3, '0')}` : ''

  return (
    <div className="page" style={{ maxWidth:680, animation:'slideUp 0.4s ease-out' }}>

      <div style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'var(--text-1)', margin:'0 0 6px', letterSpacing:'-0.03em' }}>
          🔖 Nueva versión
        </h1>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:10 }}>
          {proyectoBase?.proyecto_id && (
            <span style={{ fontSize:12, color:'var(--text-3)', fontWeight:600, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, padding:'3px 8px' }}>
              #{proyectoBase.proyecto_id}
            </span>
          )}
          {verActual && <span className="badge badge-blue" style={{ fontSize:11 }}>Basado en {verActual}</span>}
          {enviarAlAdmin
            ? <span className="badge badge-blue" style={{ fontSize:11 }}>📤 Se enviará al admin</span>
            : <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:600, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, padding:'3px 8px' }}>🔒 Borrador privado</span>
          }
        </div>
        <div style={{ background:'var(--primary-l)', border:'1px solid var(--primary)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'var(--primary)', lineHeight:1.6 }}>
          ℹ️ Los campos están pre-cargados con la versión actual. Modifica lo que necesites. La versión anterior quedará bloqueada.
        </div>
      </div>

      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

        {/* Imágenes */}
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>
            Imágenes de la nueva versión
            <FieldHint text="Si no subes imágenes, se copian las de la versión anterior." />
            <span style={{ marginLeft:'auto', fontSize:11, color:'var(--text-3)', fontWeight:400 }}>{totalNewImages}/{MAX_IMAGENES} nuevas</span>
          </label>
          {keepImages.length > 0 && (
            <div style={{ marginBottom:10 }}>
              <p style={{ fontSize:11, color:'var(--text-3)', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>Imágenes actuales (se copian si no subes nuevas)</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(90px, 1fr))', gap:8 }}>
                {keepImages.map((src, i) => (
                  <div key={i} style={{ position:'relative', borderRadius:10, overflow:'hidden', aspectRatio:'1', border:'1px solid var(--border)', opacity:0.6 }}>
                    <img src={src} alt={`actual-${i}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    {i === 0 && <span style={{ position:'absolute', bottom:4, left:4, fontSize:9, fontWeight:700, background:'var(--primary)', color:'white', padding:'2px 5px', borderRadius:4 }}>PORTADA</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {newPreviews.length > 0 && (
            <div style={{ marginBottom:8 }}>
              <p style={{ fontSize:11, color:'var(--primary)', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>Nuevas imágenes (reemplazarán las actuales)</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(90px, 1fr))', gap:8 }}>
                {newPreviews.map((src, i) => (
                  <div key={i} style={{ position:'relative', borderRadius:10, overflow:'hidden', aspectRatio:'1', border:'2px dashed var(--primary)' }}>
                    <img src={src} alt={`new-${i}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    <button type="button" onClick={() => removeNewImage(i)}
                      style={{ position:'absolute', top:4, right:4, width:20, height:20, borderRadius:'50%', background:'rgba(0,0,0,0.7)', color:'white', border:'none', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {totalNewImages < MAX_IMAGENES && (
            <div onClick={() => document.getElementById('imgs-version').click()}
              style={{ border:'2px dashed var(--border2)', borderRadius:12, padding:'1rem', textAlign:'center', cursor:'pointer', background:'var(--surface2)', transition:'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}>
              <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>
                {totalNewImages === 0 ? '🖼️ Haz clic para subir imágenes nuevas (opcional)' : `Agregar más (${MAX_IMAGENES - totalNewImages} restantes)`}
              </p>
            </div>
          )}
          <input id="imgs-version" type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleNewImages} />
        </div>

        {/* ── Documento PDF ── */}
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>
            Documento PDF
            <FieldHint text="Opcional. Adjunta el documento principal de esta nueva versión (máx. 10MB)." />
          </label>
          {documento ? (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, background:'var(--surface2)', border:'1px solid var(--primary)' }}>
              <span style={{ fontSize:20 }}>📄</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--text-1)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{documento.name}</p>
                <p style={{ fontSize:11, color:'var(--text-3)', margin:0 }}>{(documento.size / 1024).toFixed(1)} KB</p>
              </div>
              <button type="button" onClick={() => setDocumento(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--danger)', fontSize:18, padding:'0 4px', flexShrink:0 }}>×</button>
            </div>
          ) : (
            <div onClick={() => document.getElementById('pdf-version').click()}
              style={{ border:'2px dashed var(--border2)', borderRadius:12, padding:'1rem', textAlign:'center', cursor:'pointer', background:'var(--surface2)', transition:'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}>
              <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>+ Adjuntar PDF a esta versión</p>
            </div>
          )}
          <input id="pdf-version" type="file" accept="application/pdf" style={{ display:'none' }} onChange={e => {
            const f = e.target.files?.[0]
            if (f) { if (f.size > 10 * 1024 * 1024) { toast.error('El PDF no debe superar los 10MB.'); return } setDocumento(f) }
            e.target.value = ''
          }} />
        </div>

        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Título <FieldHint required text="Entre 5 y 200 caracteres." /></label>
          <input name="titulo" required value={form.titulo} onChange={handle} className="input" />
        </div>
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Descripción <FieldHint required text="Entre 20 y 2000 caracteres." /></label>
          <textarea name="descripcion" required value={form.descripcion} onChange={handle} rows={4} className="input" style={{ resize:'none' }} />
          <p style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>{form.descripcion.length}/2000</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="label">Categoría</label>
            <select name="categoria" value={form.categoria} onChange={handle} className="input">
              <option value="academico">Académico</option>
              <option value="extracurricular">Extracurricular</option>
            </select>
          </div>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Carrera <FieldHint required /></label>
            <select name="carrera" required value={form.carrera} onChange={handle} className="input">
              <option value="">Selecciona una carrera</option>
              {CARRERAS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="label">Fecha inicio</label>
            <input name="fechaInicio" type="date" value={form.fechaInicio} onChange={handle} className="input" />
          </div>
          <div>
            <label className="label">Fecha fin</label>
            <input name="fechaFin" type="date" value={form.fechaFin} onChange={handle} className="input" />
          </div>
        </div>
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Tecnologías <FieldHint text="Separadas por coma." /></label>
          <input name="tecnologias" value={form.tecnologias} onChange={handle} className="input" placeholder="React, Node.js, MongoDB" />
        </div>
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Línea de Investigación <FieldHint text="Opcional." /></label>
          <input name="lineaInvestigacion" value={form.lineaInvestigacion} onChange={handle} className="input" placeholder="Ej: Redes de Computadoras, Inteligencia Artificial..." />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="label">Repositorio</label>
            <input name="repositorio" type="url" value={form.repositorio} onChange={handle} className="input" placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="label">Demo</label>
            <input name="enlaceDemo" type="url" value={form.enlaceDemo} onChange={handle} className="input" placeholder="https://demo.vercel.app" />
          </div>
        </div>
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Palabras Clave <FieldHint text="Palabras clave separadas por coma." /></label>
          <input name="palabrasClave" value={form.palabrasClave} onChange={handle} className="input" placeholder="iot, python, redes" />
        </div>

        {/* Toggle: enviar o no al admin */}
        <div
          onClick={() => setEnviarAlAdmin(v => !v)}
          style={{ background: enviarAlAdmin ? 'var(--primary-l)' : 'var(--surface2)', border: `1px solid ${enviarAlAdmin ? 'var(--primary)' : 'var(--border)'}`, borderRadius:12, padding:'12px 16px', cursor:'pointer', userSelect:'none', transition:'all 0.2s' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* switch visual */}
            <div style={{ width:40, height:22, borderRadius:11, background: enviarAlAdmin ? 'var(--primary)' : 'var(--border2)', position:'relative', flexShrink:0, transition:'background 0.2s' }}>
              <div style={{ position:'absolute', top:3, left: enviarAlAdmin ? 21 : 3, width:16, height:16, borderRadius:'50%', background:'white', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color: enviarAlAdmin ? 'var(--primary)' : 'var(--text-2)' }}>
                {enviarAlAdmin ? '📤 Enviar al administrador para revisión' : '🔒 Guardar como borrador privado'}
              </p>
              <p style={{ margin:'2px 0 0', fontSize:11, color:'var(--text-3)' }}>
                {enviarAlAdmin
                  ? 'El admin revisará esta versión antes de que puedas publicarla.'
                  : 'Solo tú y tus colaboradores podrán verla. Podrás enviarla al admin más adelante.'}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, paddingTop:4 }}>
          <button type="submit" disabled={saving} className="btn-primary btn-lg" style={{ flex:1 }}>
            {saving ? 'Creando versión...' : '🔖 Crear nueva versión'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary btn-lg" style={{ flex:1 }}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}
