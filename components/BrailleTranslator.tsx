"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ImageCapture from "@/components/ImageCapture"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export default function BrailleTranslator() {
  const [brailleInput, setBrailleInput] = useState("")
  const [spanishOutput, setSpanishOutput] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [showImageCapture, setShowImageCapture] = useState(false)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const router = useRouter()

  const translateBraille = async () => {
    if (!brailleInput.trim()) return

    setIsTranslating(true)

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ braille: brailleInput }),
      })

      if (!response.ok) {
        throw new Error("Error en la traducción")
      }

      const data = await response.json()
      setSpanishOutput(data.spanish)
    } catch (error) {
      console.error("Error al traducir:", error)
      setSpanishOutput("Error al realizar la traducción. Por favor, intenta de nuevo.")
    } finally {
      setIsTranslating(false)
    }
  }

  const handleImageCaptured = async (imageData: string | null) => {
    if (!imageData) return

    setIsTranslating(true)
    setProcessedImage(null)
    setBrailleInput("")
    setSpanishOutput("Procesando imagen...")

    try {
      // Convertir la imagen base64 a un archivo
      const fetchResponse = await fetch(imageData)
      const blob = await fetchResponse.blob()
      const file = new File([blob], "captured_image.jpg", { type: "image/jpeg" })

      // Crear FormData para enviar la imagen
      const formData = new FormData()
      formData.append("image", file)

      // Enviar la imagen al backend para procesamiento
      const response = await fetch("/api/translate-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al procesar la imagen")
      }

      const data = await response.json()

      // Actualizar la interfaz con los resultados
      setBrailleInput(data.braille || "")
      setSpanishOutput(data.spanish || "")

      // Mostrar la imagen procesada si está disponible
      if (data.processedImage) {
        setProcessedImage(`data:image/jpeg;base64,${data.processedImage}`)
      }
    } catch (error) {
      console.error("Error al procesar la imagen:", error)
      setSpanishOutput("Error al procesar la imagen. Por favor, intenta de nuevo.")
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Botones para cambiar entre texto e imagen */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setShowImageCapture(false)}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            !showImageCapture ? "bg-skyblue text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Texto Braille
        </button>
        <button
          onClick={() => setShowImageCapture(true)}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            showImageCapture ? "bg-skyblue text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Imagen
        </button>
      </div>

      {/* Contenido basado en la selección */}
      {!showImageCapture ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="braille-input" className="block text-sm font-medium text-gray-700">
              Texto en Braille
            </label>
            <textarea
              id="braille-input"
              placeholder="Ingrese texto en Braille aquí..."
              value={brailleInput}
              onChange={(e) => setBrailleInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-skyblue focus:border-transparent"
              rows={4}
            />
          </div>

          <button
            onClick={translateBraille}
            disabled={isTranslating || !brailleInput.trim()}
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-skyblue hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skyblue transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isTranslating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traduciendo...
              </>
            ) : (
              "Traducir"
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <ImageCapture onImageCaptured={handleImageCaptured} />

          {/* Mostrar imagen procesada si está disponible */}
          {processedImage && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Imagen procesada:</p>
              <Image
                src={processedImage || "/placeholder.svg"}
                alt="Imagen procesada"
                width={500}
                height={300}
                className="w-full h-auto rounded-md border border-gray-300"
                unoptimized
              />
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="spanish-output" className="block text-sm font-medium text-gray-700">
          Traducción al Español
        </label>
        <textarea
          id="spanish-output"
          placeholder="Traducción al español..."
          value={spanishOutput}
          readOnly
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
          rows={4}
        />
      </div>

      <button
        onClick={() => router.push("/history")}
        className="w-full py-2 px-4 border border-skyblue rounded-md shadow-sm text-skyblue bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skyblue transition-colors"
      >
        Ver Historial
      </button>
    </div>
  )
}

