import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createOrUpdateEcoKeyboard, getEcoKeyboardByUserId } from "@/lib/db-utils"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = sessionCookie.value
    const { configuration, action } = await req.json()

    const ecoKeyboard = await createOrUpdateEcoKeyboard({
      userId,
      configuration,
      action,
    })

    return NextResponse.json({
      message: "Configuración de teclado ecológico guardada exitosamente",
      ecoKeyboard,
    })
  } catch (error: any) {
    console.error("Error al guardar configuración de teclado ecológico:", error)
    return NextResponse.json(
      {
        error: "Error al guardar configuración de teclado ecológico",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = sessionCookie.value
    const ecoKeyboard = await getEcoKeyboardByUserId(userId)

    if (!ecoKeyboard) {
      // Si no existe, devolver una configuración por defecto
      return NextResponse.json({
        configuration: {
          layout: "standard",
          theme: "light",
          sensitivity: 5,
          customKeys: {},
        },
        history: [],
      })
    }

    return NextResponse.json(ecoKeyboard)
  } catch (error: any) {
    console.error("Error al obtener configuración de teclado ecológico:", error)
    return NextResponse.json(
      {
        error: "Error al obtener configuración de teclado ecológico",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

