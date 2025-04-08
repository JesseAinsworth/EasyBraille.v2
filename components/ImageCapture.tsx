"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Camera, Upload, X } from "lucide-react"
import Image from "next/image"

interface ImageCaptureProps {
  onImageCaptured: (imageData: string | File | null) => void
}

export default function ImageCapture({ onImageCaptured }: ImageCaptureProps) {
  const [captureMode, setCaptureMode] = useState<"none" | "camera" | "upload">("none")
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [capturedFile, setCapturedFile] = useState<File | null>(null)

  // Iniciar la cámara cuando se activa el modo cámara
  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      if (captureMode === "camera") {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          })

          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        } catch (err) {
          console.error("Error al acceder a la cámara:", err)
          setCaptureMode("none")
          alert("No se pudo acceder a la cámara. Por favor, verifica los permisos.")
        }
      }
    }

    startCamera()

    // Limpiar al desmontar
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [captureMode])

  // Capturar imagen de la cámara
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Establecer dimensiones del canvas al tamaño del video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Dibujar el frame actual del video en el canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convertir a base64
        const imageData = canvas.toDataURL("image/jpeg")
        setImageSrc(imageData)

        // Convertir a File para enviar al backend
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" })
              setCapturedFile(file)
              handleImageCaptured(file)
            }
          },
          "image/jpeg",
          0.8,
        )

        // Detener la cámara
        const stream = video.srcObject as MediaStream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
        setCaptureMode("none")
      }
    }
  }

  // Manejar carga de archivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setImageSrc(result)
        setCapturedFile(file)
        handleImageCaptured(file)
        setCaptureMode("none")
      }
      reader.readAsDataURL(file)
    }
  }

  // Reiniciar el componente
  const resetCapture = () => {
    setImageSrc(null)
    setCaptureMode("none")
    setCapturedFile(null)
    onImageCaptured(null)

    // Detener la cámara si está activa
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }

  // Modificar la función handleImageCaptured para enviar el File directamente
  const handleImageCaptured = async (imageData: string | File | null) => {
    if (!imageData) return

    console.log("ImageCapture: Imagen capturada, enviando al componente padre")
    setIsProcessing(true)

    try {
      // Pasar la imagen al componente padre
      onImageCaptured(imageData)

      // Simular un breve retraso para feedback visual
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error("ImageCapture: Error al procesar la imagen:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Canvas oculto para capturar la imagen */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Botones de acción */}
      {captureMode === "none" && !imageSrc && (
        <div className="flex space-x-4">
          <button
            onClick={() => setCaptureMode("camera")}
            className="flex-1 flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-skyblue hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skyblue transition-colors"
          >
            <Camera className="mr-2 h-5 w-5" />
            Usar cámara
          </button>
          <button
            onClick={() => {
              setCaptureMode("upload")
              fileInputRef.current?.click()
            }}
            className="flex-1 flex items-center justify-center py-3 px-4 border border-skyblue rounded-md shadow-sm text-skyblue bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skyblue transition-colors"
          >
            <Upload className="mr-2 h-5 w-5" />
            Subir imagen
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
        </div>
      )}

      {/* Vista previa de la cámara */}
      {captureMode === "camera" && (
        <div className="relative">
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md" />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <button
              onClick={captureImage}
              className="p-3 bg-skyblue text-white rounded-full shadow-lg hover:bg-blue-400 transition-colors flex items-center justify-center"
            >
              <Camera className="h-6 w-6" />
            </button>
            <button
              onClick={resetCapture}
              className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {/* Imagen capturada */}
      {imageSrc && (
        <div className="space-y-4">
          <div className="relative">
            <Image
              src={imageSrc || "/placeholder.svg"}
              alt="Imagen capturada"
              width={500}
              height={300}
              className="w-full h-auto rounded-md"
              unoptimized
            />
            <button
              onClick={resetCapture}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

