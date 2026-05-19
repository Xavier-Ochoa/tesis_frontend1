import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import FieldHint from '../../components/FieldHint'
import toast from 'react-hot-toast'

const MAX_IMAGENES = 5

export default function EditProject() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [form, setForm]             = useState(null)
  const [existingImages, setExisting] = useState([])   // URLs ya en Cloudinary
  const [newImages, setNewImages]   = useState([])     // File[] nuevas a subir
  const [newPreviews, setNewPreviews] = useState([])   // object URLs
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [deletingIdx, setDeletingIdx] = useState(null) // índice borrándose

  useEffect(() => {
    api.get(`/proyectos/${id}`)
      .then(r => {
        const p = r.data?.data || r.data
        setForm({
          titulo:      p.titulo || '',
          descripcion: p.descripcion || '',
          categoria:   p.categoria || 'academico',
          fechaInicio: p.fechaInicio ? p.fechaInicio.slice(0, 10) : '',
          fechaFin:    p.fechaFin    ? p.fechaFin.slice(0, 10)    : '',
          carrera:     p.carrera || '',
          tecnologias: Array.isArray(p.tecnologias) ? p.tecnologias.join(', ') : '',
          repositorio: p.repositorio || '',
          enlaceDemo:  p.enlaceDemo  || '',
          asignatura:  p.asignatura  || '',
          tags:        Array.isArray(p.tags) ? p.tags.join(', ') : '',
          nivel:       p.nivel || '',
          publico:     String(p.publico ?? 'false'),
        })
        setExisting(p.imagenes || [])
      })
      .catch(() => toast.error('No se pudo cargar el proyecto'))
      .finally(() => setLoading(false))
  }, [id])

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleNewImages = e => {
    const files = Array.from(e.target.files || [])
    const total = existingImages.length + newImages.length + files.length
    if (total > MAX_IMAGENES) {
      toast.error(`Máximo ${MAX_IMAGENES} imágenes. Actualmente tienes ${existingImages.length + newImages.length}.`)
      e.target.value = ''
      return
    }
    const permitidas = files.slice(0, MAX_IMAGENES - existingImages.length - newImages.length)
    setNewImages(prev => [...prev, ...permitidas])
    setNewPreviews(prev => [...prev, ...permitidas.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }

  const removeNewImage = (idx) => {
    setNewImages(prev => prev.filter((_, i) => i !== idx))
    setNewPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const deleteExistingImage = async (indice) => {
    if (!confirm('¿Eliminar esta imagen del proyecto?')) return
    setDeletingIdx(indice)
    try {
      await api.delete(`/proyectos/${id}/imagenes`, { data: { indice } })
      setExisting(prev => prev.filter((_, i) => i !== indice))
      toast.success('Imagen eliminada')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar la imagen')
    } finally {
      setDeletingIdx(null)
    }
  }

  const submit = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
      newImages.forEach(img => fd.append('imagenes', img))
      await api.put(`/proyectos/${id}`, fd)
      toast.success('Proyecto actualizado')
      navigate(`/proyectos/${id}`)
    } catch (err) {
      const errores = err.response?.data?.errores
      if (errores) errores.forEach(e => toast.error(e.mensaje))
      else toast.error(err.response?.data?.message || 'Error al actualizar')
    } finally { setSaving(false) }
  }

  if (loading || !form) return <Spinner />

  const totalImages = existingImages.length + newImages.length

  return (
    <div className="page" style={{ maxWidth:680, animation:'slideUp 0.4s ease-out' }}>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'var(--text-1)', margin:'0 0 1.75rem', letterSpacing:'-0.03em' }}>Editar Proyecto</h1>

      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

        {/* ── Galería de imágenes ── */}
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>
            Imágenes del proyecto
            <FieldHint text="Puedes tener hasta 5 imágenes. Elimina las existentes o agrega nuevas." />
            <span style={{ marginLeft:'auto', fontSize:11, color:'var(--text-3)', fontWeight:400 }}>
              {totalImages}/{MAX_IMAGENES}
            </span>
          </label>

          {/* Imágenes existentes en Cloudinary */}
          {existingImages.length > 0 && (
            <div style={{ marginBottom:8 }}>
              <p style={{ fontSize:11, color:'var(--text-3)', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>Imágenes actuales</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))', gap:8 }}>
                {existingImages.map((src, i) => (
                  <div key={i} style={{ position:'relative', borderRadius:10, overflow:'hidden', aspectRatio:'1', border:'1px solid var(--border)', opacity: deletingIdx === i ? 0.5 : 1 }}>
                    <img src={src} alt={`existing-${i}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    <button type="button" onClick={() => deleteExistingImage(i)} disabled={deletingIdx !== null}
                      style={{ position:'absolute', top:4, right:4, width:22, height:22, borderRadius:'50%', background:'rgba(239,68,68,0.9)', color:'white', border:'none', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {deletingIdx === i ? '…' : '×'}
                    </button>
                    {i === 0 && (
                      <span style={{ position:'absolute', bottom:4, left:4, fontSize:9, fontWeight:700, background:'var(--primary)', color:'white', padding:'2px 5px', borderRadius:4 }}>PORTADA</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nuevas imágenes a subir */}
          {newPreviews.length > 0 && (
            <div style={{ marginBottom:8 }}>
              <p style={{ fontSize:11, color:'var(--text-3)', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>Nuevas a subir</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))', gap:8 }}>
                {newPreviews.map((src, i) => (
                  <div key={i} style={{ position:'relative', borderRadius:10, overflow:'hidden', aspectRatio:'1', border:'2px dashed var(--primary)' }}>
                    <img src={src} alt={`new-${i}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    <button type="button" onClick={() => removeNewImage(i)}
                      style={{ position:'absolute', top:4, right:4, width:22, height:22, borderRadius:'50%', background:'rgba(0,0,0,0.7)', color:'white', border:'none', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón agregar */}
          {totalImages < MAX_IMAGENES && (
            <div onClick={() => document.getElementById('imgs-edit').click()}
              style={{ border:`2px dashed var(--border2)`, borderRadius:12, padding:'1rem', textAlign:'center', cursor:'pointer', background:'var(--surface2)', transition:'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
            >
              <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>
                + Agregar imágenes ({MAX_IMAGENES - totalImages} restantes)
              </p>
            </div>
          )}
          <input id="imgs-edit" type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleNewImages} />
        </div>

        {/* Título */}
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Título <FieldHint required text="Entre 5 y 200 caracteres." /></label>
          <input name="titulo" required value={form.titulo} onChange={handle} className="input" />
        </div>

        {/* Descripción */}
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Descripción <FieldHint required text="Entre 20 y 2000 caracteres." /></label>
          <textarea name="descripcion" required value={form.descripcion} onChange={handle} rows={4} className="input" style={{ resize:'none' }} />
          <p style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>{form.descripcion.length}/2000</p>
        </div>

        {/* Categoría + Carrera */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="label">Categoría</label>
            <select name="categoria" value={form.categoria} onChange={handle} className="input">
              <option value="academico">Académico</option>
              <option value="extracurricular">Extracurricular</option>
            </select>
          </div>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Carrera <FieldHint required text="Selecciona la carrera del proyecto." /></label>
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
            <label className="label">Fecha inicio</label>
            <input name="fechaInicio" type="date" value={form.fechaInicio} onChange={handle} className="input" />
          </div>
          <div>
            <label className="label">Fecha fin</label>
            <input name="fechaFin" type="date" value={form.fechaFin} onChange={handle} className="input" />
          </div>
        </div>

        {/* Tecnologías */}
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Tecnologías <FieldHint text="Separadas por coma." /></label>
          <input name="tecnologias" value={form.tecnologias} onChange={handle} className="input" />
        </div>

        {/* Asignatura */}
        <div>
          <label className="label">Asignatura</label>
          <input name="asignatura" value={form.asignatura} onChange={handle} className="input" />
        </div>

        {/* Repositorio + Demo */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="label">Repositorio</label>
            <input name="repositorio" type="url" value={form.repositorio} onChange={handle} className="input" />
          </div>
          <div>
            <label className="label">Demo</label>
            <input name="enlaceDemo" type="url" value={form.enlaceDemo} onChange={handle} className="input" />
          </div>
        </div>

        {/* Nivel + Público */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Nivel <FieldHint text="Número del 1 al 6." /></label>
            <input name="nivel" type="number" min={1} max={6} value={form.nivel} onChange={handle} className="input" />
          </div>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>¿Público? <FieldHint text="Sí: visible si está aprobado." /></label>
            <select name="publico" value={form.publico} onChange={handle} className="input">
              <option value="false">🔒 Privado</option>
              <option value="true">🌐 Público</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Tags <FieldHint text="Palabras clave separadas por coma." /></label>
          <input name="tags" value={form.tags} onChange={handle} className="input" />
        </div>

        <div style={{ display:'flex', gap:10, paddingTop:4 }}>
          <button type="submit" disabled={saving} className="btn-primary btn-lg" style={{ flex:1 }}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary btn-lg" style={{ flex:1 }}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}
