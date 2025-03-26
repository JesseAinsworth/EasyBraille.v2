import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAIInteraction, getAIInteractionsByUserId } from "@/lib/db-utils"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = sessionCookie.value
    const { inputText, expectedOutput, manualCorrection, accuracy } = await req.json()

    const interaction = await createAIInteraction({
      userId,
      inputText,
      expectedOutput,
      manualCorrection,
      accuracy,
    })

    return NextResponse.json({
      message: "Feedback guardado exitosamente",
      interaction,
    })
  } catch (error: any) {
    console.error("Error al guardar feedback de IA:", error)
    return NextResponse.json(
      {
        error: "Error al guardar feedback de IA",
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
    const interactions = await getAIInteractionsByUserId(userId)

    return NextResponse.json(interactions)
  } catch (error: any) {
    console.error("Error al obtener interacciones con IA:", error)
    return NextResponse.json(
      {
        error: "Error al obtener interacciones con IA",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

