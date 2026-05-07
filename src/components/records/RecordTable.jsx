import RecordActions from "./RecordActions"

export default function RecordTable({
  records,
  mode = "active",
  selectedIds = [],
  onSelectedIdsChange,
  onRecordChanged,
}) {
  const isDeletedMode = mode === "deleted"

  const allCurrentPageIds = records.map((record) => record.id)
  const allSelected =
    allCurrentPageIds.length > 0 &&
    allCurrentPageIds.every((id) => selectedIds.includes(id))

  const toggleSelectAll = () => {
    if (!onSelectedIdsChange) return

    if (allSelected) {
      onSelectedIdsChange(
        selectedIds.filter((id) => !allCurrentPageIds.includes(id))
      )
    } else {
      onSelectedIdsChange([
        ...new Set([...selectedIds, ...allCurrentPageIds]),
      ])
    }
  }

  const toggleSelectOne = (id) => {
    if (!onSelectedIdsChange) return

    if (selectedIds.includes(id)) {
      onSelectedIdsChange(selectedIds.filter((itemId) => itemId !== id))
    } else {
      onSelectedIdsChange([...selectedIds, id])
    }
  }

  return (
    <div className="max-h-[560px] overflow-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-gray-50 text-left text-gray-600">
            {isDeletedMode && (
              <th className="px-4 py-3 border-b w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  aria-label="Seleccionar todos los registros de la página"
                />
              </th>
            )}

            <th className="px-4 py-3 border-b">Lugar</th>
            <th className="px-4 py-3 border-b">Archivo</th>
            <th className="px-4 py-3 border-b">Sección</th>
            <th className="px-4 py-3 border-b">Tipo</th>
            <th className="px-4 py-3 border-b">Año</th>
            <th className="px-4 py-3 border-b">Legajo</th>

            {isDeletedMode && (
              <th className="px-4 py-3 border-b">Desactivado</th>
            )}

            <th className="px-4 py-3 border-b text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              {isDeletedMode && (
                <td className="px-4 py-3 border-b">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(record.id)}
                    onChange={() => toggleSelectOne(record.id)}
                    aria-label={`Seleccionar registro ${record.id}`}
                  />
                </td>
              )}

              <td className="px-4 py-3 border-b">
                {record.lugar || "—"}
              </td>

              <td className="px-4 py-3 border-b font-medium text-gray-800">
                {record.archivo || "—"}
              </td>

              <td className="px-4 py-3 border-b">
                {record.seccion || "—"}
              </td>

              <td className="px-4 py-3 border-b">
                {record.tipo_obra || "—"}
              </td>

              <td className="px-4 py-3 border-b">
                {formatYears(record.anio_inicio, record.anio_fin)}
              </td>

              <td className="px-4 py-3 border-b">
                {record.legajo || "—"}
              </td>

              {isDeletedMode && (
                <td className="px-4 py-3 border-b text-gray-600">
                  {formatDate(record.deleted_at)}
                </td>
              )}

              <td className="px-4 py-3 border-b text-right">
                <RecordActions
                  recordId={record.id}
                  mode={mode}
                  onRecordChanged={onRecordChanged}
                />
              </td>
            </tr>
          ))}

          {records.length === 0 && (
            <tr>
              <td
                colSpan={isDeletedMode ? 9 : 7}
                className="px-4 py-8 text-center text-gray-500"
              >
                {isDeletedMode
                  ? "No hay registros desactivados."
                  : "No hay registros disponibles."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
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

function formatDate(value) {
  if (!value) return "—"

  return new Date(value).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}