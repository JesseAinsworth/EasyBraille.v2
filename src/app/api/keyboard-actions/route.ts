import { type NextRequest, NextResponse } from "next/server"
import { logKeyboardAction, getRecentKeyboardActions } from "@/services/ecoKeyboardService"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const body = await request.json()
    const { brailleCode, character, actionType, deviceId } = body

    if (!brailleCode || !character || !actionType) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const keyboardAction = await logKeyboardAction({
      userId: userId,
      brailleCode,
      character,
      actionType,
      timestamp: new Date(),
      deviceId,
    })

    return NextResponse.json(keyboardAction, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al registrar acción del teclado" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Solo los administradores pueden ver todas las acciones
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const limit = Number.parseInt(request.nextUrl.searchParams.get("limit") || "100")
    const actions = await getRecentKeyboardActions(limit)

    return NextResponse.json(actions)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al obtener acciones del teclado" }, { status: 500 })
  }
}
