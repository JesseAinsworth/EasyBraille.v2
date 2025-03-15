import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import EcoKeyboard from "@/models/EcoKeyboard"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = sessionCookie.value
    const { configuration, action } = await req.json()

    // Buscar configuración existente o crear una nueva
    let ecoKeyboard = await EcoKeyboard.findOne({ userId })

    if (ecoKeyboard) {
      // Actualizar configuración existente
      if (configuration) {
        ecoKeyboard.configuration = {
          ...ecoKeyboard.configuration,
          ...configuration,
        }
      }

      // Añadir acción al historial si se proporciona
      if (action) {
        ecoKeyboard.history.push({
          action,
          timestamp: new Date(),
        })
      }

      await ecoKeyboard.save()
    } else {
      // Crear nueva configuración
      ecoKeyboard = new EcoKeyboard({
        userId,
        configuration: configuration || {},
        history: action ? [{ action, timestamp: new Date() }] : [],
      })
      await ecoKeyboard.save()
    }

    return NextResponse.json({ message: "Configuración de teclado ecológico guardada exitosamente" })
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
    await dbConnect()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = sessionCookie.value

    const ecoKeyboard = await EcoKeyboard.findOne({ userId })

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

