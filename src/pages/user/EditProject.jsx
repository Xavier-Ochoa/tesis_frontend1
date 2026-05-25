import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import FieldHint from '../../components/FieldHint'
import toast from 'react-hot-toast'

const MAX_IMAGENES = 5
const CARRERAS = [
  'Agua y Saneamiento Ambiental',
  'Desarrollo de Software',
  'Electromecánica',
  'Redes y Telecomunicaciones',
  'Procesamiento de Alimentos',
  'Procesamiento Industrial de la Madera',
]

export default function EditProject() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject]         = useState(null)
  const [form, setForm]               = useState(null)
  const [existingImages, setExisting] = useState([])
  const [newImages, setNewImages]     = useState([])
  const [newPreviews, setNewPreviews] = useState([])
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [deletingIdx, setDeletingIdx] = useState(null)
  const [rol, setRol]                 = useState(null)

  useEffect(() => {
    api.get(`/proyectos/${id}`)
      .then(r => {
        const p = r.data?.data || r.data
        setProject(p)
        setExisting(p.imagenes || [])

        const autorId = p.autor?._id || p.autor
        if (user?._id === autorId) setRol('autor')
        else if ((p.colaboradores || []).some(c => (c._id || c) === user?._id)) setRol('colaborador')
        else setRol(null)

        setForm({
          titulo:             p.titulo || '',
          categoria:          p.categoria || 'academico',
          carrera:            p.carrera || '',
          tipoProyecto:       p.tipoProyecto || (p.publico ? 'publico' : 'privado'), // migración
          descripcion:        p.descripcion || '',
          tecnologias:        Array.isArray(p.tecnologias) ? p.tecnologias.join(', ') : '',
          repositorio:        p.repositorio || '',
          enlaceDemo:         p.enlaceDemo  || '',
          tags:               Array.isArray(p.tags) ? p.tags.join(', ') : '',
          lineaInvestigacion: p.lineaInvestigacion || p.asignatura || '', // migración
          fechaInicio:        p.fechaInicio ? p.fechaInicio.slice(0, 10) : '',
          fechaFin:           p.fechaFin    ? p.fechaFin.slice(0, 10)    : '',
        })
      })
      .catch(() => toast.error('No se pudo cargar el proyecto'))
      .finally(() => setLoading(false))
  }, [id])

  const handle = e => {
    const { name, value } = e.target
    // Bloquear cambio a privado si el proyecto actual es público
    if (name === 'tipoProyecto' && value === 'privado' && project?.tipoProyecto === 'publico') {
      toast.error('Un proyecto público no puede cambiarse a privado.')
      return
    }
    setForm({ ...form, [name]: value })
  }

  const handleNewImages = e => {
    const files = Array.from(e.target.files || [])
    const total = existingImages.length + newImages.length + files.length
    if (total > MAX_IMAGENES) {
      toast.error(`Máximo ${MAX_IMAGENES} imágenes. Tienes ${existingImages.length + newImages.length}.`)
      return
    }
    const nuevas = files.slice(0, MAX_IMAGENES - existingImages.length - newImages.length)
    setNewImages(prev => [...prev, ...nuevas])
    setNewPreviews(prev => [...prev, ...nuevas.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }

  const removeNewImage = idx => {
    setNewImages(prev => prev.filter((_, i) => i !== idx))
    setNewPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const deleteExistingImage = async (indice) => {
    if (!confirm('¿Eliminar esta imagen?')) return
    setDeletingIdx(indice)
    const endpoint = rol === 'colaborador'
      ? `/proyectos/${id}/colaborador/imagenes`
      : `/proyectos/${id}/imagenes`
    try {
      await api.delete(endpoint, { data: { indice } })
      setExisting(prev => prev.filter((_, i) => i !== indice))
      toast.success('Imagen eliminada')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar la imagen')
    } finally { setDeletingIdx(null) }
  }

  const submit = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const fd = new FormData()
      if (rol === 'colaborador') {
        const camposColab = ['descripcion', 'tecnologias', 'repositorio', 'enlaceDemo', 'tags', 'lineaInvestigacion']
        camposColab.forEach(k => { if (form[k] !== '') fd.append(k, form[k]) })
        newImages.forEach(img => fd.append('imagenes', img))
        await api.put(`/proyectos/${id}/colaborador`, fd)
      } else {
        Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
        newImages.forEach(img => fd.append('imagenes', img))
        await api.put(`/proyectos/${id}`, fd)
      }
      toast.success('Proyecto actualizado')
      navigate(`/proyectos/${id}`)
    } catch (err) {
      const errores = err.response?.data?.errores
      if (errores) errores.forEach(e => toast.error(e.mensaje))
      else toast.error(err.response?.data?.message || 'Error al actualizar')
    } finally { setSaving(false) }
  }

  if (loading || !form) return <Spinner />
  if (!rol) return (
    <div style={{ textAlign:'center', padding:'5rem', color:'var(--text-3)' }}>
      <p style={{ fontSize:48, marginBottom:12 }}>🔒</p>
      <p style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:'var(--text-2)' }}>Sin permiso</p>
      <p style={{ fontSize:14, marginBottom:20 }}>Solo el autor o colaboradores pueden editar este proyecto.</p>
      <button onClick={() => navigate(-1)} className="btn-secondary">Volver</button>
    </div>
  )

  const totalImages  = existingImages.length + newImages.length
  const esColaborador = rol === 'colaborador'
  const esPublico     = project?.tipoProyecto === 'publico'

  return (
    <div className="page" style={{ maxWidth:680, animation:'slideUp 0.4s ease-out' }}>
      <div style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'var(--text-1)', margin:'0 0 8px', letterSpacing:'-0.03em' }}>
          Editar Proyecto
        </h1>

        {/* Badges de info del proyecto */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
          {project?.proyecto_id && (
            <span style={{ fontSize:12, color:'var(--text-3)', fontWeight:600, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, padding:'3px 8px' }}>
              #{project.proyecto_id}
            </span>
          )}
          {project?.version && (
            <span className="badge badge-blue" style={{ fontSize:11 }}>
              v{String(project.version).padStart(3,'0')}
            </span>
          )}
          {project?.esUltimaVersion === false && (
            <span className="badge badge-yellow" style={{ fontSize:11 }}>🕒 Versión anterior</span>
          )}
        </div>

        {esColaborador && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--warning-l)', border:'1px solid var(--warning)', borderRadius:8, padding:'6px 12px', fontSize:12, color:'var(--warning)', fontWeight:600 }}>
            👥 Editando como colaborador — solo puedes modificar ciertos campos
          </div>
        )}
      </div>

      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

        {/* Galería de imágenes */}
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>
            Imágenes del proyecto
            <FieldHint text="Puedes eliminar existentes o agregar nuevas. Máximo 5 en total." />
            <span style={{ marginLeft:'auto', fontSize:11, color:'var(--text-3)', fontWeight:400 }}>{totalImages}/{MAX_IMAGENES}</span>
          </label>

          {existingImages.length > 0 && (
            <div style={{ marginBottom:8 }}>
              <p style={{ fontSize:11, color:'var(--text-3)', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>Imágenes actuales</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))', gap:8 }}>
                {existingImages.map((src, i) => (
                  <div key={i} style={{ position:'relative', borderRadius:10, overflow:'hidden', aspectRatio:'1', border:'1px solid var(--border)', opacity:deletingIdx===i ? 0.5 : 1 }}>
                    <img src={src} alt={`img-${i}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    <button type="button" onClick={() => deleteExistingImage(i)} disabled={deletingIdx !== null}
                      style={{ position:'absolute', top:4, right:4, width:22, height:22, borderRadius:'50%', background:'rgba(239,68,68,0.9)', color:'white', border:'none', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {deletingIdx === i ? '…' : '×'}
                    </button>
                    {i === 0 && <span style={{ position:'absolute', bottom:4, left:4, fontSize:9, fontWeight:700, background:'var(--primary)', color:'white', padding:'2px 5px', borderRadius:4 }}>PORTADA</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {newPreviews.length > 0 && (
            <div style={{ marginBottom:8 }}>
              <p style={{ fontSize:11, color:'var(--text-3)', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>Nuevas a subir</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))', gap:8 }}>
                {newPreviews.map((src, i) => (
                  <div key={i} style={{ position:'relative', borderRadius:10, overflow:'hidden', aspectRatio:'1', border:'2px dashed var(--primary)' }}>
                    <img src={src} alt={`new-${i}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    <button type="button" onClick={() => removeNewImage(i)}
                      style={{ position:'absolute', top:4, right:4, width:22, height:22, borderRadius:'50%', background:'rgba(0,0,0,0.7)', color:'white', border:'none', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalImages < MAX_IMAGENES && (
            <div onClick={() => document.getElementById('imgs-edit').click()}
              style={{ border:'2px dashed var(--border2)', borderRadius:12, padding:'1rem', textAlign:'center', cursor:'pointer', background:'var(--surface2)', transition:'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}>
              <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>+ Agregar imágenes ({MAX_IMAGENES - totalImages} restantes)</p>
            </div>
          )}
          <input id="imgs-edit" type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleNewImages} />
        </div>

        {/* Campos solo del AUTOR */}
        {!esColaborador && (
          <>
            <div>
              <label className="label" style={{ display:'flex', alignItems:'center' }}>Título <FieldHint required text="Entre 5 y 200 caracteres." /></label>
              <input name="titulo" required value={form.titulo} onChange={handle} className="input" />
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
                <label className="label" style={{ display:'flex', alignItems:'center' }}>Carrera <FieldHint required text="Carrera a la que pertenece el proyecto." /></label>
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
              <label className="label">Línea de Investigación</label>
              <input name="lineaInvestigacion" value={form.lineaInvestigacion} onChange={handle} className="input" placeholder="Área o materia relacionada con el proyecto" />
            </div>

            {/* Tipo de Proyecto — solo si el proyecto es privado (los públicos no pueden cambiarse) */}
            <div>
              <label className="label" style={{ display:'flex', alignItems:'center' }}>
                Tipo de Proyecto
                <FieldHint text={esPublico ? 'Los proyectos públicos no pueden cambiarse a privado.' : 'Público: revisado por el admin. Privado: solo tú y colaboradores.'} />
              </label>
              {esPublico ? (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <input className="input" value="🌐 Público" readOnly style={{ background:'var(--surface2)', cursor:'not-allowed', opacity:0.7 }} />
                  <span style={{ fontSize:12, color:'var(--warning)', fontWeight:600, whiteSpace:'nowrap' }}>No editable</span>
                </div>
              ) : (
                <select name="tipoProyecto" value={form.tipoProyecto} onChange={handle} className="input">
                  <option value="privado">🔒 Privado</option>
                  <option value="publico">🌐 Público</option>
                </select>
              )}
              {esPublico && (
                <p style={{ fontSize:12, color:'var(--warning)', marginTop:5 }}>
                  ⚠️ Un proyecto público no puede convertirse en privado.
                </p>
              )}
            </div>
          </>
        )}

        {/* Campos compartidos (autor Y colaborador) */}
        <div style={{ ...(esColaborador && { background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }) }}>
          {esColaborador && (
            <p style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 1rem' }}>
              Campos que puedes editar
            </p>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div>
              <label className="label" style={{ display:'flex', alignItems:'center' }}>Descripción <FieldHint required text="Entre 20 y 2000 caracteres." /></label>
              <textarea name="descripcion" required value={form.descripcion} onChange={handle} rows={4} className="input" style={{ resize:'none' }} />
              <p style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>{form.descripcion.length}/2000</p>
            </div>

            <div>
              <label className="label" style={{ display:'flex', alignItems:'center' }}>Tecnologías <FieldHint text="Separadas por coma." /></label>
              <input name="tecnologias" value={form.tecnologias} onChange={handle} className="input" placeholder="React, Node.js, MongoDB" />
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
              <label className="label" style={{ display:'flex', alignItems:'center' }}>Tags <FieldHint text="Palabras clave separadas por coma." /></label>
              <input name="tags" value={form.tags} onChange={handle} className="input" placeholder="iot, python, redes" />
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, paddingTop:4 }}>
          <button type="submit" disabled={saving} className="btn-primary btn-lg" style={{ flex:1 }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary btn-lg" style={{ flex:1 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
