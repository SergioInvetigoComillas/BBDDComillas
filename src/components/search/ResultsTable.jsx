import { Link } from "react-router-dom"

export default function ResultsTable({ results, loading }) {
  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-gray-50 text-left text-gray-600">
            <th className="px-4 py-3 border-b">Lugar</th>
            <th className="px-4 py-3 border-b">Archivo</th>
            <th className="px-4 py-3 border-b">Sección</th>
            <th className="px-4 py-3 border-b">Año</th>
            <th className="px-4 py-3 border-b">Legajo</th>
            <th className="px-4 py-3 border-b">Folios</th>
            <th className="px-4 py-3 border-b">Artífices</th>
            <th className="px-4 py-3 border-b text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td
                colSpan="8"
                className="px-4 py-8 text-center text-gray-500"
              >
                Cargando resultados...
              </td>
            </tr>
          )}

          {!loading &&
            results.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 border-b">
                  {item.lugar || "—"}
                </td>

                <td className="px-4 py-3 border-b font-medium text-gray-800">
                  {item.archivo || "—"}
                </td>

                <td className="px-4 py-3 border-b">
                  {item.seccion || "—"}
                </td>

                <td className="px-4 py-3 border-b">
                  {formatYears(item.anio_inicio, item.anio_fin)}
                </td>

                <td className="px-4 py-3 border-b">
                  {item.legajo || "—"}
                </td>

                <td className="px-4 py-3 border-b">
                  {formatFolios(item.folio_inicio, item.folio_fin)}
                </td>

                <td className="px-4 py-3 border-b">
                  {item.artifices || "—"}
                </td>

                <td className="px-4 py-3 border-b text-right">
                  <Link
                    to={`/registros/${item.id}`}
                    className="text-yellow-700 hover:text-yellow-800 font-medium"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}

          {!loading && results.length === 0 && (
            <tr>
              <td
                colSpan="8"
                className="px-4 py-8 text-center text-gray-500"
              >
                No se encontraron resultados.
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

function formatFolios(folioInicio, folioFin) {
  if (!folioInicio && !folioFin) return "—"

  if (folioFin && folioFin !== folioInicio) {
    return `${folioInicio} - ${folioFin}`
  }

  return folioInicio
}