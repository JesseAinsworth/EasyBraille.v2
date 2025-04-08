import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// URL base del backend de IA
const AI_BACKEND_URL = process.env.AI_BACKEND_URL || "http://localhost:5000"

/**
 * Proxy para el backend de IA
 * Esta función reenvía las solicitudes al backend de Python y devuelve las respuestas
 */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener la ruta específica del backend desde la URL
    const url = new URL(req.url)
    const path = url.pathname.replace("/api/ai-backend-proxy", "")

    // Obtener el cuerpo de la solicitud
    const contentType = req.headers.get("content-type") || ""
    let body: any

    if (contentType.includes("multipart/form-data")) {
      // Si es un formulario con archivos
      body = await req.formData()
    } else {
      // Si es JSON
      body = await req.json()
    }

    // Reenviar la solicitud al backend de IA
    const response = await fetch(`${AI_BACKEND_URL}${path}`, {
      method: "POST",
      headers: contentType.includes("multipart/form-data") ? undefined : { "Content-Type": "application/json" },
      body: contentType.includes("multipart/form-data") ? body : JSON.stringify(body),
    })

    // Obtener la respuesta del backend
    const data = await response.json()

    // Devolver la respuesta al cliente
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error("Error en el proxy del backend de IA:", error)
    return NextResponse.json(
      {
        error: "Error en el proxy del backend de IA",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  try {
    // Obtener la ruta específica del backend desde la URL
    const url = new URL(req.url)
    const path = url.pathname.replace("/api/ai-backend-proxy", "")

    // Reenviar la solicitud al backend de IA
    const response = await fetch(`${AI_BACKEND_URL}${path}`, {
      method: "GET",
    })

    // Obtener la respuesta del backend
    const data = await response.json()

    // Devolver la respuesta al cliente
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error("Error en el proxy del backend de IA:", error)
    return NextResponse.json(
      {
        error: "Error en el proxy del backend de IA",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

