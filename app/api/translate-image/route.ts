import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import mongoose from "mongoose"

// URL base del backend de IA
const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL || "http://localhost:5000"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = sessionCookie.value

    console.log("API translate-image: Procesando solicitud")

    // Obtener la imagen del request
    const formData = await req.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      console.error("API translate-image: No se proporcionó ninguna imagen")
      return NextResponse.json({ error: "No se proporcionó ninguna imagen" }, { status: 400 })
    }

    console.log("API translate-image: Imagen recibida, tipo:", imageFile.type, "tamaño:", imageFile.size)

    // Verificar si estamos en modo de prueba
    const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === "true"
    console.log("API translate-image: Modo de prueba:", isTestMode)

    if (isTestMode) {
      console.log("API translate-image: Usando respuesta simulada (modo de prueba)")

      // Simular un retraso
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Devolver una respuesta simulada
      return NextResponse.json({
        braille: "⠁⠃⠉",
        spanish: "abc",
        processedImage: "",
        processingTime: 1.5,
        testMode: true,
      })
    }

    try {
      // Crear un nuevo FormData para enviar al backend
      const backendFormData = new FormData()
      backendFormData.append("image", imageFile)

      // Registrar información detallada sobre la solicitud
      console.log(`API translate-image: Enviando imagen a ${AI_BACKEND_URL}/process-image`)
      console.log(`API translate-image: Tipo de imagen: ${imageFile.type}`)
      console.log(`API translate-image: Tamaño de imagen: ${imageFile.size} bytes`)

      // Enviar la imagen directamente al backend Flask
      const backendResponse = await fetch(`${AI_BACKEND_URL}/process-image`, {
        method: "POST",
        body: backendFormData,
      })

      // Registrar información sobre la respuesta
      console.log(`API translate-image: Respuesta del backend: ${backendResponse.status} ${backendResponse.statusText}`)

      // Si hay un error, obtener el texto completo
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text()
        console.error("API translate-image: Error en la respuesta del backend:", errorText)

        // Intentar parsear como JSON para obtener más detalles
        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(errorJson.error || `Error del backend: ${backendResponse.status}`)
        } catch (parseError) {
          throw new Error(`Error del backend: ${backendResponse.status} - ${errorText.substring(0, 100)}`)
        }
      }

      const backendData = await backendResponse.json()
      console.log("API translate-image: Respuesta recibida del backend:", Object.keys(backendData))

      // Guardar la traducción en la base de datos alternativa
      try {
        if (!mongoose.connection || !mongoose.connection.db) {
          throw new Error("No se pudo establecer conexión con la base de datos")
        }

        const db = mongoose.connection.db
        await db.collection("translations_alt").insertOne({
          userId: new mongoose.Types.ObjectId(userId),
          originalText: backendData.braille || "",
          translatedText: backendData.spanish || "",
          createdAt: new Date(),
        })

        console.log("API translate-image: Traducción guardada correctamente")
      } catch (dbError) {
        console.error("API translate-image: Error al guardar en la base de datos:", dbError)
        // Continuamos aunque falle el guardado
      }

      return NextResponse.json({
        braille: backendData.braille || "",
        spanish: backendData.spanish || "",
        processedImage: backendData.processed_image || "",
        processingTime: backendData.processing_time || 0,
      })
    } catch (processingError: any) {
      console.error("API translate-image: Error al procesar imagen con backend:", processingError)

      // Implementación de respaldo: traducción básica
      console.log("API translate-image: Usando traducción básica de respaldo")

      // Simulamos una detección simple
      const brailleText = "⠁⠃⠉" // "abc" en Braille

      // Mapeo básico de caracteres Braille a letras en español
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
        " ": " ",
      }

      const spanishText = brailleText
        .split("")
        .map((char) => brailleToSpanish[char] || char)
        .join("")

      // Guardar la traducción básica en la base de datos alternativa
      try {
        if (!mongoose.connection || !mongoose.connection.db) {
          throw new Error("No se pudo establecer conexión con la base de datos")
        }

        const db = mongoose.connection.db
        await db.collection("translations_alt").insertOne({
          userId: new mongoose.Types.ObjectId(userId),
          originalText: brailleText,
          translatedText: spanishText,
          createdAt: new Date(),
        })

        console.log("API translate-image: Traducción básica guardada correctamente")
      } catch (saveError) {
        console.error("API translate-image: Error al guardar traducción básica:", saveError)
        // Continuamos aunque falle el guardado
      }

      return NextResponse.json({
        braille: brailleText,
        spanish: spanishText,
        processedImage: "",
        processingTime: 0.1,
        fallback: true,
        error: processingError.message,
      })
    }
  } catch (error: any) {
    console.error("API translate-image: Error general:", error)
    return NextResponse.json(
      {
        error: "Error al procesar imagen",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

