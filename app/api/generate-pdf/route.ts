import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/mongodb"
import Translation from "@/models/Translation"
import PDFDocument from "pdfkit"

export async function POST(req: Request) {
  try {
    await dbConnect()
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { translationId } = await req.json()

    // Si se proporciona un ID, buscar esa traducción específica
    let translation
    if (translationId) {
      translation = await Translation.findById(translationId)
      if (!translation) {
        return NextResponse.json({ error: "Traducción no encontrada" }, { status: 404 })
      }
    } else {
      // Si no se proporciona ID, usar los datos del cuerpo de la solicitud
      const { brailleText, spanishText } = await req.json()
      if (!brailleText || !spanishText) {
        return NextResponse.json({ error: "Se requiere texto en braille y español" }, { status: 400 })
      }
      translation = { originalText: brailleText, translatedText: spanishText }
    }

    // Crear un nuevo documento PDF
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: "Traducción de Braille a Español",
        Author: "EasyBraille",
      },
    })

    // Configurar el buffer para almacenar el PDF
    const chunks: Buffer[] = []
    doc.on("data", (chunk) => chunks.push(chunk))

    // Promesa para manejar la finalización del documento
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on("end", () => {
        resolve(Buffer.concat(chunks))
      })
    })

    // Agregar contenido al PDF
    doc.fontSize(20).text("EasyBraille - Traducción", { align: "center" })
    doc.moveDown()
    doc.fontSize(14).text("Texto original (Braille):", { underline: true })
    doc.fontSize(12).text(translation.originalText)
    doc.moveDown()
    doc.fontSize(14).text("Traducción al Español:", { underline: true })
    doc.fontSize(12).text(translation.translatedText)

    // Agregar fecha y hora
    doc.moveDown(2)
    doc.fontSize(10).text(`Generado el: ${new Date().toLocaleString()}`, { align: "right" })

    // Finalizar el documento
    doc.end()

    // Esperar a que se complete la generación del PDF
    const pdfBuffer = await pdfPromise

    // Devolver el PDF como respuesta
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="traduccion-braille.pdf"',
      },
    })
  } catch (error: any) {
    console.error("Error al generar PDF:", error)
    return NextResponse.json(
      {
        error: "Error al generar PDF",
        message: error.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}

