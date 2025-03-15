import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    await dbConnect()

    const { identifier, password } = await req.json()

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    })

    if (user && (await bcrypt.compare(password, user.password))) {
      // Establecer la cookie de sesión con el ID del usuario
      const cookieStore = await cookies()
      cookieStore.set("session", user._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        path: "/",
      })

      return NextResponse.json({ message: "Inicio de sesión exitoso" })
    } else {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 })
    }
  } catch (error: any) {
    console.error("Error al iniciar sesión:", error)
    return NextResponse.json(
      {
        message: "Error al iniciar sesión",
        error: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

