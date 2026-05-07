import { useEffect, useState } from "react"

import Input from "../ui/Input"
import Select from "../ui/Select"
import Button from "../ui/Button"

import AutocompleteSelect from "../forms/AutocompleteSelect"
import { CATALOG_TABLES } from "../../services/catalogService"

export default function FiltersPanel({
  filters,
  catalogs,
  onApply,
  onClear,
}) {
  const [draftFilters, setDraftFilters] = useState(filters)

  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  const updateFilter = (name, value) => {
    setDraftFilters((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleClear = () => {
    setDraftFilters({
      legajo: "",
      anio_inicio: "",
      anio_fin: "",
      lugar_id: "",
      artifice_id: "",
      notario_id: "",
      seccion_id: "",
      tipo_obra_id: "",
    })

    onClear()
  }

  const secciones = catalogs?.secciones || []
  const tiposObra = catalogs?.tiposObra || []

  return (
    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Input
          placeholder="Legajo"
          value={draftFilters.legajo}
          onChange={(e) => updateFilter("legajo", e.target.value)}
        />

        <Input
          type="number"
          min="0"
          placeholder="Año desde"
          value={draftFilters.anio_inicio}
          onChange={(e) => updateFilter("anio_inicio", e.target.value)}
        />

        <Input
          type="number"
          min="0"
          placeholder="Año hasta"
          value={draftFilters.anio_fin}
          onChange={(e) => updateFilter("anio_fin", e.target.value)}
        />

        <AutocompleteSelect
          tableName={CATALOG_TABLES.lugares}
          value={draftFilters.lugar_id}
          placeholder="Filtrar por lugar..."
          allowCreate={false}
          onChange={(value) => updateFilter("lugar_id", value)}
        />

        <AutocompleteSelect
          tableName={CATALOG_TABLES.artifices}
          value={draftFilters.artifice_id}
          placeholder="Filtrar por artífice..."
          allowCreate={false}
          onChange={(value) => updateFilter("artifice_id", value)}
        />

        <AutocompleteSelect
          tableName={CATALOG_TABLES.notarios}
          value={draftFilters.notario_id}
          placeholder="Filtrar por notario..."
          allowCreate={false}
          onChange={(value) => updateFilter("notario_id", value)}
        />

        <Select
          value={draftFilters.seccion_id}
          onChange={(e) => updateFilter("seccion_id", e.target.value)}
        >
          <option value="">Todas las secciones</option>
          {secciones.map((seccion) => (
            <option key={seccion.id} value={seccion.id}>
              {seccion.nombre}
            </option>
          ))}
        </Select>

        <Select
          value={draftFilters.tipo_obra_id}
          onChange={(e) => updateFilter("tipo_obra_id", e.target.value)}
        >
          <option value="">Todos los tipos de obra</option>
          {tiposObra.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <Button variant="secondary" onClick={handleClear}>
          Limpiar filtros
        </Button>

        <Button type="button" onClick={() => onApply(draftFilters)}>
          Aplicar filtros
        </Button>
      </div>
    </div>
  )
}