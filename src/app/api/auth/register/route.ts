import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/services/userService"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const user = await createUser({
      name,
      email,
      password,
      role: "user",
    })

    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al registrar usuario" }, { status: 500 })
  }
}
