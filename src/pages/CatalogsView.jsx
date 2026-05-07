import { useEffect, useState } from "react"

import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Pagination from "../components/ui/Pagination"

import {
  CATALOG_TABLES,
  createCatalogItem,
  deleteCatalogItem,
  getCatalogPage,
  toggleCatalogItemActive,
  updateCatalogItem,
} from "../services/catalogService"

const PAGE_SIZE = 50

const catalogDefinitions = {
  notarios: {
    title: "Notarios",
    description: "Personas que formalizan o validan documentos.",
    tableName: CATALOG_TABLES.notarios,
  },
  artifices: {
    title: "Artífices",
    description: "Personas vinculadas a la actividad u obra.",
    tableName: CATALOG_TABLES.artifices,
  },
  lugares: {
    title: "Lugares",
    description: "Localizaciones geográficas relacionadas con los registros.",
    tableName: CATALOG_TABLES.lugares,
  },
}

export default function CatalogsView() {
  const [activeCatalog, setActiveCatalog] = useState("notarios")
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [searchText, setSearchText] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")

  const [newName, setNewName] = useState("")
  const [newObservations, setNewObservations] = useState("")

  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")
  const [editObservations, setEditObservations] = useState("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workingId, setWorkingId] = useState(null)
  const [error, setError] = useState("")

  const currentDefinition = catalogDefinitions[activeCatalog]

  const loadCatalog = async ({
    catalogKey = activeCatalog,
    targetPage = page,
    search = appliedSearch,
  } = {}) => {
    try {
      setLoading(true)
      setError("")

      const definition = catalogDefinitions[catalogKey]

      const result = await getCatalogPage({
        tableName: definition.tableName,
        page: targetPage,
        pageSize: PAGE_SIZE,
        search,
      })

      setItems(result.items)
      setTotalCount(result.totalCount)
    } catch (err) {
      console.error(err)
      setError("No se pudo cargar el catálogo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCatalog({
      catalogKey: activeCatalog,
      targetPage: page,
      search: appliedSearch,
    })
  }, [activeCatalog, page, appliedSearch])

  const handleTabChange = (key) => {
    setActiveCatalog(key)
    setPage(1)
    setSearchText("")
    setAppliedSearch("")
    resetCreateForm()
    resetEditForm()
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setAppliedSearch(searchText)
  }

  const handleClearSearch = () => {
    setSearchText("")
    setAppliedSearch("")
    setPage(1)
  }

  const handleCreate = async (e) => {
    e.preventDefault()

    if (!newName.trim()) return

    try {
      setSaving(true)
      setError("")

      await createCatalogItem(currentDefinition.tableName, {
        nombre: newName.trim(),
        observaciones: newObservations.trim() || null,
        activo: true,
      })

      resetCreateForm()
      setPage(1)

      await loadCatalog({
        targetPage: 1,
        search: appliedSearch,
      })
    } catch (err) {
      console.error(err)
      setError("No se pudo añadir el elemento al catálogo.")
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditName(item.nombre || "")
    setEditObservations(item.observaciones || "")
  }

  const cancelEdit = () => {
    resetEditForm()
  }

  const saveEdit = async (item) => {
    if (!editName.trim()) return

    try {
      setWorkingId(item.id)
      setError("")

      await updateCatalogItem(currentDefinition.tableName, item.id, {
        nombre: editName.trim(),
        observaciones: editObservations.trim() || null,
      })

      resetEditForm()

      await loadCatalog({
        targetPage: page,
        search: appliedSearch,
      })
    } catch (err) {
      console.error(err)
      setError("No se pudo actualizar el elemento.")
    } finally {
      setWorkingId(null)
    }
  }

  const toggleActive = async (item) => {
    try {
      setWorkingId(item.id)
      setError("")

      await toggleCatalogItemActive(
        currentDefinition.tableName,
        item.id,
        !item.activo
      )

      await loadCatalog({
        targetPage: page,
        search: appliedSearch,
      })
    } catch (err) {
      console.error(err)
      setError("No se pudo cambiar el estado del elemento.")
    } finally {
      setWorkingId(null)
    }
  }

  const handleDelete = async (item) => {
    if (item.activo) return

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar definitivamente “${item.nombre}”? Esta acción no se puede deshacer.`
    )

    if (!confirmed) return

    try {
      setWorkingId(item.id)
      setError("")

      await deleteCatalogItem(currentDefinition.tableName, item.id)

      await loadCatalog({
        targetPage: page,
        search: appliedSearch,
      })
    } catch (err) {
      console.error(err)

      setError(
        "No se pudo eliminar definitivamente. Es posible que este elemento esté usado en uno o varios registros. En ese caso debe permanecer desactivado."
      )
    } finally {
      setWorkingId(null)
    }
  }

  const resetCreateForm = () => {
    setNewName("")
    setNewObservations("")
  }

  const resetEditForm = () => {
    setEditingId(null)
    setEditName("")
    setEditObservations("")
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <section className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          Catálogos
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Gestiona notarios, artífices y lugares utilizados en los registros.
        </p>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 pt-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(catalogDefinitions).map(([key, catalog]) => (
              <button
                key={key}
                type="button"
                disabled={loading || saving}
                onClick={() => handleTabChange(key)}
                className={`px-4 py-2 rounded-t text-sm font-medium transition disabled:opacity-50 ${
                  activeCatalog === key
                    ? "bg-yellow-700 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {catalog.title}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              {currentDefinition.title}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {currentDefinition.description}
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded p-4 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleCreate}
            className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Nombre"
                value={newName}
                disabled={saving}
                onChange={(e) => setNewName(e.target.value)}
              />

              <Input
                placeholder="Observaciones"
                value={newObservations}
                disabled={saving}
                onChange={(e) => setNewObservations(e.target.value)}
              />

              <Button type="submit" disabled={saving} className="md:w-auto">
                {saving ? "Añadiendo..." : "Añadir"}
              </Button>
            </div>
          </form>

          <form
            onSubmit={handleSearch}
            className="mb-4 flex flex-col md:flex-row gap-3"
          >
            <Input
              placeholder={`Buscar en ${currentDefinition.title.toLowerCase()}...`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <Button type="submit">
              Buscar
            </Button>

            {(searchText || appliedSearch) && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleClearSearch}
              >
                Limpiar
              </Button>
            )}
          </form>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-6">
                <p className="text-sm text-gray-600">Cargando catálogo...</p>
              </div>
            ) : (
              <>
                <div className="max-h-[560px] overflow-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-50 text-left text-gray-600">
                        <th className="px-4 py-3 border-b">Nombre</th>
                        <th className="px-4 py-3 border-b">Observaciones</th>
                        <th className="px-4 py-3 border-b">Estado</th>
                        <th className="px-4 py-3 border-b text-right">
                          Acciones
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((item) => {
                        const isEditing = editingId === item.id
                        const isWorking = workingId === item.id

                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 border-b font-medium text-gray-800">
                              {isEditing ? (
                                <Input
                                  value={editName}
                                  disabled={isWorking}
                                  onChange={(e) =>
                                    setEditName(e.target.value)
                                  }
                                />
                              ) : (
                                item.nombre
                              )}
                            </td>

                            <td className="px-4 py-3 border-b text-gray-600">
                              {isEditing ? (
                                <Input
                                  value={editObservations}
                                  disabled={isWorking}
                                  onChange={(e) =>
                                    setEditObservations(e.target.value)
                                  }
                                />
                              ) : (
                                item.observaciones || "—"
                              )}
                            </td>

                            <td className="px-4 py-3 border-b">
                              <span
                                className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                  item.activo
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {item.activo ? "Activo" : "Inactivo"}
                              </span>
                            </td>

                            <td className="px-4 py-3 border-b text-right">
                              {isEditing ? (
                                <div className="flex justify-end gap-3">
                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() => saveEdit(item)}
                                    className="text-yellow-700 hover:text-yellow-800 font-medium disabled:opacity-50"
                                  >
                                    Guardar
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={cancelEdit}
                                    className="text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-3">
                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() => startEdit(item)}
                                    className="text-gray-700 hover:text-gray-900 font-medium disabled:opacity-50"
                                  >
                                    Editar
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() => toggleActive(item)}
                                    className="text-yellow-700 hover:text-yellow-800 font-medium disabled:opacity-50"
                                  >
                                    {item.activo ? "Desactivar" : "Activar"}
                                  </button>

                                  {!item.activo && (
                                    <button
                                      type="button"
                                      disabled={isWorking}
                                      onClick={() => handleDelete(item)}
                                      className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                                    >
                                      Eliminar
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}

                      {items.length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            No hay elementos en este catálogo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  totalCount={totalCount}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}