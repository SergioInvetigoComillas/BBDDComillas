import { supabase } from "./supabaseClient"

export async function searchRecords({
  search = "",
  filters = {},
  page = 1,
  pageSize = 50,
} = {}) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safePageSize = Math.min(Math.max(Number(pageSize) || 50, 1), 100)

  const rpcParams = {
    search: search?.trim() || null,
    artifice_id: toNumberOrNull(filters.artifice_id),
    notario_id: toNumberOrNull(filters.notario_id),
    lugar_id: toNumberOrNull(filters.lugar_id),
    seccion_id: toNumberOrNull(filters.seccion_id),
    tipo_obra_id: toNumberOrNull(filters.tipo_obra_id),
    legajo: filters.legajo?.trim() || null,
    anio_inicio: toNumberOrNull(filters.anio_inicio),
    anio_fin: toNumberOrNull(filters.anio_fin),
    page_size: safePageSize,
    page_offset: (safePage - 1) * safePageSize,
  }

  const { data: matches, error: searchError } = await supabase
    .rpc("buscar_registros", rpcParams)

  if (searchError) {
    console.error("Error buscando registros:", searchError)
    throw searchError
  }

  if (!matches || matches.length === 0) {
    return {
      records: [],
      totalCount: 0,
    }
  }

  const ids = matches.map((item) => item.id)
  const scoresById = new Map(matches.map((item) => [item.id, item.score]))
  const totalCount = Number(matches[0]?.total_count || 0)

  const { data: records, error: recordsError } = await supabase
    .from("vista_registros_global")
    .select("*")
    .in("id", ids)

  if (recordsError) {
    console.error("Error cargando resultados completos:", recordsError)
    throw recordsError
  }

  const orderedRecords = (records || [])
    .map((record) => ({
      ...record,
      score: scoresById.get(record.id) || 0,
    }))
    .sort((a, b) => b.score - a.score)

  return {
    records: orderedRecords,
    totalCount,
  }
}

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) {
    return null
  }

  return Number(value)
}