import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Obtener el almacén de cookies
    const almacenCookies = await cookies()

    // Eliminar la cookie de sesión
    almacenCookies.delete("session")
    // Eliminar la cookie de rol
    almacenCookies.delete("userRole")

    return NextResponse.json({ mensaje: "Sesión cerrada exitosamente" })
  } catch (error: any) {
    console.error("Error al cerrar sesión:", error)
    return NextResponse.json(
      { error: "Error al cerrar sesión", message: error.message || "Error desconocido" },
      { status: 500 },
    )
  }
}

