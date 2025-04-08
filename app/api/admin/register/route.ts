import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

// Código de administrador (en producción, esto debería estar en variables de entorno)
const ADMIN_CODE = "admin123"

export async function POST(req: Request) {
  try {
    await dbConnect()

    const { username, email, password, adminCode } = await req.json()

    // Validación básica
    if (!username || !email || !password || !adminCode) {
      return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Verificar el código de administrador
    if (adminCode !== ADMIN_CODE) {
      return NextResponse.json({ message: "Código de administrador inválido" }, { status: 403 })
    }

    // Validación de formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Formato de correo electrónico inválido" }, { status: 400 })
    }

    // Verificar si el usuario o el correo ya existen
    const existingUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existingUser) {
      return NextResponse.json({ message: "El usuario o correo electrónico ya está en uso" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear el usuario con rol de administrador
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: "admin", // Asignar rol de administrador
    })

    await user.save()

    return NextResponse.json({ message: "Administrador registrado exitosamente" })
  } catch (error: any) {
    console.error("Error al registrar administrador:", error)
    return NextResponse.json(
      {
        message: "Error al registrar administrador",
        error: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

