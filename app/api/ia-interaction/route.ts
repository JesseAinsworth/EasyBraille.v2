import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import AIInteraction from "@/models/AIInteraction"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = sessionCookie.value
    const { inputText, expectedOutput, manualCorrection, accuracy } = await req.json()

    const aiInteraction = new AIInteraction({
      userId,
      inputText,
      expectedOutput,
      manualCorrection,
      accuracy,
    })
    await aiInteraction.save()

    return NextResponse.json({ message: "Interacción con IA guardada exitosamente" })
  } catch (error: any) {
    console.error("Error al guardar interacción con IA:", error)
    return NextResponse.json(
      {
        error: "Error al guardar interacción con IA",
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

    const aiInteractions = await AIInteraction.find({ userId }).sort({ createdAt: -1 }).limit(10)

    return NextResponse.json(aiInteractions)
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

