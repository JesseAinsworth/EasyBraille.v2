"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function HistoryPage() {
  const { data: recentTranslations, error } = useSWR("/api/translate", fetcher)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Aquí deberías obtener el userId del estado de autenticación
    // Por ahora, usaremos un valor de ejemplo
    setUserId("example-user-id")
  }, [])

  if (error) return <div>Failed to load</div>
  if (!recentTranslations) return <div>Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-skyblue">Historial de Traducciones</h1>
      <div className="space-y-4">
        {recentTranslations.map((translation: any) => (
          <div key={translation._id} className="bg-white shadow rounded-lg p-4">
            <p className="font-semibold text-skyblue">Braille: {translation.braille}</p>
            <p className="text-gray-600">Español: {translation.spanish}</p>
            <p className="text-sm text-gray-400 mt-2">{new Date(translation.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

