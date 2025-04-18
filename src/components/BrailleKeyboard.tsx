"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Keyboard, Info } from "lucide-react"

interface BrailleKeyboardProps {
  onTextInput: (text: string) => void
}

export function BrailleKeyboard({ onTextInput }: BrailleKeyboardProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastKey, setLastKey] = useState<string | null>(null)
  const [detectedKeys, setDetectedKeys] = useState<string[]>([])

  useEffect(() => {
    // Función para manejar eventos de teclado
    const handleKeyDown = (event: KeyboardEvent) => {
      // Detectar solo letras individuales (sin necesidad de Ctrl+Alt)
      if (event.key.length === 1 && /[a-z]/.test(event.key)) {
        // No prevenir el comportamiento predeterminado para permitir la escritura normal
        // event.preventDefault()

        const key = event.key.toLowerCase()
        setLastKey(key)

        // Añadir la tecla a la lista de teclas detectadas
        setDetectedKeys((prev) => {
          const newKeys = [...prev, key]
          // Mantener solo las últimas 10 teclas
          if (newKeys.length > 10) {
            return newKeys.slice(newKeys.length - 10)
          }
          return newKeys
        })

        // Enviar la tecla al componente padre
        onTextInput(key)

        // Marcar como conectado cuando se detecta una tecla
        setIsConnected(true)
      } else if (event.key === "Backspace") {
        // Manejar la tecla de retroceso
        setLastKey("⌫")
        // No enviamos nada al componente padre, ya que el navegador
        // manejará el borrado automáticamente
      } else if (event.key === " ") {
        // Manejar la tecla de espacio
        setLastKey("␣")
        // No enviamos nada al componente padre, ya que el navegador
        // manejará el espacio automáticamente
      }
    }

    // Agregar el event listener
    window.addEventListener("keydown", handleKeyDown)

    // Limpiar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onTextInput])

  // Simular desconexión después de 5 segundos sin actividad
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => {
        setIsConnected(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isConnected, lastKey])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Teclado Braille
            </CardTitle>
            <CardDescription>Conecta tu teclado Braille Arduino para escribir directamente</CardDescription>
          </div>
          <Badge variant={isConnected ? "default" : "outline"}>{isConnected ? "Conectado" : "Desconectado"}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-md min-h-[60px] flex items-center justify-center">
            {lastKey ? (
              <div className="text-4xl font-mono">{lastKey}</div>
            ) : (
              <div className="text-muted-foreground text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                Presiona una tecla en tu teclado Braille para comenzar
              </div>
            )}
          </div>

          {detectedKeys.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Últimas teclas detectadas:</p>
              <div className="flex flex-wrap gap-2">
                {detectedKeys.map((key, index) => (
                  <Badge key={index} variant="secondary">
                    {key === " " ? "␣" : key}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p className="flex items-center gap-1">
              <Info className="h-4 w-4" />
              Tu teclado Braille envía letras individuales que son detectadas automáticamente.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
