import { supabase } from "./supabaseClient"

export async function getActiveRecords(page = 1, pageSize = 50) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from("vista_registros_global")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("Error cargando registros activos:", error)
    throw error
  }

  return {
    records: data || [],
    totalCount: count || 0,
  }
}

export async function getDeletedRecords(page = 1, pageSize = 50) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from("vista_registros_desactivados")
    .select("*", { count: "exact" })
    .order("deleted_at", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("Error cargando registros desactivados:", error)
    throw error
  }

  return {
    records: data || [],
    totalCount: count || 0,
  }
}

export async function getRecords(page = 1, pageSize = 50) {
  return getActiveRecords(page, pageSize)
}

export async function getRecordById(id) {
  const { data, error } = await supabase
    .from("vista_registros_global")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error obteniendo registro:", error)
    throw error
  }

  return data
}

export async function getRecordForEdit(id) {
  const { data: record, error: recordError } = await supabase
    .from("registros")
    .select("*")
    .eq("id", id)
    .single()

  if (recordError) {
    console.error("Error obteniendo registro para edición:", recordError)
    throw recordError
  }

  const { data: artifices, error: artificesError } = await supabase
    .from("registro_artifice")
    .select("artifice_id")
    .eq("registro_id", id)

  if (artificesError) {
    console.error("Error obteniendo artífices del registro:", artificesError)
    throw artificesError
  }

  return {
    ...record,
    artifices_ids: (artifices || []).map((item) => item.artifice_id),
  }
}

export async function createRecord(payload) {
  const { artifices_ids = [], ...recordPayload } = cleanRecordPayload(payload)

  const { data: record, error } = await supabase
    .from("registros")
    .insert(recordPayload)
    .select()
    .single()

  if (error) {
    console.error("Error creando registro:", error)
    throw error
  }

  await replaceRecordArtifices(record.id, artifices_ids)

  return record
}

export async function updateRecord(id, payload) {
  const { artifices_ids = [], ...recordPayload } = cleanRecordPayload(payload)

  const { data: record, error } = await supabase
    .from("registros")
    .update(recordPayload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error actualizando registro:", error)
    throw error
  }

  await replaceRecordArtifices(id, artifices_ids)

  return record
}

export async function deactivateRecord(id) {
  const { data, error } = await supabase
    .from("registros")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error desactivando registro:", error)
    throw error
  }

  return data
}

export async function reactivateRecords(ids) {
  const recordIds = normalizeIds(ids)

  if (recordIds.length === 0) return

  const { error } = await supabase.rpc("reactivar_registros", {
    record_ids: recordIds,
  })

  if (error) {
    console.error("Error reactivando registros:", error)
    throw error
  }
}

export async function deleteRecordsPermanently(ids) {
  const recordIds = normalizeIds(ids)

  if (recordIds.length === 0) return

  const { error } = await supabase.rpc("eliminar_registros_definitivamente", {
    record_ids: recordIds,
  })

  if (error) {
    console.error("Error eliminando registros definitivamente:", error)
    throw error
  }
}

async function replaceRecordArtifices(recordId, artificesIds) {
  const { error: deleteError } = await supabase
    .from("registro_artifice")
    .delete()
    .eq("registro_id", recordId)

  if (deleteError) {
    console.error("Error eliminando relaciones de artífices:", deleteError)
    throw deleteError
  }

  if (!artificesIds || artificesIds.length === 0) {
    return
  }

  const rows = artificesIds.map((artificeId) => ({
    registro_id: Number(recordId),
    artifice_id: Number(artificeId),
  }))

  const { error: insertError } = await supabase
    .from("registro_artifice")
    .insert(rows)

  if (insertError) {
    console.error("Error creando relaciones de artífices:", insertError)
    throw insertError
  }
}

function cleanRecordPayload(payload) {
  return {
    archivo: payload.archivo?.trim() || null,
    seccion_id: toNumberOrNull(payload.seccion_id),
    notario_id: toNumberOrNull(payload.notario_id),
    anio_inicio: toNumberOrNull(payload.anio_inicio),
    anio_fin: toNumberOrNull(payload.anio_fin),
    legajo: payload.legajo?.trim() || null,
    folio_inicio: toNumberOrNull(payload.folio_inicio),
    folio_fin: toNumberOrNull(payload.folio_fin),
    contenido: payload.contenido?.trim() || null,
    tipo_obra_id: toNumberOrNull(payload.tipo_obra_id),
    lugar_id: toNumberOrNull(payload.lugar_id),
    observaciones: payload.observaciones?.trim() || null,
    artifices_ids: payload.artifices_ids || [],
  }
}

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) {
    return null
  }

  return Number(value)
}

function normalizeIds(ids) {
  if (!ids) return []

  if (Array.isArray(ids)) {
    return ids.map(Number).filter(Boolean)
  }

  return [Number(ids)].filter(Boolean)
}