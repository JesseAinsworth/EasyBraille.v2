"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"

interface AIFeedbackFormProps {
  originalText: string
  translatedText: string
  onFeedbackSubmitted?: () => void
}

export default function AIFeedbackForm({ originalText, translatedText, onFeedbackSubmitted }: AIFeedbackFormProps) {
  const [manualCorrection, setManualCorrection] = useState(translatedText)
  const [accuracy, setAccuracy] = useState(100)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ text: "", type: "" })

    try {
      const response = await fetch("/api/ai-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputText: originalText,
          expectedOutput: translatedText,
          manualCorrection,
          accuracy,
        }),
      })

      if (response.ok) {
        setMessage({ text: "¡Gracias por tu feedback!", type: "success" })
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted()
        }
      } else {
        const data = await response.json()
        setMessage({ text: data.message || "Error al enviar feedback", type: "error" })
      }
    } catch (error) {
      console.error("Error al enviar feedback:", error)
      setMessage({ text: "Error al conectar con el servidor", type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Ayúdanos a mejorar</h3>

      {message.text && (
        <div
          className={`p-3 mb-4 rounded-md ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="manualCorrection" className="block text-sm font-medium text-gray-700">
            Corrección manual (si es necesario)
          </label>
          <textarea
            id="manualCorrection"
            value={manualCorrection}
            onChange={(e) => setManualCorrection(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-skyblue focus:ring focus:ring-skyblue focus:ring-opacity-50"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="accuracy" className="block text-sm font-medium text-gray-700">
            Precisión de la traducción: {accuracy}%
          </label>
          <input
            type="range"
            id="accuracy"
            min="0"
            max="100"
            value={accuracy}
            onChange={(e) => setAccuracy(Number.parseInt(e.target.value))}
            className="mt-1 block w-full"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-skyblue hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skyblue transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar feedback"
          )}
        </button>
      </form>
    </div>
  )
}

