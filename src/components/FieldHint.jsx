import { useState, useEffect, useRef } from 'react'

/**
 * Pequeño botón ⓘ que muestra un tooltip con las reglas del campo al hacer click.
 * Uso: <FieldHint text="Mínimo 2 caracteres. Solo letras." />
 */
export default function FieldHint({ text, required = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <span ref={ref} className="relative inline-flex items-center ml-1.5">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors focus:outline-none
          ${open
            ? 'bg-primary-700 text-white'
            : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
          }`}
        aria-label="Ver reglas del campo"
      >
        i
      </button>

      {open && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed">
          {required && (
            <span className="inline-block bg-red-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded mb-1.5 mr-1">
              Obligatorio
            </span>
          )}
          {!required && (
            <span className="inline-block bg-gray-600 text-gray-200 text-[9px] font-semibold px-1.5 py-0.5 rounded mb-1.5 mr-1">
              Opcional
            </span>
          )}
          {text}
          {/* Triángulo apuntando a la izquierda */}
          <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </div>
      )}
    </span>
  )
}
