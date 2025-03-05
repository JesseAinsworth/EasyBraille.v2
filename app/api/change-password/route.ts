import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import dbConnect from "../../../lib/mongodb"
import User from "../../../models/User"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { newPassword } = await req.json()
    const userId = sessionCookie.value // Asumiendo que el valor de la cookie es el userId

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await User.findByIdAndUpdate(userId, { password: hashedPassword })

    return NextResponse.json({ message: "Contraseña actualizada exitosamente" })
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error)
    return NextResponse.json({ error: "Error al cambiar la contraseña" }, { status: 500 })
  }
}

