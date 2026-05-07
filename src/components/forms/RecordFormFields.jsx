import { useEffect, useState } from "react"

import Input from "../ui/Input"
import Select from "../ui/Select"
import Button from "../ui/Button"

import AutocompleteSelect from "./AutocompleteSelect"
import AutocompleteMultiSelect from "./AutocompleteMultiSelect"

import { CATALOG_TABLES } from "../../services/catalogService"

export default function RecordFormFields({
  initialData,
  catalogs,
  onSubmit,
  saving = false,
}) {
  const [formData, setFormData] = useState({
    ...initialData,
    artifices_ids: initialData.artifices_ids || [],
  })

  useEffect(() => {
    setFormData({
      ...initialData,
      artifices_ids: initialData.artifices_ids || [],
    })
  }, [initialData])

  const updateField = (name, value) => {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (
      !formData.archivo ||
      !formData.seccion_id ||
      !formData.legajo ||
      !formData.anio_inicio ||
      !formData.folio_inicio ||
      !formData.lugar_id
    ) {
      alert(
        "Archivo, lugar, sección, año inicio, legajo y folio inicio son obligatorios"
      )
      return
    }

    if (Number(formData.anio_inicio) < 0 || Number(formData.folio_inicio) < 0) {
      alert("Los años y folios no pueden ser negativos")
      return
    }

    if (
      formData.anio_fin !== "" &&
      formData.anio_fin !== null &&
      Number(formData.anio_fin) < 0
    ) {
      alert("El año fin no puede ser negativo")
      return
    }

    if (
      formData.folio_fin !== "" &&
      formData.folio_fin !== null &&
      Number(formData.folio_fin) < 0
    ) {
      alert("El folio fin no puede ser negativo")
      return
    }

    if (
      formData.anio_fin &&
      Number(formData.anio_fin) < Number(formData.anio_inicio)
    ) {
      alert("El año fin no puede ser menor que el año inicio")
      return
    }

    if (
      formData.folio_fin &&
      Number(formData.folio_fin) < Number(formData.folio_inicio)
    ) {
      alert("El folio fin no puede ser menor que el folio inicio")
      return
    }

    onSubmit(formData)
  }

  const secciones = catalogs?.secciones || []
  const tiposObra = catalogs?.tiposObra || []

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Archivo *">
          <Input
            value={formData.archivo || ""}
            disabled={saving}
            onChange={(e) => updateField("archivo", e.target.value)}
          />
        </Field>

        <AutocompleteSelect
          label="Lugar"
          required
          tableName={CATALOG_TABLES.lugares}
          value={formData.lugar_id}
          disabled={saving}
          placeholder="Escribe un lugar..."
          onChange={(value) => updateField("lugar_id", value)}
        />

        <Field label="Sección *">
          <Select
            value={formData.seccion_id || ""}
            disabled={saving}
            onChange={(e) => updateField("seccion_id", e.target.value)}
          >
            <option value="">Seleccionar</option>
            {secciones.map((seccion) => (
              <option key={seccion.id} value={seccion.id}>
                {seccion.nombre}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tipo de obra">
          <Select
            value={formData.tipo_obra_id || ""}
            disabled={saving}
            onChange={(e) => updateField("tipo_obra_id", e.target.value)}
          >
            <option value="">Seleccionar</option>
            {tiposObra.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </Select>
        </Field>

        <AutocompleteSelect
          label="Notario"
          tableName={CATALOG_TABLES.notarios}
          value={formData.notario_id}
          disabled={saving}
          placeholder="Escribe un notario..."
          onChange={(value) => updateField("notario_id", value)}
        />

        <Field label="Legajo *">
          <Input
            value={formData.legajo || ""}
            disabled={saving}
            onChange={(e) => updateField("legajo", e.target.value)}
          />
        </Field>

        <Field label="Año inicio *">
          <Input
            type="number"
            min="0"
            value={formData.anio_inicio || ""}
            disabled={saving}
            onChange={(e) => updateField("anio_inicio", e.target.value)}
          />
        </Field>

        <Field label="Año fin">
          <Input
            type="number"
            min="0"
            value={formData.anio_fin || ""}
            disabled={saving}
            onChange={(e) => updateField("anio_fin", e.target.value)}
          />
        </Field>

        <Field label="Folio inicio *">
          <Input
            type="number"
            min="0"
            value={formData.folio_inicio || ""}
            disabled={saving}
            onChange={(e) => updateField("folio_inicio", e.target.value)}
          />
        </Field>

        <Field label="Folio fin">
          <Input
            type="number"
            min="0"
            value={formData.folio_fin || ""}
            disabled={saving}
            onChange={(e) => updateField("folio_fin", e.target.value)}
          />
        </Field>
      </div>

      <AutocompleteMultiSelect
        label="Artífices"
        tableName={CATALOG_TABLES.artifices}
        value={formData.artifices_ids || []}
        disabled={saving}
        placeholder="Escribe un artífice..."
        onChange={(values) => updateField("artifices_ids", values)}
      />

      <Field label="Contenido">
        <textarea
          value={formData.contenido || ""}
          disabled={saving}
          onChange={(e) => updateField("contenido", e.target.value)}
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </Field>

      <Field label="Observaciones">
        <textarea
          value={formData.observaciones || ""}
          disabled={saving}
          onChange={(e) => updateField("observaciones", e.target.value)}
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </Field>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block mb-1 text-sm font-medium text-gray-700">
        {label}
      </span>
      {children}
    </label>
  )
}