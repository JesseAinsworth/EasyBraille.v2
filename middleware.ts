import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import mongoose from "mongoose"

// Rutas que requieren autenticación
const protectedRoutes = ["/translator", "/history", "/settings"]

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")
  const { pathname } = request.nextUrl

  console.log("Middleware ejecutándose para:", pathname)
  console.log("Cookie de sesión:", sessionCookie ? "Presente" : "Ausente")

  // Verificar si la cookie de sesión contiene un ObjectId válido
  if (sessionCookie?.value) {
    const isValidObjectId = mongoose.Types.ObjectId.isValid(sessionCookie.value)
    console.log("¿Es un ObjectId válido?:", isValidObjectId)

    if (!isValidObjectId) {
      console.log("La cookie de sesión no contiene un ObjectId válido")
      // Limpiar la cookie inválida
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("session")
      return response
    }
  }

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Si es una ruta protegida y no hay cookie de sesión o está vacía, redirigir al login
  if (isProtectedRoute && (!sessionCookie || !sessionCookie.value)) {
    console.log("Redirigiendo a login desde ruta protegida")
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Si el usuario ya está autenticado e intenta acceder a login/register, redirigir a translator
  if ((pathname === "/login" || pathname === "/register") && sessionCookie?.value) {
    console.log("Redirigiendo a translator desde login/register")
    return NextResponse.redirect(new URL("/translator", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

