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
    setLoading(true)
    setResultado('')
    try {
      const { data } = await api.post('/ia/generar-titulo', { descripcion })
      setResultado(data.titulo || data.data || JSON.stringify(data))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al generar título. Verifica que HF_API_KEY esté configurada en el backend.')
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(resultado)
    toast.success('Copiado al portapapeles')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🤖</div>
        <h1 className="text-2xl font-bold text-gray-900">Generador de títulos con IA</h1>
        <p className="text-gray-500 text-sm mt-1">Describe tu proyecto y la IA sugerirá un título adecuado.</p>
      </div>

      <div className="card p-6">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Describe tu proyecto</label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={5}
              className="input resize-none"
              placeholder="Ej: Sistema que monitorea la calidad del aire usando sensores IoT, almacena datos en MongoDB y visualiza estadísticas en tiempo real..."
            />
            <p className="text-xs text-gray-400 mt-1">{descripcion.length} caracteres (mín. 15)</p>
          </div>
          <button type="submit" disabled={loading || descripcion.length < 15} className="btn-primary w-full">
            {loading ? '🤔 Generando...' : '✨ Generar título'}
          </button>
        </form>

        {resultado && (
          <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-primary-600 font-medium mb-1">TÍTULO SUGERIDO</p>
                <p className="text-gray-900 font-semibold">{resultado}</p>
              </div>
              <button onClick={copy} className="btn-secondary btn-sm text-xs flex-shrink-0">Copiar</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        Powered by Hugging Face · Los resultados son sugerencias, puedes modificarlos.
      </p>
    </div>
  )
}
