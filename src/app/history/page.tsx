"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Trash2, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Translation } from "@/models/Translation"

export default function HistoryPage() {
  const [history, setHistory] = useState<Translation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    setIsLoggedIn(true)
    fetchTranslations()
  }, [router])

  const fetchTranslations = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/translations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener el historial")
      }

      const data = await response.json()
      setHistory(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de traducciones",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "El texto ha sido copiado al portapapeles.",
    })
  }

  const handleDeleteRecord = async (id: string) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`/api/translations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la traducción")
      }

      // Actualizar el estado local
      setHistory(history.filter((item) => item._id !== id))

      toast({
        title: "Eliminado",
        description: "El registro ha sido eliminado del historial.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro",
        variant: "destructive",
      })
    }
  }

  const handleClearHistory = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/translations", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el historial")
      }

      setHistory([])

      toast({
        title: "Historial borrado",
        description: "Todo el historial de traducciones ha sido eliminado.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo borrar el historial",
        variant: "destructive",
      })
    }
  }

  if (!isLoggedIn || isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const spanishToBrailleHistory = history.filter((record) => record.direction === "tobraille")
  const brailleToSpanishHistory = history.filter((record) => record.direction === "frombraille")

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Historial de traducciones</h1>
        </div>

        {history.length > 0 && (
          <Button variant="destructive" onClick={handleClearHistory}>
            <Trash2 className="mr-2 h-4 w-4" />
            Borrar todo
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No hay traducciones en tu historial</p>
            <Button onClick={() => router.push("/translator")}>Ir al traductor</Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="tobraille">Español a Braille</TabsTrigger>
            <TabsTrigger value="frombraille">Braille a Español</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {history.map((record) => (
                <HistoryCard
                  key={record._id}
                  record={record}
                  onCopy={handleCopyToClipboard}
                  onDelete={handleDeleteRecord}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tobraille">
            <div className="space-y-4">
              {spanishToBrailleHistory.length > 0 ? (
                spanishToBrailleHistory.map((record) => (
                  <HistoryCard
                    key={record._id}
                    record={record}
                    onCopy={handleCopyToClipboard}
                    onDelete={handleDeleteRecord}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">No hay traducciones de Español a Braille</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="frombraille">
            <div className="space-y-4">
              {brailleToSpanishHistory.length > 0 ? (
                brailleToSpanishHistory.map((record) => (
                  <HistoryCard
                    key={record._id}
                    record={record}
                    onCopy={handleCopyToClipboard}
                    onDelete={handleDeleteRecord}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">No hay traducciones de Braille a Español</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function HistoryCard({
  record,
  onCopy,
  onDelete,
}: {
  record: Translation
  onCopy: (text: string) => void
  onDelete: (id: string) => void
}) {
  const date = new Date(record.timestamp)
  const formattedDate = date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  const formattedTime = date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {record.direction === "tobraille" ? "Español a Braille" : "Braille a Español"}
            </CardTitle>
            <CardDescription>
              {formattedDate} a las {formattedTime}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onCopy(record.outputText)} title="Copiar resultado">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(record._id!)} title="Eliminar registro">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">{record.direction === "tobraille" ? "Español" : "Braille"}:</p>
            <div className="p-3 bg-muted rounded-md font-mono text-sm">{record.inputText}</div>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">{record.direction === "tobraille" ? "Braille" : "Español"}:</p>
            <div className="p-3 bg-muted rounded-md font-mono text-sm">{record.outputText}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
