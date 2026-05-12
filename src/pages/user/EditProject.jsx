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
          publico:     String(p.publico ?? 'true'),
        })
        if (p.imagenes?.[0]) setPreview(p.imagenes[0])
      })
      .catch(() => toast.error('No se pudo cargar el proyecto'))
      .finally(() => setLoading(false))
  }, [id])

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
      if (image) fd.append('imagen', image)
      await api.put(`/proyectos/${id}`, fd)
      toast.success('Proyecto actualizado')
      navigate(`/proyectos/${id}`)
    } catch (err) {
      const errores = err.response?.data?.errores
      if (errores) errores.forEach(e => toast.error(e.mensaje))
      else toast.error(err.response?.data?.message || 'Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) return <Spinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Proyecto</h1>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="label flex items-center">
            Imagen del proyecto
            <FieldHint text="Si subes una nueva imagen, la anterior se elimina automáticamente de Cloudinary." />
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-primary-500 transition-colors cursor-pointer"
            onClick={() => document.getElementById('img-edit').click()}>
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-40 object-cover rounded-lg" />
            ) : (
              <div className="py-6">
                <p className="text-gray-400 text-sm">Haz clic para cambiar la imagen</p>
              </div>
            )}
          </div>
          <input id="img-edit" type="file" accept="image/*" className="hidden" onChange={handleImage} />
          {preview && <p className="text-xs text-gray-400 mt-1">Haz clic en la imagen para cambiarla</p>}
        </div>

        <div>
          <label className="label flex items-center">
            Título
            <FieldHint required text="Entre 5 y 200 caracteres." />
          </label>
          <input name="titulo" required value={form.titulo} onChange={handle} className="input" />
        </div>

        <div>
          <label className="label flex items-center">
            Descripción
            <FieldHint required text="Entre 20 y 2000 caracteres." />
          </label>
          <textarea name="descripcion" required value={form.descripcion} onChange={handle} rows={4} className="input resize-none" />
          <p className="text-xs text-gray-400 mt-1">{form.descripcion.length}/2000</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center">
              Categoría
              <FieldHint required text="Académico o extracurricular." />
            </label>
            <select name="categoria" value={form.categoria} onChange={handle} className="input">
              <option value="academico">Académico</option>
              <option value="extracurricular">Extracurricular</option>
            </select>
          </div>
          <div>
            <label className="label flex items-center">
              Carrera
              <FieldHint required text="Nombre completo de la carrera." />
            </label>
            <input name="carrera" value={form.carrera} onChange={handle} className="input" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center">
              Fecha inicio
              <FieldHint text="Formato YYYY-MM-DD." />
            </label>
            <input name="fechaInicio" type="date" value={form.fechaInicio} onChange={handle} className="input" />
          </div>
          <div>
            <label className="label flex items-center">
              Fecha fin
              <FieldHint text="Déjalo vacío si el proyecto sigue en curso." />
            </label>
            <input name="fechaFin" type="date" value={form.fechaFin} onChange={handle} className="input" />
          </div>
        </div>

        <div>
          <label className="label flex items-center">
            Tecnologías
            <FieldHint text="Separadas por coma. Ej: React, Node.js" />
          </label>
          <input name="tecnologias" value={form.tecnologias} onChange={handle} className="input" />
        </div>

        <div>
          <label className="label flex items-center">
            Asignatura
            <FieldHint text="Materia relacionada con el proyecto." />
          </label>
          <input name="asignatura" value={form.asignatura} onChange={handle} className="input" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center">
              Repositorio
              <FieldHint text="URL completa. Ej: https://github.com/usuario/repo" />
            </label>
            <input name="repositorio" type="url" value={form.repositorio} onChange={handle} className="input" />
          </div>
          <div>
            <label className="label flex items-center">
              Demo
              <FieldHint text="URL del proyecto en producción." />
            </label>
            <input name="enlaceDemo" type="url" value={form.enlaceDemo} onChange={handle} className="input" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center">
              Nivel / Semestre
              <FieldHint text="Número del 1 al 6." />
            </label>
            <input name="nivel" type="number" min={1} max={6} value={form.nivel} onChange={handle} className="input" />
          </div>
          <div>
            <label className="label flex items-center">
              ¿Público?
              <FieldHint text="Sí: aparece en el listado general. No: solo visible para ti." />
            </label>
            <select name="publico" value={form.publico} onChange={handle} className="input">
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label flex items-center">
            Tags
            <FieldHint text="Palabras clave separadas por coma para facilitar la búsqueda." />
          </label>
          <input name="tags" value={form.tags} onChange={handle} className="input" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancelar</button>
        </div>
      </form>
    </div>
  )
}
