import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import Button from "../components/ui/Button"
import RecordFormFields from "../components/forms/RecordFormFields"

import { getAllCatalogs } from "../services/catalogService"
import {
  createRecord,
  getRecordForEdit,
  updateRecord,
} from "../services/recordsService"

const emptyRecord = {
  archivo: "",
  seccion_id: "",
  tipo_obra_id: "",
  notario_id: "",
  anio_inicio: "",
  anio_fin: "",
  legajo: "",
  folio_inicio: "",
  folio_fin: "",
  lugar_id: "",
  artifices_ids: [],
  contenido: "",
  observaciones: "",
}

export default function RecordForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const isEditing = Boolean(id)

  const [initialData, setInitialData] = useState(emptyRecord)
  const [catalogs, setCatalogs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError("")

        const catalogsData = await getAllCatalogs(true)
        setCatalogs(catalogsData)

        if (isEditing) {
          const record = await getRecordForEdit(id)

          setInitialData({
            ...emptyRecord,
            ...record,
            artifices_ids: record.artifices_ids || [],
          })
        } else {
          setInitialData(emptyRecord)
        }
      } catch (err) {
        console.error(err)
        setError("No se pudieron cargar los datos del formulario.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, isEditing])

  const handleSubmit = async (formData) => {
    try {
      setSaving(true)
      setError("")

      if (isEditing) {
        await updateRecord(id, formData)
      } else {
        await createRecord(formData)
      }

      if (window.history.length > 1) {
        navigate(-1)
      } else {
        navigate("/registros")
      }
    } catch (err) {
      console.error(err)
      setError(
        isEditing
          ? "No se pudo actualizar el registro."
          : "No se pudo crear el registro."
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-8">
        <section className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Cargando formulario...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {isEditing ? "Editar registro" : "Nuevo registro"}
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Completa la información estructurada del archivo.
          </p>
        </div>

        <Button variant="secondary" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded p-4 text-sm">
          {error}
        </div>
      )}

      <section className="bg-white border border-gray-200 rounded-lg shadow p-6">
        <RecordFormFields
          initialData={initialData}
          catalogs={catalogs}
          onSubmit={handleSubmit}
          saving={saving}
        />
      </section>
    </main>
  )
}