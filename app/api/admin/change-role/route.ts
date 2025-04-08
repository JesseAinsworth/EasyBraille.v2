import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")
    const roleCookie = cookieStore.get("user_role")

    if (!sessionCookie || !roleCookie || roleCookie.value !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { userId, role } = await req.json()

    if (!userId || !["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    // Verificar que el usuario existe
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Actualizar el rol del usuario
    user.role = role
    await user.save()

    return NextResponse.json({ message: "Rol actualizado exitosamente" })
  } catch (error: any) {
    console.error("Error al cambiar rol:", error)
    return NextResponse.json(
      {
        error: "Error al cambiar rol",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

