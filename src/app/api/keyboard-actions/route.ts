import { type NextRequest, NextResponse } from "next/server"
import { logKeyboardAction, getRecentKeyboardActions } from "@/services/ecoKeyboardService"
import { getUserFromToken } from "@/lib/auth"

const validActions = ["keyPress", "delete", "submit", "other"] as const
type ActionType = typeof validActions[number]

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user || !user._id) {
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { brailleCode, character, actionType, deviceId } = body

    // Validar campos obligatorios
    if (
      typeof brailleCode !== "string" || !brailleCode.trim() ||
      typeof character !== "string" || !character.trim() ||
      typeof actionType !== "string" ||
      !validActions.includes(actionType as ActionType)
    ) {
      return NextResponse.json({ error: "Campos requeridos inválidos o faltantes" }, { status: 400 })
    }

    const keyboardAction = await logKeyboardAction({
      userId: user._id.toString(),
      brailleCode,
      character,
      actionType: actionType as ActionType,
      timestamp: new Date(),
      deviceId,
    })

    return NextResponse.json(keyboardAction, { status: 201 })
  } catch (error: any) {
    console.error("❌ Error al registrar acción del teclado:", error)
    return NextResponse.json({ error: error.message || "Error al registrar acción del teclado" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const limit = Number.parseInt(request.nextUrl.searchParams.get("limit") || "100")
    const actions = await getRecentKeyboardActions(limit)

    return NextResponse.json(actions)
  } catch (error: any) {
    console.error("❌ Error al obtener acciones del teclado:", error)
    return NextResponse.json({ error: error.message || "Error al obtener acciones del teclado" }, { status: 500 })
  }
}
