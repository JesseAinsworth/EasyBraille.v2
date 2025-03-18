"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { ArrowLeft } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function HistoryPage() {
  const { data: recentTranslations, error } = useSWR("/api/translate", fetcher)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Aquí deberías obtener el userId del estado de autenticación
    // Por ahora, usaremos un valor de ejemplo
    setUserId("example-user-id")
  }, [])

  const handleGoBack = () => {
    router.push("/translator")
  }

  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={handleGoBack}
        className="mb-6 flex items-center text-skyblue hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        <span>Volver al traductor</span>
      </button>
      <div className="bg-red-100 text-red-700 p-4 rounded-md">Error al cargar el historial</div>
    </div>
  )
  
  if (!recentTranslations) return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={handleGoBack}
        className="mb-6 flex items-center text-skyblue hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        <span>Volver al traductor</span>
      </button>
      <div>Cargando...</div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={handleGoBack}
        className="mb-6 flex items-center text-skyblue hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        <span>Volver al traductor</span>
      </button>
      
      <h1 className="text-3xl font-bold mb-6 text-skyblue">Historial de Traducciones</h1>
      
      <div className="space-y-4">
        {recentTranslations.length > 0 ? (
          recentTranslations.map((translation: any) => (
            <div key={translation._id} className="bg-white shadow rounded-lg p-4">
              <p className="font-semibold text-skyblue">Braille: {translation.originalText}</p>
              <p className="text-gray-600">Español: {translation.translatedText}</p>
              <p className="text-sm text-gray-400 mt-2">{new Date(translation.createdAt).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
            No hay traducciones en el historial
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center">
        <button 
          onClick={handleGoBack}
          className="inline-flex items-center px-4 py-2 bg-skyblue text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-skyblue focus:ring-opacity-50"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          <span>Volver al traductor</span>
        </button>
      </div>
    </div>
  )
}

