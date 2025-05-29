import { type NextRequest, NextResponse } from "next/server"
import { sign } from "jsonwebtoken"
import { verifyPassword } from "@/services/userService"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Verificar credenciales en la base de datos
    const user = await verifyPassword(email, password)

    if (!user) {
      // Si no se encuentra en la base de datos, intentar con usuarios de prueba
      let testUser = null

      if (email === "admin@example.com" && password === "admin123") {
        testUser = {
          _id: "1",
          name: "Administrador",
          email: "admin@example.com",
          role: "admin",
        }
      } else if (email === "user@example.com" && password === "user123") {
        testUser = {
          _id: "2",
          name: "Usuario",
          email: "user@example.com",
          role: "user",
        }
      }

      if (testUser) {
        // Generar token JWT para usuario de prueba
        const token = sign({ id: testUser._id, email: testUser.email, role: testUser.role }, JWT_SECRET, {
          expiresIn: "7d",
        })

        const response = NextResponse.json({
          user: {
            id: testUser._id,
            name: testUser.name,
            email: testUser.email,
            role: testUser.role,
          },
          token,
        })

        response.cookies.set({
          name: "token",
          value: token,
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 7, // 7 días
          path: "/",
        })

        return response
      }

      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generar token JWT para usuario de la base de datos
    const token = sign(
      {
        id: user._id!.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    const response = NextResponse.json({
      user: {
        id: user._id!.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      token,
    })

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    })

    return response
  } catch (error: any) {
    console.error("Error en login:", error)
    return NextResponse.json({ error: error.message || "Error al iniciar sesión" }, { status: 500 })
  }
}
