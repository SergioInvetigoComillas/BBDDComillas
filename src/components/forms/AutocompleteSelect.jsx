import { useEffect, useRef, useState } from "react"

import {
  createCatalogItem,
  getCatalogItemById,
  searchCatalogItems,
} from "../../services/catalogService"

export default function AutocompleteSelect({
  label,
  tableName,
  value,
  onChange,
  placeholder = "Buscar...",
  disabled = false,
  required = false,
  allowCreate = true,
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const blurTimeoutRef = useRef(null)

  useEffect(() => {
    async function loadSelectedItem() {
      if (!value) {
        setSelectedItem(null)
        setQuery("")
        return
      }

      try {
        const item = await getCatalogItemById(tableName, value)
        setSelectedItem(item)
        setQuery(item?.nombre || "")
      } catch (err) {
        console.error(err)
      }
    }

    loadSelectedItem()
  }, [value, tableName])

  useEffect(() => {
    if (!open) return

    const timeout = setTimeout(async () => {
      try {
        setLoading(true)
        setError("")

        const data = await searchCatalogItems(tableName, query, 10)
        setResults(data)
      } catch (err) {
        console.error(err)
        setError("No se pudieron cargar coincidencias.")
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timeout)
  }, [query, open, tableName])

  const handleSelect = (item) => {
    setSelectedItem(item)
    setQuery(item.nombre)
    onChange(item.id)
    setOpen(false)
  }

  const handleCreate = async () => {
    const nombre = query.trim()

    if (!nombre) return

    try {
      setCreating(true)
      setError("")

      const newItem = await createCatalogItem(tableName, {
        nombre,
        activo: true,
      })

      handleSelect(newItem)
    } catch (err) {
      console.error(err)
      setError("No se pudo crear el elemento.")
    } finally {
      setCreating(false)
    }
  }

  const handleClear = () => {
    setSelectedItem(null)
    setQuery("")
    onChange("")
    setResults([])
    setOpen(false)
  }

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setOpen(false)

      if (selectedItem) {
        setQuery(selectedItem.nombre)
      }
    }, 150)
  }

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }

    setOpen(true)
  }

  const exactMatch = results.some(
    (item) => item.nombre.toLowerCase() === query.trim().toLowerCase()
  )

  return (
    <div className="relative">
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
          {required && <span> *</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedItem(null)
            onChange("")
            setOpen(true)
          }}
          className="
            w-full px-4 py-2 pr-10
            border border-gray-300 rounded
            text-sm text-gray-800 bg-white
            focus:outline-none focus:ring-2 focus:ring-yellow-700
            disabled:bg-gray-100 disabled:cursor-not-allowed
          "
        />

        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        )}
      </div>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-64 overflow-y-auto">
          {loading && (
            <p className="px-4 py-3 text-sm text-gray-500">
              Buscando coincidencias...
            </p>
          )}

          {!loading && results.map((item) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-yellow-50"
            >
              <span className="font-medium text-gray-800">
                {item.nombre}
              </span>

              {item.observaciones && (
                <span className="block text-xs text-gray-500 truncate">
                  {item.observaciones}
                </span>
              )}
            </button>
          ))}

          {!loading && query.trim() && allowCreate && !exactMatch && (
            <button
              type="button"
              disabled={creating}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCreate}
              className="w-full text-left px-4 py-2 text-sm text-yellow-800 hover:bg-yellow-50 border-t border-gray-100 disabled:opacity-50"
            >
              {creating ? "Creando..." : `+ Crear “${query.trim()}”`}
            </button>
          )}

          {!loading && !query.trim() && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-500">
              Escribe para buscar.
            </p>
          )}

          {!loading && query.trim() && results.length === 0 && !allowCreate && (
            <p className="px-4 py-3 text-sm text-gray-500">
              No hay coincidencias.
            </p>
          )}

          {error && (
            <p className="px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}