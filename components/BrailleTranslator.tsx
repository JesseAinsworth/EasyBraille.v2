"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download } from "lucide-react"

export default function BrailleTranslator() {
  const [brailleInput, setBrailleInput] = useState("")
  const [spanishOutput, setSpanishOutput] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
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
      alert("Ocurrió un error al traducir. Por favor, intenta de nuevo.")
    } finally {
      setIsTranslating(false)
    }
  }

  const downloadPDF = async () => {
    if (!brailleInput.trim() || !spanishOutput.trim()) {
      alert("Primero debes realizar una traducción")
      return
    }

    setIsGeneratingPDF(true)
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brailleText: brailleInput,
          spanishText: spanishOutput,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al generar el PDF")
      }

      // Crear un blob a partir de la respuesta
      const blob = await response.blob()

      // Crear una URL para el blob
      const url = window.URL.createObjectURL(blob)

      // Crear un enlace temporal y hacer clic en él para descargar
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = "traduccion-braille.pdf"
      document.body.appendChild(a)
      a.click()

      // Limpiar
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error al descargar PDF:", error)
      alert("Ocurrió un error al generar el PDF. Por favor, intenta de nuevo.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="w-full space-y-6">
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
        className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-skyblue hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skyblue transition-colors disabled:opacity-50"
      >
        {isTranslating ? "Traduciendo..." : "Traducir"}
      </button>

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

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => router.push("/history")}
          className="flex-1 py-2 px-4 border border-skyblue rounded-md shadow-sm text-skyblue bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skyblue transition-colors"
        >
          Ver Historial
        </button>

        <button
          onClick={downloadPDF}
          disabled={isGeneratingPDF || !spanishOutput.trim()}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGeneratingPDF ? "Generando..." : "Descargar PDF"}
        </button>
      </div>
    </div>
  )
}

