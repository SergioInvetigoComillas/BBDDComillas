import { useEffect, useState } from "react"

import SearchBar from "../components/search/SearchBar"
import FiltersPanel from "../components/search/FiltersPanel"
import ResultsTable from "../components/search/ResultsTable"
import Button from "../components/ui/Button"
import Pagination from "../components/ui/Pagination"

import { searchRecords } from "../services/searchService"
import { getAllCatalogs } from "../services/catalogService"

const PAGE_SIZE = 50

const initialFilters = {
  legajo: "",
  anio_inicio: "",
  anio_fin: "",
  lugar_id: "",
  artifice_id: "",
  notario_id: "",
  seccion_id: "",
  tipo_obra_id: "",
}

export default function SearchView() {
  const [searchText, setSearchText] = useState("")
  const [filters, setFilters] = useState(initialFilters)
  const [showFilters, setShowFilters] = useState(false)

  const [results, setResults] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)

  const [catalogs, setCatalogs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const runSearch = async ({
    text = searchText,
    activeFilters = filters,
    targetPage = page,
  } = {}) => {
    try {
      setLoading(true)
      setError("")

      const data = await searchRecords({
        search: text,
        filters: activeFilters,
        page: targetPage,
        pageSize: PAGE_SIZE,
      })

      setResults(data.records)
      setTotalCount(data.totalCount)
    } catch (err) {
      console.error(err)
      setError("No se pudo realizar la búsqueda.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        setError("")

        const catalogsData = await getAllCatalogs(true)
        setCatalogs(catalogsData)

        const data = await searchRecords({
          search: "",
          filters: initialFilters,
          page: 1,
          pageSize: PAGE_SIZE,
        })

        setResults(data.records)
        setTotalCount(data.totalCount)
      } catch (err) {
        console.error(err)
        setError("No se pudieron cargar los datos iniciales.")
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const handleSearch = (text) => {
    setSearchText(text)
    setPage(1)

    runSearch({
      text,
      activeFilters: filters,
      targetPage: 1,
    })
  }

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters)
    setPage(1)

    runSearch({
      text: searchText,
      activeFilters: newFilters,
      targetPage: 1,
    })
  }

  const clearFilters = () => {
    setFilters(initialFilters)
    setPage(1)

    runSearch({
      text: searchText,
      activeFilters: initialFilters,
      targetPage: 1,
    })
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)

    runSearch({
      text: searchText,
      activeFilters: filters,
      targetPage: newPage,
    })
  }

  return (
    <main className="h-[calc(100vh-4rem)] max-w-7xl mx-auto px-6 py-5 flex flex-col overflow-hidden">
      <section className="mb-4 shrink-0">
        <h1 className="text-2xl font-semibold text-gray-800">
          Buscar en el archivo
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Localiza registros por lugar, archivo, artífice, legajo, tipo de obra, fecha o contenido.
        </p>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg shadow p-5 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="shrink-0">
          <SearchBar onSearch={handleSearch} />

          <div className="mt-3">
            <Button
              variant={showFilters ? "gray" : "warm"}
              onClick={() => setShowFilters((value) => !value)}
            >
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>
          </div>

          {showFilters && (
            <FiltersPanel
              filters={filters}
              catalogs={catalogs}
              onApply={handleApplyFilters}
              onClear={clearFilters}
            />
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded p-4 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-gray-200 pt-4 flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <p className="text-sm text-gray-600">
              {loading ? (
                "Buscando registros..."
              ) : (
                <>
                  {totalCount} resultado{totalCount !== 1 ? "s" : ""}
                  {searchText && <span> para “{searchText}”</span>}
                </>
              )}
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col flex-1 min-h-0">
            <ResultsTable results={results} loading={loading} />

            <div className="shrink-0">
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                totalCount={totalCount}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}