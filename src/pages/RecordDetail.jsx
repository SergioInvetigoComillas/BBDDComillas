import { Link, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"

import Button from "../components/ui/Button"
import { getRecordById } from "../services/recordsService"

export default function RecordDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadRecord() {
      try {
        setLoading(true)
        setError("")

        const data = await getRecordById(id)
        setRecord(data)
      } catch (err) {
        console.error(err)
        setError("No se pudo cargar el registro.")
      } finally {
        setLoading(false)
      }
    }

    loadRecord()
  }, [id])

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-8">
        <section className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Cargando registro...</p>
        </section>
      </main>
    )
  }

  if (error || !record) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-8">
        <section className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Registro no encontrado
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            {error || "No se ha podido encontrar la ficha solicitada."}
          </p>

          <div className="mt-6">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Volver
            </Button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {record.lugar || "Registro"}
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Detalle del registro archivístico.
          </p>
        </div>

        <div className="flex gap-3">
          <Link to={`/registros/${record.id}/editar`}>
            <Button>Editar</Button>
          </Link>

          <Button variant="secondary" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </div>
      </div>

      <section className="bg-white border border-gray-200 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <Info label="Lugar" value={record.lugar} />
          <Info label="Archivo" value={record.archivo} />
          <Info label="Sección" value={record.seccion} />
          <Info label="Tipo de obra" value={record.tipo_obra} />
          <Info label="Notario" value={record.notario} />

          <Info
            label="Años"
            value={formatYears(record.anio_inicio, record.anio_fin)}
          />

          <Info label="Legajo" value={record.legajo} />

          <Info
            label="Folios"
            value={formatFolios(record.folio_inicio, record.folio_fin)}
          />

          <Info label="Artífices" value={record.artifices} />
        </div>

        <div className="mt-8 space-y-6">
          <Block title="Contenido" text={record.contenido} />
          <Block title="Observaciones" text={record.observaciones} />
        </div>
      </section>
    </main>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-gray-800 font-medium">
        {value || "—"}
      </p>
    </div>
  )
}

function Block({ title, text }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-800 mb-2">
        {title}
      </h2>

      <div className="bg-gray-50 border border-gray-200 rounded p-4 text-sm text-gray-700 whitespace-pre-line">
        {text || "—"}
      </div>
    </div>
  )
}

function formatYears(anioInicio, anioFin) {
  if (!anioInicio && !anioFin) return "—"

  if (anioFin && anioFin !== anioInicio) {
    return `${anioInicio} - ${anioFin}`
  }

  return anioInicio
}

function formatFolios(folioInicio, folioFin) {
  if (!folioInicio && !folioFin) return "—"

  if (folioFin && folioFin !== folioInicio) {
    return `${folioInicio} - ${folioFin}`
  }

  return folioInicio
}