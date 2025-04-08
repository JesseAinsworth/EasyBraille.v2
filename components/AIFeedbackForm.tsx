"use client"

import type React from "react"
import { useState } from "react"
import { Loader2, ThumbsUp, ThumbsDown, Edit } from "lucide-react"
import { sendAIFeedback } from "@/lib/ai-service"

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
  const [showCorrection, setShowCorrection] = useState(false)
  const [feedbackType, setFeedbackType] = useState<"positive" | "negative" | null>(null)

  const handleQuickFeedback = async (type: "positive" | "negative") => {
    setFeedbackType(type)

    if (type === "positive") {
      // Feedback positivo - enviar directamente
      await submitFeedback(100, translatedText)
    } else {
      // Feedback negativo - mostrar opciones de corrección
      setShowCorrection(true)
      setAccuracy(50) // Valor predeterminado para feedback negativo
    }
  }

  const submitFeedback = async (accuracyValue: number, correction: string) => {
    setIsSubmitting(true)
    setMessage({ text: "", type: "" })

    try {
      // Enviar feedback al backend de IA
      await sendAIFeedback({
        originalText,
        expectedOutput: translatedText,
        manualCorrection: correction,
        accuracy: accuracyValue,
      })

      // También guardar en nuestra base de datos
      const response = await fetch("/api/ai-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputText: originalText,
          expectedOutput: translatedText,
          manualCorrection: correction,
          accuracy: accuracyValue,
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
    } catch (error: any) {
      console.error("Error al enviar feedback:", error)
      setMessage({ text: "Error al conectar con el servidor", type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitFeedback(accuracy, manualCorrection)
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-2">¿Qué te pareció la traducción?</h3>

      {message.text && (
        <div
          className={`p-3 mb-4 rounded-md ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {!feedbackType && !showCorrection && (
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => handleQuickFeedback("positive")}
            className="flex-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            disabled={isSubmitting}
          >
            <ThumbsUp className="mr-2 h-5 w-5" />
            Correcta
          </button>
          <button
            onClick={() => handleQuickFeedback("negative")}
            className="flex-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            disabled={isSubmitting}
          >
            <ThumbsDown className="mr-2 h-5 w-5" />
            Incorrecta
          </button>
        </div>
      )}

      {(showCorrection || feedbackType === "negative") && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="manualCorrection" className="block text-sm font-medium text-gray-700">
              Corrección manual
            </label>
            <div className="mt-1 relative">
              <textarea
                id="manualCorrection"
                value={manualCorrection}
                onChange={(e) => setManualCorrection(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-skyblue focus:ring focus:ring-skyblue focus:ring-opacity-50 pl-10"
                rows={3}
              />
              <Edit className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
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
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0% (Completamente incorrecta)</span>
              <span>100% (Perfecta)</span>
            </div>
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
              "Enviar corrección"
            )}
          </button>
        </form>
      )}
    </div>
  )
}

