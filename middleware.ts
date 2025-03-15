import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas que requieren autenticación
const protectedRoutes = ["/translator", "/history", "/settings"]

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")
  const { pathname } = request.nextUrl

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Si es una ruta protegida y no hay cookie de sesión, redirigir al login
  if (isProtectedRoute && !sessionCookie) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Si el usuario ya está autenticado e intenta acceder a login/register, redirigir a translator
  if ((pathname === "/login" || pathname === "/register") && sessionCookie) {
    return NextResponse.redirect(new URL("/translator", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

