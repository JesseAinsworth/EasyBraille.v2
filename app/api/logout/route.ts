import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Obtener el almacén de cookies
    const almacenCookies = await cookies()

    // Eliminar la cookie de sesión
    almacenCookies.delete("session")

    return NextResponse.json({ mensaje: "Sesión cerrada exitosamente" })
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 })
  }
}

