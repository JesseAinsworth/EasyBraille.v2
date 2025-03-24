"use client"

import { useCallback, memo } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

// Optimize data fetching with SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Memoize the translation item component
const TranslationItem = memo(function TranslationItem({ translation }: { translation: any }) {
  return (
    <div key={translation._id} className="bg-white shadow rounded-lg p-4">
      <p className="font-semibold text-skyblue">Braille: {translation.originalText}</p>
      <p className="text-gray-600">Español: {translation.translatedText}</p>
      <p className="text-sm text-gray-400 mt-2">{new Date(translation.createdAt).toLocaleString()}</p>
    </div>
  )
})

export default function HistoryPage() {
  // Use SWR for data fetching with caching
  const {
    data: recentTranslations,
    error,
    isLoading,
  } = useSWR("/api/translate", fetcher, {
    revalidateOnFocus: false, // Don't revalidate when window gets focus
    revalidateIfStale: false, // Don't revalidate if data is stale
    dedupingInterval: 60000, // Dedupe requests within 1 minute
  })

  const router = useRouter()

  const handleGoBack = useCallback(() => {
    router.push("/translator")
  }, [router])

  if (error)
    return (
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

  if (isLoading)
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={handleGoBack}
          className="mb-6 flex items-center text-skyblue hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          <span>Volver al traductor</span>
        </button>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-skyblue"></div>
          <span className="ml-2">Cargando historial...</span>
        </div>
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
        {recentTranslations && recentTranslations.length > 0 ? (
          recentTranslations.map((translation: any) => (
            <TranslationItem key={translation._id} translation={translation} />
          ))
        ) : (
          <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">No hay traducciones en el historial</div>
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

