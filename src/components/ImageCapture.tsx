"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageCaptureProps {
  onTextDetected: (text: string) => void
}

export function ImageCapture({ onTextDetected }: ImageCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const { toast } = useToast()

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Por favor, verifica los permisos.",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setIsCameraActive(false)
    }
  }

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        const imageDataUrl = canvas.toDataURL("image/jpeg")
        setCapturedImage(imageDataUrl)
        stopCamera()

        // Process the image
        processImage(imageDataUrl)
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string
        setCapturedImage(imageDataUrl)

        // Process the image
        processImage(imageDataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = async (imageDataUrl: string) => {
    setIsProcessing(true)

    try {
      // In a real app, this would be an API call to a backend service
      // that processes the image and extracts Braille text
      // For demo purposes, we'll simulate this with a timeout

      setTimeout(() => {
        // Simulated Braille text detection
        const detectedText = "⠓⠕⠇⠁ ⠍⠥⠝⠙⠕"
        onTextDetected(detectedText)
        setIsProcessing(false)

        toast({
          title: "Imagen procesada",
          description: "Se ha detectado texto en Braille en la imagen.",
        })
      }, 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la imagen. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  const resetImage = () => {
    setCapturedImage(null)
    setIsProcessing(false)
  }

  return (
    <div className="space-y-4">
      {!capturedImage && !isCameraActive && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={startCamera}>
              <CardContent className="flex flex-col items-center justify-center p-6 h-40">
                <Camera className="h-10 w-10 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Usar cámara</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 h-40">
                <Upload className="h-10 w-10 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Subir imagen</p>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isCameraActive && (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={captureImage}>Capturar</Button>
            <Button variant="outline" onClick={stopCamera}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-full object-contain" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background"
              onClick={resetImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-center">
            {isProcessing ? (
              <Button disabled>Procesando imagen...</Button>
            ) : (
              <Button onClick={() => processImage(capturedImage)}>Procesar de nuevo</Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
