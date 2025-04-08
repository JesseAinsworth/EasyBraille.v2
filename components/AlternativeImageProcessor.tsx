"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Loader2, Camera, Upload, Check } from "lucide-react"

export default function AlternativeImageProcessor() {
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [method, setMethod] = useState<"base64" | "formdata">("formdata")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [testMode, setTestModeState] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleProcess = async () => {
    if (!image) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      if (method === "base64") {
        // Método 1: Enviar como base64 en JSON
        const response = await fetch("/api/translate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image }),
        })

        if (!response.ok) {
          throw new Error(`Error en la respuesta: ${response.status}`)
        }

        const data = await response.json()
        setResult(data)
      } else {
        // Método 2: Enviar como FormData
        // Convertir base64 a blob
        const base64Data = image.split(",")[1]
        const byteCharacters = atob(base64Data)
        const byteArrays = []

        for (let i = 0; i < byteCharacters.length; i += 512) {
          const slice = byteCharacters.slice(i, i + 512)
          const byteNumbers = new Array(slice.length)

          for (let j = 0; j < slice.length; j++) {
            byteNumbers[j] = slice.charCodeAt(j)
          }

          const byteArray = new Uint8Array(byteNumbers)
          byteArrays.push(byteArray)
        }

        const blob = new Blob(byteArrays, { type: "image/jpeg" })
        const file = new File([blob], "image.jpg", { type: "image/jpeg" })

        const formData = new FormData()
        formData.append("image", file)

        const response = await fetch("/api/translate-image", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Error en la respuesta: ${response.status}`)
        }

        const data = await response.json()
        setResult(data)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleTestMode = () => {
    const newMode = !testMode
    setTestModeState(newMode)

    // Intentar acceder a la función global setTestMode si existe
    if (typeof window !== "undefined" && (window as any).setTestMode) {
      ;(window as any).setTestMode(newMode)
    } else {
      // Alternativa: establecer la variable de entorno directamente
      if (typeof process !== "undefined") {
        process.env.NEXT_PUBLIC_TEST_MODE = newMode ? "true" : "false"
      }
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-skyblue">Procesador Alternativo de Imágenes</h2>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            onClick={handleCameraCapture}
            className="flex-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-skyblue hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-skyblue focus:ring-opacity-50"
          >
            <Camera className="mr-2 h-5 w-5" />
            Seleccionar Imagen
          </button>
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>

        {image && (
          <div className="space-y-4">
            <div className="border border-gray-300 rounded-md p-2">
              <img src={image || "/placeholder.svg"} alt="Imagen seleccionada" className="max-h-64 mx-auto" />
            </div>

            <div className="flex space-x-2">
              <button
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  method === "formdata" ? "bg-skyblue text-white" : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setMethod("formdata")}
              >
                Usar FormData
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  method === "base64" ? "bg-skyblue text-white" : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setMethod("base64")}
              >
                Usar Base64
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleProcess}
                disabled={loading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Procesar Imagen
                  </>
                )}
              </button>

              <button
                onClick={toggleTestMode}
                className={`py-2 px-4 rounded-md flex items-center justify-center ${
                  testMode
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {testMode ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Modo Prueba ON
                  </>
                ) : (
                  "Modo Prueba OFF"
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-lg mb-2">Resultado:</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Braille:</span> {result.braille || "No disponible"}
              </p>
              <p>
                <span className="font-medium">Español:</span> {result.spanish || "No disponible"}
              </p>
              <p>
                <span className="font-medium">Tiempo:</span> {result.processingTime || 0}s
              </p>
              {result.testMode && <p className="text-amber-600 font-medium">Resultado generado en modo de prueba</p>}
              {result.processedImage && (
                <div>
                  <p className="font-medium">Imagen procesada:</p>
                  <img
                    src={`data:image/jpeg;base64,${result.processedImage}`}
                    alt="Imagen procesada"
                    className="mt-2 max-w-xs border border-gray-300 rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

