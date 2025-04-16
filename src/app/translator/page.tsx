"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownUp, Copy, Volume2, History } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ImageCapture } from "@/components/ImageCapture"

export default function TranslatorPage() {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [translationDirection, setTranslationDirection] = useState<"tobraille" | "frombraille">("tobraille")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user")
    if (user) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Texto vacío",
        description: "Por favor, ingresa algún texto para traducir.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a translation
      setTimeout(() => {
        if (translationDirection === "tobraille") {
          // Simple Spanish to Braille mapping (just for demo)
          const brailleMap: { [key: string]: string } = {
            a: "⠁",
            b: "⠃",
            c: "⠉",
            d: "⠙",
            e: "⠑",
            f: "⠋",
            g: "⠛",
            h: "⠓",
            i: "⠊",
            j: "⠚",
            k: "⠅",
            l: "⠇",
            m: "⠍",
            n: "⠝",
            o: "⠕",
            p: "⠏",
            q: "⠟",
            r: "⠗",
            s: "⠎",
            t: "⠞",
            u: "⠥",
            v: "⠧",
            w: "⠺",
            x: "⠭",
            y: "⠽",
            z: "⠵",
            " ": " ",
          }

          const result = inputText
            .toLowerCase()
            .split("")
            .map((char) => {
              return brailleMap[char] || char
            })
            .join("")

          setOutputText(result)
        } else {
          // Simple Braille to Spanish mapping (just for demo)
          const spanishMap: { [key: string]: string } = {
            "⠁": "a",
            "⠃": "b",
            "⠉": "c",
            "⠙": "d",
            "⠑": "e",
            "⠋": "f",
            "⠛": "g",
            "⠓": "h",
            "⠊": "i",
            "⠚": "j",
            "⠅": "k",
            "⠇": "l",
            "⠍": "m",
            "⠝": "n",
            "⠕": "o",
            "⠏": "p",
            "⠟": "q",
            "⠗": "r",
            "⠎": "s",
            "⠞": "t",
            "⠥": "u",
            "⠧": "v",
            "⠺": "w",
            "⠭": "x",
            "⠽": "y",
            "⠵": "z",
            " ": " ",
          }

          const result = inputText
            .split("")
            .map((char) => {
              return spanishMap[char] || char
            })
            .join("")

          setOutputText(result)
        }

        // Save to history if logged in
        if (isLoggedIn) {
          const history = JSON.parse(localStorage.getItem("translationHistory") || "[]")
          history.push({
            id: Date.now(),
            inputText,
            outputText,
            direction: translationDirection,
            timestamp: new Date().toISOString(),
          })
          localStorage.setItem("translationHistory", JSON.stringify(history))
        }

        setIsLoading(false)
      }, 1000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error durante la traducción. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleSwapDirection = () => {
    setTranslationDirection((prev) => (prev === "tobraille" ? "frombraille" : "tobraille"))
    setInputText(outputText)
    setOutputText(inputText)
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(outputText)
    toast({
      title: "Copiado",
      description: "El texto ha sido copiado al portapapeles.",
    })
  }

  const handleTextToSpeech = () => {
    if (!outputText) return

    // Only use text-to-speech for Spanish text
    if (translationDirection === "frombraille") {
      const utterance = new SpeechSynthesisUtterance(outputText)
      utterance.lang = "es-ES"
      window.speechSynthesis.speak(utterance)
    } else {
      toast({
        title: "No disponible",
        description: "La lectura de texto solo está disponible para texto en español.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Traductor de Braille</h1>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="text">Texto</TabsTrigger>
          <TabsTrigger value="image">Imagen</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{translationDirection === "tobraille" ? "Español a Braille" : "Braille a Español"}</CardTitle>
              <CardDescription>
                {translationDirection === "tobraille"
                  ? "Ingresa texto en español para convertirlo a Braille"
                  : "Ingresa texto en Braille para convertirlo a español"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {translationDirection === "tobraille" ? "Español" : "Braille"}
                  </label>
                  <Textarea
                    placeholder={
                      translationDirection === "tobraille"
                        ? "Escribe texto en español..."
                        : "Escribe texto en Braille..."
                    }
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[200px] font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {translationDirection === "tobraille" ? "Braille" : "Español"}
                  </label>
                  <Textarea
                    value={outputText}
                    readOnly
                    className="min-h-[200px] font-mono"
                    placeholder="Resultado de la traducción..."
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={handleTranslate} disabled={isLoading}>
                  {isLoading ? "Traduciendo..." : "Traducir"}
                </Button>
                <Button variant="outline" onClick={handleSwapDirection}>
                  <ArrowDownUp className="mr-2 h-4 w-4" />
                  Cambiar dirección
                </Button>
                <Button variant="outline" onClick={handleCopyToClipboard} disabled={!outputText}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar resultado
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTextToSpeech}
                  disabled={!outputText || translationDirection === "tobraille"}
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Leer en voz alta
                </Button>
                {isLoggedIn && (
                  <Button variant="outline" asChild>
                    <a href="/history">
                      <History className="mr-2 h-4 w-4" />
                      Ver historial
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image">
          <Card>
            <CardHeader>
              <CardTitle>Traducir desde imagen</CardTitle>
              <CardDescription>Sube una imagen con texto en Braille para traducirla a español</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageCapture
                onTextDetected={(text) => {
                  setTranslationDirection("frombraille")
                  setInputText(text)
                  // Trigger translation automatically
                  setTimeout(() => handleTranslate(), 500)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
