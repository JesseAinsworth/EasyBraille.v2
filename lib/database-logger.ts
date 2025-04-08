import type { NextRequest } from "next/server"
import DatabaseLog from "@/models/DatabaseLog"
import { cookies } from "next/headers"

export async function logDatabaseAction(
  action: "create" | "update" | "delete" | "read",
  collectionName: string, // Cambiado de 'collection' a 'collectionName'
  documentId: string | null,
  details: any = {},
  req?: NextRequest,
) {
  try {
    // Obtener el ID de usuario de la cookie de sesión
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")
    const userId = sessionCookie?.value || null

    // Obtener la dirección IP si está disponible
    const ipAddress = req?.ip || req?.headers.get("x-forwarded-for") || "unknown"

    // Crear el registro de log
    const log = new DatabaseLog({
      action,
      collectionName, // Cambiado de 'collection' a 'collectionName'
      documentId,
      userId,
      details,
      ipAddress,
      timestamp: new Date(),
    })

    await log.save()
    console.log(`Log guardado: ${action} en ${collectionName}`)
    return true
  } catch (error) {
    console.error("Error al guardar log de base de datos:", error)
    return false
  }
}

