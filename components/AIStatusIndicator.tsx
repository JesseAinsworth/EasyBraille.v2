"use client"

import { RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"

interface AIStatusIndicatorProps {
  status: "loading" | "online" | "offline"
  onRetry?: () => void
}

export default function AIStatusIndicator({ status, onRetry }: AIStatusIndicatorProps) {
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-2 bg-blue-50 text-blue-700 rounded-md">
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        <span className="text-sm">Conectando con el servicio de IA...</span>
      </div>
    )
  }

  if (status === "offline") {
    return (
      <div className="flex items-center justify-between p-2 bg-amber-50 text-amber-700 rounded-md">
        <div className="flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span className="text-sm">Servicio de IA no disponible. Usando traducción básica.</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs px-2 py-1 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
    )
  }

  if (status === "online") {
    return (
      <div className="flex items-center justify-center p-2 bg-green-50 text-green-700 rounded-md">
        <CheckCircle className="h-4 w-4 mr-2" />
        <span className="text-sm">Servicio de IA conectado y funcionando</span>
      </div>
    )
  }

  return null
}

