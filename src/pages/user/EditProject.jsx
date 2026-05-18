import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import FieldHint from '../../components/FieldHint'
import toast from 'react-hot-toast'

export default function EditProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm]       = useState(null)
  const [image, setImage]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    api.get(`/proyectos/${id}`).then(r => {
      const p = r.data?.data || r.data
      setForm({
        titulo: p.titulo||'', descripcion: p.descripcion||'', categoria: p.categoria||'academico',
        fechaInicio: p.fechaInicio?p.fechaInicio.slice(0,10):'', fechaFin: p.fechaFin?p.fechaFin.slice(0,10):'',
        carrera: p.carrera||'', tecnologias: Array.isArray(p.tecnologias)?p.tecnologias.join(', '):'',
        repositorio: p.repositorio||'', enlaceDemo: p.enlaceDemo||'', asignatura: p.asignatura||'',
        tags: Array.isArray(p.tags)?p.tags.join(', '):'', nivel: p.nivel||'',
        publico: String(p.publico ?? 'false'),
      })
      if (p.imagenes?.[0]) setPreview(p.imagenes[0])
    }).catch(() => toast.error('No se pudo cargar el proyecto')).finally(() => setLoading(false))
  }, [id])

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleImage = e => { const f=e.target.files[0]; if(!f) return; setImage(f); setPreview(URL.createObjectURL(f)) }

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v]) => { if(v!=='') fd.append(k,v) })
      if (image) fd.append('imagen', image)
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

  return (
    <div className="page" style={{ maxWidth: 680, animation: 'slideUp 0.4s ease-out' }}>
      <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'var(--text-1)', margin:'0 0 1.75rem', letterSpacing:'-0.03em' }}>Editar Proyecto</h1>

      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Imagen <FieldHint text="Si subes nueva imagen, la anterior se elimina de Cloudinary." /></label>
          <div onClick={() => document.getElementById('img-edit').click()} style={{ border:`2px dashed ${preview?'var(--primary)':'var(--border2)'}`, borderRadius:14, overflow:'hidden', cursor:'pointer', minHeight:100, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface2)' }}>
            {preview ? <img src={preview} alt="" style={{ width:'100%', height:160, objectFit:'cover' }} />
              : <p style={{ fontSize:13, color:'var(--text-3)', padding:'2rem' }}>Haz clic para cambiar la imagen</p>}
          </div>
          <input id="img-edit" type="file" accept="image/*" style={{ display:'none' }} onChange={handleImage} />
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
            <label className="label">Carrera</label>
            <select name="carrera" value={form.carrera} onChange={handle} className="input">
              <option value="">-- Selecciona una carrera --</option>
              {['Agua y Saneamiento Ambiental','Desarrollo de Software','Electromecánica','Redes y Telecomunicaciones','Procesamiento de Alimentos','Procesamiento industrial de la madera'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
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
          <input name="tecnologias" value={form.tecnologias} onChange={handle} className="input" />
        </div>
        <div>
          <label className="label">Asignatura</label>
          <input name="asignatura" value={form.asignatura} onChange={handle} className="input" />
        </div>
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
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Nivel <FieldHint text="Número del 1 al 6." /></label>
            <input name="nivel" type="number" min={1} max={6} value={form.nivel} onChange={handle} className="input" />
          </div>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>¿Público? <FieldHint text="Sí: visible para todos (si está aprobado). No: solo tú." /></label>
            <select name="publico" value={form.publico} onChange={handle} className="input">
              <option value="false">🔒 Privado</option>
              <option value="true">🌐 Público</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Tags <FieldHint text="Palabras clave separadas por coma." /></label>
          <input name="tags" value={form.tags} onChange={handle} className="input" />
        </div>
        <div style={{ display:'flex', gap:10, paddingTop:4 }}>
          <button type="submit" disabled={saving} className="btn-primary btn-lg" style={{ flex:1 }}>{saving?'Guardando...':'Guardar cambios'}</button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary btn-lg" style={{ flex:1 }}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}
