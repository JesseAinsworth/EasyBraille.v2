import { type NextRequest, NextResponse } from "next/server"
import { saveTranslation, getUserTranslations, deleteAllUserTranslations } from "@/services/translationService"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { inputText, outputText, direction } = body

    if (!inputText || !outputText || !direction) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const translation = await saveTranslation({
      userId: session.user.id,
      inputText,
      outputText,
      direction,
      timestamp: new Date(),
    })

    return NextResponse.json(translation, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al guardar traducción" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const translations = await getUserTranslations(session.user.id)

    return NextResponse.json(translations)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al obtener traducciones" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const deletedCount = await deleteAllUserTranslations(session.user.id)

    return NextResponse.json({ deletedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al eliminar traducciones" }, { status: 500 })
  }
}
