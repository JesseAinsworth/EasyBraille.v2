import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    await dbConnect()

    const { username, email, password, role = "user" } = await req.json()

    // Validación básica
    if (!username || !email || !password) {
      return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 })
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

    // Crear el usuario con el rol especificado (por defecto 'user')
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user", // Asegurar que solo se asignen roles válidos
    })

    await user.save()

    return NextResponse.json({ message: "Usuario registrado exitosamente" })
  } catch (error: any) {
    console.error("Error al registrar usuario:", error)
    return NextResponse.json(
      {
        message: "Error al registrar usuario",
        error: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

