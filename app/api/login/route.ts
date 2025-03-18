import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    await dbConnect()

    const { identifier, password } = await req.json()

    // Validar que se proporcionaron credenciales
    if (!identifier || !password) {
      return NextResponse.json(
        {
          message: "El usuario/correo y la contraseña son obligatorios",
        },
        { status: 400 },
      )
    }

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    })

    // Verificar si el usuario existe y la contraseña es correcta
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        {
          message: "Credenciales inválidas",
        },
        { status: 401 },
      )
    }

    // Si llegamos aquí, las credenciales son válidas
    // Establecer la cookie de sesión con el ID del usuario
    const cookieStore = await cookies()
    cookieStore.set("session", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    })

    return NextResponse.json({
      message: "Inicio de sesión exitoso",
      user: {
        username: user.username,
        email: user.email,
      },
    })
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

