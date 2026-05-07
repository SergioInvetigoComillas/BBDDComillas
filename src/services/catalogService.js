import { supabase } from "./supabaseClient"

export const CATALOG_TABLES = {
  secciones: "secciones",
  tiposObra: "tipos_obra",
  notarios: "notarios",
  artifices: "artifices",
  lugares: "lugares",
}

export async function getCatalog(tableName, onlyActive = false) {
  let query = supabase
    .from(tableName)
    .select("*")
    .order("nombre", { ascending: true })

  if (onlyActive) {
    query = query.eq("activo", true)
  }

  const { data, error } = await query

  if (error) {
    console.error(`Error cargando catálogo ${tableName}:`, error)
    throw error
  }

  return data || []
}

export async function getCatalogPage({
  tableName,
  page = 1,
  pageSize = 50,
  search = "",
} = {}) {
  const safePage = Math.max(Number(page) || 1, 1)
  const safePageSize = Math.min(Math.max(Number(pageSize) || 50, 1), 100)

  const from = (safePage - 1) * safePageSize
  const to = from + safePageSize - 1

  let query = supabase
    .from(tableName)
    .select("*", { count: "exact" })

  const searchText = search?.trim()

  if (searchText) {
    query = query.or(
      `nombre.ilike.%${searchText}%,observaciones.ilike.%${searchText}%`
    )
  }

  const { data, error, count } = await query
    .order("id", { ascending: false })
    .range(from, to)

  if (error) {
    console.error(`Error cargando página del catálogo ${tableName}:`, error)
    throw error
  }

  return {
    items: data || [],
    totalCount: count || 0,
  }
}

export async function getAllCatalogs(onlyActive = true) {
  const [
    secciones,
    tiposObra,
    notarios,
    artifices,
    lugares,
  ] = await Promise.all([
    getCatalog(CATALOG_TABLES.secciones, onlyActive),
    getCatalog(CATALOG_TABLES.tiposObra, onlyActive),
    getCatalog(CATALOG_TABLES.notarios, onlyActive),
    getCatalog(CATALOG_TABLES.artifices, onlyActive),
    getCatalog(CATALOG_TABLES.lugares, onlyActive),
  ])

  return {
    secciones,
    tiposObra,
    notarios,
    artifices,
    lugares,
  }
}

export async function getCatalogItemById(tableName, id) {
  if (!id) return null

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error obteniendo elemento de ${tableName}:`, error)
    throw error
  }

  return data
}

export async function getCatalogItemsByIds(tableName, ids = []) {
  if (!ids || ids.length === 0) return []

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .in("id", ids)
    .order("nombre", { ascending: true })

  if (error) {
    console.error(`Error obteniendo elementos de ${tableName}:`, error)
    throw error
  }

  return data || []
}

export async function searchCatalogItems(tableName, text, limit = 10) {
  const searchText = text?.trim()

  if (!searchText) {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("activo", true)
      .order("nombre", { ascending: true })
      .limit(limit)

    if (error) {
      console.error(`Error buscando en ${tableName}:`, error)
      throw error
    }

    return data || []
  }

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("activo", true)
    .or(`nombre.ilike.%${searchText}%,observaciones.ilike.%${searchText}%`)
    .order("nombre", { ascending: true })
    .limit(limit)

  if (error) {
    console.error(`Error buscando en ${tableName}:`, error)
    throw error
  }

  return data || []
}

export async function createCatalogItem(tableName, payload) {
  const { data, error } = await supabase
    .from(tableName)
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error(`Error creando elemento en ${tableName}:`, error)
    throw error
  }

  return data
}

export async function updateCatalogItem(tableName, id, payload) {
  const { data, error } = await supabase
    .from(tableName)
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error actualizando elemento en ${tableName}:`, error)
    throw error
  }

  return data
}

export async function toggleCatalogItemActive(tableName, id, activo) {
  return updateCatalogItem(tableName, id, { activo })
}

export async function deleteCatalogItem(tableName, id) {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", id)

  if (error) {
    console.error(`Error eliminando elemento de ${tableName}:`, error)
    throw error
  }
}