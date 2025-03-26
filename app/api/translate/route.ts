import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import Translation from "@/models/Translation"
import mongoose from "mongoose"

const brailleToSpanish: { [key: string]: string } = {
  "⠁": "a",
  "⠃": "b",
  "⠉": "c",
  "⠙": "d",
  "⠑": "e",
  "⠋": "f",
  "⠛": "g",
  "⠓": "h",
  "⠊": "i",
  "⠚": "j",
  "⠅": "k",
  "⠇": "l",
  "⠍": "m",
  "⠝": "n",
  "⠕": "o",
  "⠏": "p",
  "⠟": "q",
  "⠗": "r",
  "⠎": "s",
  "⠞": "t",
  "⠥": "u",
  "⠧": "v",
  "⠺": "w",
  "⠭": "x",
  "⠽": "y",
  "⠵": "z",
  "⠀": " ",
}

export async function POST(req: Request) {
  try {
    await dbConnect()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = sessionCookie.value
    const { braille } = await req.json()

    // Añadir logs para depuración
    console.log("Datos recibidos:", { userId, braille })

    // Verificar que userId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("userId no es un ObjectId válido:", userId)
      return NextResponse.json({ error: "ID de usuario no válido" }, { status: 400 })
    }

    const spanish = braille
      .split("")
      .map((char: string) => brailleToSpanish[char] || char)
      .join("")

    // Crear el objeto de traducción con todos los campos requeridos
    const translation = new Translation({
      userId,
      originalText: braille,
      translatedText: spanish,
    })

    // Log del objeto antes de guardar
    console.log("Objeto a guardar:", translation)

    try {
      await translation.save()
    } catch (saveError: any) {
      console.error("Error al guardar traducción:", saveError)
      // Mostrar información detallada del error de validación
      if (saveError.name === "ValidationError") {
        const validationErrors = Object.keys(saveError.errors).map((field) => ({
          field,
          message: saveError.errors[field].message,
        }))
        return NextResponse.json(
          {
            error: "Error de validación",
            validationErrors,
          },
          { status: 400 },
        )
      }
      throw saveError
    }

    return NextResponse.json({ spanish })
  } catch (error: any) {
    console.error("Error al traducir:", error)
    return NextResponse.json(
      {
        error: "Error al traducir",
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

    const translations = await Translation.find({ userId }).sort({ createdAt: -1 }).limit(10)

    return NextResponse.json(translations)
  } catch (error: any) {
    console.error("Error al obtener traducciones:", error)
    return NextResponse.json(
      {
        error: "Error al obtener traducciones",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

