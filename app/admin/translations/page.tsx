"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Book, Search, ChevronLeft, ChevronRight, ArrowLeft, User } from "lucide-react"
import Link from "next/link"

interface Translation {
  _id: string
  originalText: string
  translatedText: string
  createdAt: string
  user: {
    username: string
    email?: string
  }
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export default function AdminTranslationsPage() {
  const [translations, setTranslations] = useState<Translation[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const fetchTranslations = async (page = 1, search = "") => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/translations?page=${page}&limit=10&search=${search}`)

      if (response.ok) {
        const data = await response.json()
        setTranslations(data.translations)
        setPagination(data.pagination)
      } else {
        if (response.status === 401) {
          router.push("/admin-login")
        } else {
          const errorData = await response.json()
          setError(errorData.message || "Error al cargar traducciones")
        }
      }
    } catch (error) {
      setError("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTranslations()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTranslations(1, searchTerm)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      fetchTranslations(newPage, searchTerm)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-skyblue hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          <span>Volver al Dashboard</span>
        </Link>
      </div>

      <div className="flex items-center mb-8">
        <Book className="h-8 w-8 text-skyblue mr-3" />
        <h1 className="text-3xl font-bold text-skyblue">Historial de Traducciones</h1>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar en traducciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-skyblue focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="bg-skyblue text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>}

      {/* Tabla de traducciones */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Texto Original (Braille)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Texto Traducido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-skyblue mx-auto"></div>
                  </td>
                </tr>
              ) : translations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron traducciones
                  </td>
                </tr>
              ) : (
                translations.map((translation) => (
                  <tr key={translation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{translation.user.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{translation.originalText}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{translation.translatedText}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(translation.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {!loading && pagination.pages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> a{" "}
            <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> de{" "}
            <span className="font-medium">{pagination.total}</span> resultados
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
