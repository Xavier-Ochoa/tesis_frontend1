import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import FieldHint from '../../components/FieldHint'

const defaultForm = { titulo:'', descripcion:'', categoria:'academico', fechaInicio:'', fechaFin:'', carrera:'', tecnologias:'', repositorio:'', enlaceDemo:'', asignatura:'', tags:'', nivel:'', publico:'false' }

export default function CreateProject() {
  const navigate = useNavigate()
  const [form, setForm]       = useState(defaultForm)
  const [image, setImage]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleImage = e => { const f=e.target.files[0]; if(!f) return; setImage(f); setPreview(URL.createObjectURL(f)) }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v]) => { if(v!=='') fd.append(k,v) })
      if (image) fd.append('imagen', image)
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
    <div className="page" style={{ maxWidth: 680, animation: 'slideUp 0.4s ease-out' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:'var(--text-1)', margin:'0 0 4px', letterSpacing:'-0.03em' }}>Nuevo Proyecto</h1>
        <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>El proyecto quedará pendiente de aprobación por el administrador.</p>
      </div>

      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
        {/* Image upload */}
        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Imagen del proyecto <FieldHint text="JPG o PNG. Se sube a Cloudinary. Opcional." /></label>
          <div onClick={() => document.getElementById('img').click()} style={{
            border: `2px dashed ${preview ? 'var(--primary)' : 'var(--border2)'}`,
            borderRadius: 14, overflow:'hidden', cursor:'pointer', transition:'border-color 0.2s',
            background: 'var(--surface2)', minHeight: 120,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            {preview ? <img src={preview} alt="preview" style={{ width:'100%', height:160, objectFit:'cover' }} />
              : <div style={{ textAlign:'center', padding:'2rem' }}>
                  <p style={{ fontSize:32, marginBottom:6 }}>🖼️</p>
                  <p style={{ fontSize:13, color:'var(--text-3)', margin:0 }}>Haz clic para subir una imagen</p>
                  <p style={{ fontSize:11, color:'var(--text-3)', margin:'3px 0 0' }}>JPG, PNG · Opcional</p>
                </div>
            }
          </div>
          <input id="img" type="file" accept="image/*" style={{ display:'none' }} onChange={handleImage} />
        </div>

        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Título <FieldHint required text="Entre 5 y 200 caracteres." /></label>
          <input name="titulo" required value={form.titulo} onChange={handle} className="input" placeholder="Nombre del proyecto" />
        </div>

        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Descripción <FieldHint required text="Entre 20 y 2000 caracteres." /></label>
          <textarea name="descripcion" required value={form.descripcion} onChange={handle} rows={4} className="input" style={{ resize:'none' }} placeholder="Describe tu proyecto..." />
          <p style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>{form.descripcion.length}/2000</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Categoría <FieldHint required text="Académico: materia/tesis. Extracurricular: proyecto personal." /></label>
            <select name="categoria" value={form.categoria} onChange={handle} className="input">
              <option value="academico">Académico</option>
              <option value="extracurricular">Extracurricular</option>
            </select>
          </div>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Carrera <FieldHint required text="Nombre completo de la carrera." /></label>
            <input name="carrera" required value={form.carrera} onChange={handle} className="input" placeholder="Ing. en Software" />
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Fecha inicio <FieldHint required text="Formato YYYY-MM-DD." /></label>
            <input name="fechaInicio" type="date" required value={form.fechaInicio} onChange={handle} className="input" />
          </div>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Fecha fin <FieldHint text="Opcional. Déjalo vacío si sigue en curso." /></label>
            <input name="fechaFin" type="date" value={form.fechaFin} onChange={handle} className="input" />
          </div>
        </div>

        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Tecnologías <FieldHint text="Separadas por coma. Ej: React, Node.js" /></label>
          <input name="tecnologias" value={form.tecnologias} onChange={handle} className="input" placeholder="React, Node.js, MongoDB" />
        </div>

        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Asignatura <FieldHint text="Materia relacionada con el proyecto." /></label>
          <input name="asignatura" value={form.asignatura} onChange={handle} className="input" placeholder="Redes de Computadoras" />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Repositorio <FieldHint text="URL completa. Ej: https://github.com/..." /></label>
            <input name="repositorio" type="url" value={form.repositorio} onChange={handle} className="input" placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Demo <FieldHint text="URL del proyecto en producción." /></label>
            <input name="enlaceDemo" type="url" value={form.enlaceDemo} onChange={handle} className="input" placeholder="https://demo.vercel.app" />
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>Semestre / Nivel <FieldHint text="Número del 1 al 6." /></label>
            <input name="nivel" type="number" min={1} max={6} value={form.nivel} onChange={handle} className="input" placeholder="1 - 6" />
          </div>
          <div>
            <label className="label" style={{ display:'flex', alignItems:'center' }}>¿Público? <FieldHint text="Público: visible para todos (requiere aprobación del admin). Privado: solo tú lo ves." /></label>
            <select name="publico" value={form.publico} onChange={handle} className="input">
              <option value="false">🔒 Privado</option>
              <option value="true">🌐 Público</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label" style={{ display:'flex', alignItems:'center' }}>Tags <FieldHint text="Palabras clave separadas por coma." /></label>
          <input name="tags" value={form.tags} onChange={handle} className="input" placeholder="iot, python, redes" />
        </div>

        <div style={{ display:'flex', gap:10, paddingTop:4 }}>
          <button type="submit" disabled={loading} className="btn-primary btn-lg" style={{ flex:1 }}>
            {loading ? 'Creando...' : 'Crear Proyecto'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary btn-lg" style={{ flex:1 }}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}
