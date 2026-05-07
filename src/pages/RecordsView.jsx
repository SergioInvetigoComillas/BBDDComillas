import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import Button from "../components/ui/Button"
import Pagination from "../components/ui/Pagination"
import RecordTable from "../components/records/RecordTable"

import {
  deleteRecordsPermanently,
  getActiveRecords,
  getDeletedRecords,
  reactivateRecords,
} from "../services/recordsService"

const PAGE_SIZE = 50

export default function RecordsView() {
  const [activeTab, setActiveTab] = useState("active")
  const [records, setRecords] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState("")

  const isDeletedTab = activeTab === "deleted"

  const loadRecords = async ({
    tab = activeTab,
    targetPage = page,
  } = {}) => {
    try {
      setLoading(true)
      setError("")

      const result =
        tab === "deleted"
          ? await getDeletedRecords(targetPage, PAGE_SIZE)
          : await getActiveRecords(targetPage, PAGE_SIZE)

      setRecords(result.records)
      setTotalCount(result.totalCount)
    } catch (err) {
      console.error(err)
      setError("No se pudieron cargar los registros.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords({
      tab: activeTab,
      targetPage: page,
    })
  }, [activeTab, page])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setPage(1)
    setSelectedIds([])
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    setSelectedIds([])
  }

  const refreshCurrentPage = async () => {
    setSelectedIds([])
    await loadRecords({
      tab: activeTab,
      targetPage: page,
    })
  }

  const handleReactivateSelected = async () => {
    if (selectedIds.length === 0) return

    const confirmed = window.confirm(
      `¿Seguro que quieres reactivar ${selectedIds.length} registro(s)?`
    )

    if (!confirmed) return

    try {
      setWorking(true)
      await reactivateRecords(selectedIds)
      await refreshCurrentPage()
    } catch (err) {
      console.error(err)
      alert("No se pudieron reactivar los registros seleccionados.")
    } finally {
      setWorking(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar definitivamente ${selectedIds.length} registro(s)? Esta acción no se puede deshacer.`
    )

    if (!confirmed) return

    try {
      setWorking(true)
      await deleteRecordsPermanently(selectedIds)
      await refreshCurrentPage()
    } catch (err) {
      console.error(err)
      alert("No se pudieron eliminar definitivamente los registros seleccionados.")
    } finally {
      setWorking(false)
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <section className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Registros
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Gestiona los registros del archivo histórico: alta, edición, desactivación y recuperación.
          </p>
        </div>

        {!isDeletedTab && (
          <Link to="/registros/nuevo">
            <Button>
              + Nuevo registro
            </Button>
          </Link>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 pt-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleTabChange("active")}
              className={`px-4 py-2 rounded-t text-sm font-medium transition ${
                activeTab === "active"
                  ? "bg-yellow-700 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Activos
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("deleted")}
              className={`px-4 py-2 rounded-t text-sm font-medium transition ${
                activeTab === "deleted"
                  ? "bg-yellow-700 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Desactivados
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded p-4 text-sm">
              {error}
            </div>
          )}

          {isDeletedTab && (
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                {selectedIds.length} registro{selectedIds.length !== 1 ? "s" : ""} seleccionado{selectedIds.length !== 1 ? "s" : ""}
              </p>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  disabled={selectedIds.length === 0 || working}
                  onClick={handleReactivateSelected}
                >
                  Reactivar seleccionados
                </Button>

                <Button
                  variant="danger"
                  disabled={selectedIds.length === 0 || working}
                  onClick={handleDeleteSelected}
                >
                  Eliminar definitivamente
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <p className="text-sm text-gray-600">Cargando registros...</p>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <RecordTable
                records={records}
                mode={activeTab}
                selectedIds={selectedIds}
                onSelectedIdsChange={setSelectedIds}
                onRecordChanged={refreshCurrentPage}
              />

              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                totalCount={totalCount}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  )
}