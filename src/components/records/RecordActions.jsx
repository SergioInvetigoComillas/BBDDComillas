import { useState } from "react"
import { Link } from "react-router-dom"

import {
  deactivateRecord,
  deleteRecordsPermanently,
  reactivateRecords,
} from "../../services/recordsService"

export default function RecordActions({
  recordId,
  mode = "active",
  onRecordChanged,
}) {
  const [loading, setLoading] = useState(false)

  const isDeletedMode = mode === "deleted"

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      "¿Seguro que quieres desactivar este registro? No se eliminará definitivamente."
    )

    if (!confirmed) return

    try {
      setLoading(true)
      await deactivateRecord(recordId)

      if (onRecordChanged) {
        await onRecordChanged()
      }
    } catch (err) {
      console.error(err)
      alert("No se pudo desactivar el registro.")
    } finally {
      setLoading(false)
    }
  }

  const handleReactivate = async () => {
    const confirmed = window.confirm(
      "¿Seguro que quieres reactivar este registro?"
    )

    if (!confirmed) return

    try {
      setLoading(true)
      await reactivateRecords([recordId])

      if (onRecordChanged) {
        await onRecordChanged()
      }
    } catch (err) {
      console.error(err)
      alert("No se pudo reactivar el registro.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePermanently = async () => {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar definitivamente este registro? Esta acción no se puede deshacer."
    )

    if (!confirmed) return

    try {
      setLoading(true)
      await deleteRecordsPermanently([recordId])

      if (onRecordChanged) {
        await onRecordChanged()
      }
    } catch (err) {
      console.error(err)
      alert("No se pudo eliminar definitivamente el registro.")
    } finally {
      setLoading(false)
    }
  }

  if (isDeletedMode) {
    return (
      <div className="flex justify-end gap-3">
        <button
          type="button"
          disabled={loading}
          className="text-yellow-700 hover:text-yellow-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleReactivate}
        >
          {loading ? "Procesando..." : "Reactivar"}
        </button>

        <button
          type="button"
          disabled={loading}
          className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleDeletePermanently}
        >
          Eliminar
        </button>
      </div>
    )
  }

  return (
    <div className="flex justify-end gap-3">
      <Link
        to={`/registros/${recordId}`}
        className="text-yellow-700 hover:text-yellow-800 font-medium"
      >
        Ver
      </Link>

      <Link
        to={`/registros/${recordId}/editar`}
        className="text-gray-700 hover:text-gray-900 font-medium"
      >
        Editar
      </Link>

      <button
        type="button"
        disabled={loading}
        className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleDeactivate}
      >
        {loading ? "Desactivando..." : "Desactivar"}
      </button>
    </div>
  )
}