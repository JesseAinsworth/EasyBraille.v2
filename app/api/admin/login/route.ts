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

    // Verificar si el usuario existe
    if (!user) {
      return NextResponse.json(
        {
          message: "Credenciales inválidas",
        },
        { status: 401 },
      )
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          message: "Contraseña incorrecta",
        },
        { status: 401 },
      )
    }

    // Verificar si es administrador
    if (user.role !== "admin") {
      return NextResponse.json(
        {
          message: "No tienes permisos de administrador",
        },
        { status: 403 },
      )
    }

    // Si llegamos aquí, las credenciales son válidas y el usuario es administrador
    const cookieStore = await cookies()

    // Limpiar cualquier cookie de sesión existente primero
    cookieStore.delete("session")
    cookieStore.delete("userRole")

    // Establecer la nueva cookie de sesión
    cookieStore.set("session", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    })

    // También establecer una cookie para el rol del usuario
    cookieStore.set("userRole", "admin", {
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
        role: "admin",
      },
    })
  } catch (error: any) {
    console.error("Error al iniciar sesión como administrador:", error)
    return NextResponse.json(
      {
        message: "Error al iniciar sesión",
        error: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}
