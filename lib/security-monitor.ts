import DatabaseLog from "@/models/DatabaseLog"

export async function createSecurityAlert(
  type: string,
  severity: string,
  message: string,
  details: any = {},
  ipAddress: string,
  userId?: string,
) {
  try {
    const log = new DatabaseLog({
      action: "security_alert",
      collectionName: "security_alerts", // Cambiado de 'collection' a 'collectionName'
      documentId: userId ? userId : null,
      userId: userId || null,
      details: {
        type,
        severity,
        message,
        details,
      },
      ipAddress,
      timestamp: new Date(),
    })

    await log.save()
    console.log(`Alerta de seguridad guardada: ${type} - ${severity}`)
    return true
  } catch (error) {
    console.error("Error al guardar alerta de seguridad:", error)
    return false
  }
}

// Función para monitorear intentos de inicio de sesión fallidos
export function monitorFailedLogin(identifier: string, ipAddress: string) {
  // Implementación existente...
  console.log(`Monitoreando inicio de sesión fallido para: ${identifier} desde ${ipAddress}`)
}

// Función para detectar accesos no autorizados
export function checkAuthorization(req: Request, requiredRole = "user") {
  // Implementación existente...
  console.log(`Verificando autorización para rol: ${requiredRole}`)
  return false
}

