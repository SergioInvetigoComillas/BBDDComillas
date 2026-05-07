import Button from "./Button"

export default function Pagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
}) {
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1)

  const canGoPrevious = page > 1
  const canGoNext = page < totalPages

  const firstItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const lastItem = Math.min(page * pageSize, totalCount)

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-white">
      <p className="text-sm text-gray-600">
        Mostrando {firstItem} - {lastItem} de {totalCount} registros
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>

        <span className="text-sm text-gray-600">
          Página {page} de {totalPages}
        </span>

        <Button
          variant="secondary"
          disabled={!canGoNext}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}