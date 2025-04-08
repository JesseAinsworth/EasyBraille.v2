import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas que requieren autenticación
const protectedRoutes = ["/translator", "/history", "/settings"]
// Rutas que requieren autenticación de administrador
const adminRoutes = ["/admin"]
// Rutas de autenticación que deben ser públicas
const authRoutes = ["/login", "/register", "/admin-login"]

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")
  const userRoleCookie = request.cookies.get("userRole")
  const { pathname } = request.nextUrl

  console.log("Middleware ejecutándose para:", pathname)
  console.log("Cookie de sesión:", sessionCookie ? "Presente" : "Ausente")
  console.log("Cookie de rol:", userRoleCookie ? userRoleCookie.value : "Ausente")

  // Si estamos en una ruta de autenticación, permitir el acceso sin redirecciones
  if (authRoutes.some((route) => pathname === route)) {
    console.log("Ruta de autenticación, permitiendo acceso directo")
    return NextResponse.next()
  }

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  // Verificar si la ruta requiere autenticación de administrador
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // Si es una ruta protegida y no hay cookie de sesión o está vacía, redirigir al login
  if (isProtectedRoute && (!sessionCookie || !sessionCookie.value)) {
    console.log("Redirigiendo a login desde ruta protegida")
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Si es una ruta de administrador, verificar que el usuario sea administrador
  if (isAdminRoute) {
    // Si no hay cookie de sesión, redirigir al login de administrador
    if (!sessionCookie || !sessionCookie.value) {
      console.log("Redirigiendo a login de administrador desde ruta de administrador")
      return NextResponse.redirect(new URL("/admin-login", request.url))
    }

    // Si el usuario no es administrador, redirigir al traductor
    if (!userRoleCookie || userRoleCookie.value !== "admin") {
      console.log("Usuario no es administrador, redirigiendo al traductor")
      return NextResponse.redirect(new URL("/translator", request.url))
    }
  }

  // Si el usuario ya está autenticado e intenta acceder a login/register, redirigir a translator
  if ((pathname === "/login" || pathname === "/register") && sessionCookie?.value) {
    // Verificar que el valor de la cookie sea válido (no vacío y con formato correcto)
    const cookieValue = sessionCookie.value
    if (cookieValue && cookieValue.length > 10) {
      // Verificación básica de que parece un ID válido
      console.log("Redirigiendo a translator desde login/register")
      return NextResponse.redirect(new URL("/translator", request.url))
    }
  }

  // Si el usuario ya está autenticado como admin e intenta acceder a admin-login, redirigir a dashboard
  if (pathname === "/admin-login" && sessionCookie?.value && userRoleCookie?.value === "admin") {
    console.log("Redirigiendo a dashboard desde admin-login")
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
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

