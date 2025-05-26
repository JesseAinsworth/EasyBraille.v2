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

    // Try to validate with database first
    try {
      const user = await validateUser(email, password)

      if (user) {
        // Generate JWT token
        const token = sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

        // Configure cookie with token
        const response = NextResponse.json({ user, token })
        response.cookies.set({
          name: "token",
          value: token,
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        })

        return response
      }
    } catch (dbError) {
      console.error("Database validation error:", dbError)
      // Continue to fallback authentication if database fails
    }

    // Fallback authentication for demo
    let user = null

    if (email === "admin@example.com" && password === "admin123") {
      user = {
        _id: "1",
        name: "Administrador",
        email: "admin@example.com",
        role: "admin",
      }
    } else if (email === "user@example.com" && password === "user123") {
      user = {
        _id: "2",
        name: "Usuario",
        email: "user@example.com",
        role: "user",
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generate JWT token
    const token = sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    // Configure cookie with token
    const response = NextResponse.json({ user, token })
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ error: error.message || "Error al iniciar sesión" }, { status: 500 })
  }
}
