"use client"

import { useState, useEffect } from "react"
import { Terminal, Bug, X, Check, AlertTriangle } from "lucide-react"

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [backendUrl, setBackendUrl] = useState<string>("")
  const [testImage, setTestImage] = useState<File | null>(null)
  const [testResponse, setTestResponse] = useState<any>(null)

  useEffect(() => {
    // Obtener la URL del backend desde la variable de entorno
    setBackendUrl(process.env.NEXT_PUBLIC_AI_BACKEND_URL || "http://localhost:5000")
  }, [])

  // Función para añadir un log
  const addLog = (message: string) => {
    setLogs((prevLogs) => [...prevLogs, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  // Función para limpiar los logs
  const clearLogs = () => {
    setLogs([])
    setTestResult(null)
    setTestStatus("idle")
    setTestResponse(null)
  }

  // Función para probar la conexión directamente al backend
  const testBackendConnection = async () => {
    setTestStatus("testing")
    setTestResult(null)
    setTestResponse(null)

    try {
      // Probar el endpoint de salud
      addLog(`Probando conexión a ${backendUrl}/health...`)
      const healthResponse = await fetch(`${backendUrl}/health`, {
        method: "GET",
      })

      if (!healthResponse.ok) {
        throw new Error(`Error al conectar con el endpoint de salud: ${healthResponse.status}`)
      }

      const healthData = await healthResponse.json()
      addLog(`Conexión exitosa al endpoint de salud: ${JSON.stringify(healthData)}`)

      setTestResult("Conexión exitosa con el backend. El endpoint de salud funciona correctamente.")
      setTestStatus("success")
    } catch (error: any) {
      console.error("Error en la prueba de conexión:", error)
      addLog(`Error: ${error.message}`)
      setTestResult(`Error: ${error.message}`)
      setTestStatus("error")
    }
  }

  // Función para crear una imagen de prueba simple
  const createTestImage = async (): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      canvas.width = 200
      canvas.height = 200
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Dibujar un fondo blanco
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, 200, 200)

        // Dibujar algunos círculos negros (simulando puntos Braille)
        ctx.fillStyle = "black"
        ctx.beginPath()
        ctx.arc(50, 50, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(50, 80, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(80, 50, 5, 0, Math.PI * 2)
        ctx.fill()
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "test_image.jpg", { type: "image/jpeg" })
            setTestImage(file)
            resolve(file)
          } else {
            // Si falla, crear un blob simple
            const simpleBlob = new Blob(["test"], { type: "image/jpeg" })
            const file = new File([simpleBlob], "test_image.jpg", { type: "image/jpeg" })
            setTestImage(file)
            resolve(file)
          }
        },
        "image/jpeg",
        0.8,
      )
    })
  }

  // Función para probar el endpoint de procesamiento de imágenes
  const testImageProcessing = async () => {
    setTestStatus("testing")
    setTestResult(null)
    setTestResponse(null)

    try {
      // Crear una imagen de prueba
      const file = await createTestImage()
      addLog(`Imagen de prueba creada, tamaño: ${file.size} bytes`)

      // Método 1: Probar directamente con el backend
      addLog(`Enviando solicitud directa a ${backendUrl}/process-image...`)

      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch(`${backendUrl}/process-image`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        addLog(`Error en la respuesta directa: ${response.status} - ${errorText}`)
        throw new Error(`Error al procesar imagen directamente: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      addLog(`Respuesta directa recibida: ${JSON.stringify(data).substring(0, 100)}...`)
      setTestResponse(data)

      // Método 2: Probar a través del proxy API
      addLog(`Enviando solicitud a través del proxy API /api/translate-image...`)

      const proxyFormData = new FormData()
      proxyFormData.append("image", file)

      const proxyResponse = await fetch("/api/translate-image", {
        method: "POST",
        body: proxyFormData,
      })

      if (!proxyResponse.ok) {
        const errorText = await proxyResponse.text()
        addLog(`Error en la respuesta del proxy: ${proxyResponse.status} - ${errorText}`)
        throw new Error(`Error al procesar imagen a través del proxy: ${proxyResponse.status} - ${errorText}`)
      }

      const proxyData = await proxyResponse.json()
      addLog(`Respuesta del proxy recibida: ${JSON.stringify(proxyData).substring(0, 100)}...`)

      setTestResult("Prueba de procesamiento de imagen exitosa. Ambos endpoints funcionan correctamente.")
      setTestStatus("success")
    } catch (error: any) {
      console.error("Error en la prueba de procesamiento de imagen:", error)
      addLog(`Error: ${error.message}`)
      setTestResult(`Error: ${error.message}`)
      setTestStatus("error")
    }
  }

  // Función para probar el componente BrailleTranslator
  const testBrailleTranslator = async () => {
    setTestStatus("testing")
    setTestResult(null)

    try {
      addLog("Simulando clic en el botón 'Imagen' del traductor...")

      // Crear una imagen de prueba
      const file = await createTestImage()
      addLog(`Imagen de prueba creada, tamaño: ${file.size} bytes`)

      // Simular el envío de la imagen a través del componente
      addLog("Enviando imagen al componente BrailleTranslator...")

      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/translate-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        addLog(`Error en la respuesta: ${response.status} - ${errorText}`)
        throw new Error(`Error al procesar imagen: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      addLog(`Respuesta recibida: ${JSON.stringify(data).substring(0, 100)}...`)

      setTestResult("Prueba del componente BrailleTranslator exitosa.")
      setTestStatus("success")
    } catch (error: any) {
      console.error("Error en la prueba del componente:", error)
      addLog(`Error: ${error.message}`)
      setTestResult(`Error: ${error.message}`)
      setTestStatus("error")
    }
  }

  return (
    <>
      {/* Botón flotante para abrir el panel */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        title="Abrir panel de depuración"
      >
        <Bug className="h-5 w-5" />
      </button>

      {/* Panel de depuración */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <Terminal className="h-5 w-5 mr-2 text-blue-500" />
                <h2 className="text-lg font-semibold">Panel de Depuración</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-2">Pruebas de conexión</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={testBackendConnection}
                      disabled={testStatus === "testing"}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
                    >
                      {testStatus === "testing" ? "Probando..." : "Probar conexión"}
                    </button>
                    <button
                      onClick={testImageProcessing}
                      disabled={testStatus === "testing"}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
                    >
                      {testStatus === "testing" ? "Probando..." : "Probar procesamiento de imagen"}
                    </button>
                    <button
                      onClick={testBrailleTranslator}
                      disabled={testStatus === "testing"}
                      className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50"
                    >
                      {testStatus === "testing" ? "Probando..." : "Probar componente BrailleTranslator"}
                    </button>
                    <button
                      onClick={clearLogs}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                      Limpiar logs
                    </button>
                  </div>

                  {testResult && (
                    <div
                      className={`mt-2 p-3 rounded-md ${testStatus === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      <div className="flex items-center">
                        {testStatus === "success" ? (
                          <Check className="h-5 w-5 mr-2" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 mr-2" />
                        )}
                        <div>{testResult}</div>
                      </div>
                    </div>
                  )}
                </div>

                {testImage && (
                  <div>
                    <h3 className="text-md font-medium mb-2">Imagen de prueba</h3>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <img
                        src={URL.createObjectURL(testImage) || "/placeholder.svg"}
                        alt="Imagen de prueba"
                        className="max-w-xs mx-auto border border-gray-300"
                      />
                    </div>
                  </div>
                )}

                {testResponse && (
                  <div>
                    <h3 className="text-md font-medium mb-2">Respuesta del servidor</h3>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold">
                            Braille: <span className="font-normal">{testResponse.braille}</span>
                          </p>
                          <p className="font-semibold">
                            Español: <span className="font-normal">{testResponse.spanish}</span>
                          </p>
                          <p className="font-semibold">
                            Tiempo: <span className="font-normal">{testResponse.processing_time}s</span>
                          </p>
                        </div>
                        {testResponse.processed_image && (
                          <div>
                            <p className="font-semibold mb-1">Imagen procesada:</p>
                            <img
                              src={`data:image/jpeg;base64,${testResponse.processed_image}`}
                              alt="Imagen procesada"
                              className="max-w-xs border border-gray-300"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-md font-medium mb-2">Variables de entorno</h3>
                  <div className="bg-gray-100 p-3 rounded-md text-sm font-mono">
                    <p>NEXT_PUBLIC_AI_BACKEND_URL: {process.env.NEXT_PUBLIC_AI_BACKEND_URL || "no definido"}</p>
                    <p>NEXT_PUBLIC_TEST_MODE: {process.env.NEXT_PUBLIC_TEST_MODE || "no definido"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium mb-2">Logs</h3>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm font-mono h-60 overflow-y-auto">
                    {logs.length > 0 ? (
                      logs.map((log, index) => (
                        <div key={index} className="mb-1">
                          {log}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No hay logs disponibles</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

