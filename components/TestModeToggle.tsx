"use client"

import { useState, useEffect } from "react"
import { Beaker } from "lucide-react"
import { setTestMode } from "@/lib/ai-service"

export default function TestModeToggle() {
  const [testMode, setTestModeState] = useState(false)

  useEffect(() => {
    // Inicializar el estado con el valor de la variable de entorno
    const envTestMode = process.env.NEXT_PUBLIC_TEST_MODE === "true"
    setTestMode(envTestMode)
    setTestModeState(envTestMode)
    console.log("TestModeToggle: Modo de prueba inicializado:", envTestMode)
  }, [])

  const toggleTestMode = () => {
    const newMode = !testMode
    setTestMode(newMode)
    setTestModeState(newMode)
    console.log("TestModeToggle: Modo de prueba cambiado a:", newMode)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleTestMode}
        className={`flex items-center space-x-2 px-3 py-2 rounded-full shadow-lg transition-colors ${
          testMode ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
        title={testMode ? "Desactivar modo de prueba" : "Activar modo de prueba"}
      >
        <Beaker className="h-4 w-4" />
        <span className="text-sm font-medium">{testMode ? "Modo de prueba ON" : "Modo de prueba OFF"}</span>
      </button>
    </div>
  )
}

