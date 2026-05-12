import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import FieldHint from '../../components/FieldHint'

const defaultForm = {
  titulo: '', descripcion: '', categoria: 'academico', fechaInicio: '',
  fechaFin: '', carrera: '', tecnologias: '', repositorio: '', enlaceDemo: '',
  asignatura: '', tags: '', nivel: '', publico: 'true',
}

export default function CreateProject() {
  const navigate = useNavigate()
  const [form, setForm]       = useState(defaultForm)
  const [image, setImage]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
      if (image) fd.append('imagen', image)
      const { data } = await api.post('/proyectos', fd)
      toast.success('Proyecto creado exitosamente')
      navigate(`/proyectos/${data.data?._id || data._id}`)
    } catch (err) {
      const errores = err.response?.data?.errores
      if (errores) errores.forEach(e => toast.error(e.mensaje))
      else toast.error(err.response?.data?.message || 'Error al crear el proyecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Proyecto</h1>

      <form onSubmit={submit} className="space-y-5">
        {/* Imagen */}
        <div>
          <label className="label flex items-center">
            Imagen del proyecto
            <FieldHint text="JPG o PNG. Se sube a Cloudinary. Si no subes una, se mostrará un placeholder con la inicial del título." />
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-primary-500 transition-colors cursor-pointer"
            onClick={() => document.getElementById('img').click()}>
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-40 object-cover rounded-lg" />
            ) : (
              <div className="py-6">
                <p className="text-gray-400 text-sm">Haz clic para subir una imagen</p>
                <p className="text-gray-300 text-xs mt-1">JPG, PNG · Opcional</p>
              </div>
            )}
          </div>
          <input id="img" type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </div>

        <div>
          <label className="label flex items-center">
            Título
            <FieldHint required text="Entre 5 y 200 caracteres. Debe ser descriptivo y único." />
          </label>
          <input name="titulo" required value={form.titulo} onChange={handle} className="input" placeholder="Nombre del proyecto" />
        </div>

        <div>
          <label className="label flex items-center">
            Descripción
            <FieldHint required text="Entre 20 y 2000 caracteres. Explica qué hace el proyecto, su objetivo y cómo funciona." />
          </label>
          <textarea name="descripcion" required value={form.descripcion} onChange={handle} rows={4}
            className="input resize-none" placeholder="Describe tu proyecto..." />
          <p className="text-xs text-gray-400 mt-1">{form.descripcion.length}/2000</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center">
              Categoría
              <FieldHint required text="Académico: proyecto de una materia o tesis. Extracurricular: proyecto personal o de club." />
            </label>
            <select name="categoria" value={form.categoria} onChange={handle} className="input">
              <option value="academico">Académico</option>
              <option value="extracurricular">Extracurricular</option>
            </select>
          </div>
          <div>
            <label className="label flex items-center">
              Carrera
              <FieldHint required text="Nombre completo de la carrera a la que pertenece el proyecto." />
            </label>
            <input name="carrera" required value={form.carrera} onChange={handle} className="input" placeholder="Ing. en Software" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center">
              Fecha inicio
              <FieldHint required text="Formato YYYY-MM-DD. Fecha en que comenzó el proyecto." />
            </label>
            <input name="fechaInicio" type="date" required value={form.fechaInicio} onChange={handle} className="input" />
          </div>
          <div>
            <label className="label flex items-center">
              Fecha fin
              <FieldHint text="Opcional. Déjalo vacío si el proyecto aún está en curso." />
            </label>
            <input name="fechaFin" type="date" value={form.fechaFin} onChange={handle} className="input" />
          </div>
        </div>

        <div>
          <label className="label flex items-center">
            Tecnologías
            <FieldHint text="Separadas por coma. Ej: React, Node.js, MongoDB. Se mostrarán como etiquetas." />
          </label>
          <input name="tecnologias" value={form.tecnologias} onChange={handle} className="input" placeholder="React, Node.js, MongoDB" />
        </div>

        <div>
          <label className="label flex items-center">
            Asignatura
            <FieldHint text="Materia en la que se desarrolló el proyecto. Solo para proyectos académicos." />
          </label>
          <input name="asignatura" value={form.asignatura} onChange={handle} className="input" placeholder="Redes de Computadoras" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center">
              Repositorio
              <FieldHint text="URL completa de GitHub, GitLab, etc. Ej: https://github.com/usuario/repo" />
            </label>
            <input name="repositorio" type="url" value={form.repositorio} onChange={handle} className="input" placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="label flex items-center">
              Demo
              <FieldHint text="URL del proyecto desplegado. Ej: https://mi-app.vercel.app" />
            </label>
            <input name="enlaceDemo" type="url" value={form.enlaceDemo} onChange={handle} className="input" placeholder="https://demo.vercel.app" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center">
              Semestre / Nivel
              <FieldHint text="Número del 1 al 6 correspondiente al semestre en que se realizó." />
            </label>
            <input name="nivel" type="number" min={1} max={6} value={form.nivel} onChange={handle} className="input" placeholder="1 - 6" />
          </div>
          <div>
            <label className="label flex items-center">
              ¿Público?
              <FieldHint text="Sí: visible en el listado general. No: solo tú y el admin pueden verlo." />
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
            <FieldHint text="Palabras clave separadas por coma. Ayudan a encontrar el proyecto en la búsqueda. Ej: iot, python, redes" />
          </label>
          <input name="tags" value={form.tags} onChange={handle} className="input" placeholder="iot, python, redes" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Creando...' : 'Crear Proyecto'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancelar</button>
        </div>
      </form>
    </div>
  )
}
