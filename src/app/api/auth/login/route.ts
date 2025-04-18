import { type NextRequest, NextResponse } from "next/server"
import { validateUser } from "@/services/userService"
import { sign } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const user = await validateUser(email, password)

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generar token JWT
    const token = sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    return NextResponse.json({ user, token })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al iniciar sesión" }, { status: 500 })
  }
}
