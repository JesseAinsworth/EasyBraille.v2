import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()
    const userId = sessionCookie.value // Asumiendo que el valor de la cookie es el userId

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar la contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return NextResponse.json({ message: "Contraseña actual incorrecta" }, { status: 400 })
    }

    // Hashear y guardar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()

    return NextResponse.json({ message: "Contraseña actualizada exitosamente" })
  } catch (error: any) {
    console.error("Error al cambiar la contraseña:", error)
    return NextResponse.json(
      {
        error: "Error al cambiar la contraseña",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

