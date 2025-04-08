/**
 * Servicio para manejar las interacciones con el backend de IA
 */

// Modificar la URL del backend y añadir más logs para depuración

// URL base del backend de IA
const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL || "http://localhost:5000"

// Añadir una variable para controlar si estamos en modo de prueba
let TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === "true"

console.log("AI Service: Inicializado con URL:", AI_BACKEND_URL, "Modo de prueba:", TEST_MODE)

/**
 * Procesa una imagen para detectar y traducir texto Braille
 * @param imageData - Imagen en formato base64 o File
 * @returns Objeto con el texto Braille detectado, traducción y la imagen procesada
 */
export async function processImage(imageData: string | File): Promise<{
  braille: string
  spanish: string
  processedImage: string
  processingTime: number
}> {
  try {
    console.log("AI Service: Procesando imagen, modo de prueba:", TEST_MODE)

    // Si estamos en modo de prueba, simular una respuesta
    if (TEST_MODE) {
      console.log("AI Service: Usando modo de prueba para processImage")
      // Simular un tiempo de procesamiento
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Devolver datos simulados
      return {
        braille: "⠁⠃⠉",
        spanish: "abc",
        processedImage: "", // No hay imagen procesada en modo de prueba
        processingTime: 1.5,
      }
    }

    let formData: FormData | null = null
    let requestBody: any = null

    // Preparar los datos según el tipo de entrada
    if (typeof imageData === "string") {
      // Si es una cadena base64
      console.log("AI Service: Procesando imagen como base64")
      requestBody = { image: imageData }
    } else {
      // Si es un archivo
      console.log("AI Service: Procesando imagen como File, tamaño:", imageData.size)
      formData = new FormData()
      formData.append("image", imageData)
    }

    // Realizar la petición al backend
    console.log(`AI Service: Enviando petición a ${AI_BACKEND_URL}/process-image`)
    const response = await fetch(`${AI_BACKEND_URL}/process-image`, {
      method: "POST",
      body: formData || JSON.stringify(requestBody),
      headers: formData
        ? undefined
        : {
            "Content-Type": "application/json",
          },
    })

    console.log("AI Service: Respuesta recibida, status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("AI Service: Error en la respuesta:", errorText)
      try {
        const errorData = JSON.parse(errorText)
        throw new Error(errorData.error || `Error al procesar la imagen: ${response.status}`)
      } catch (e) {
        throw new Error(`Error al procesar la imagen: ${response.status} - ${errorText.substring(0, 100)}`)
      }
    }

    const data = await response.json()
    console.log("AI Service: Datos recibidos:", Object.keys(data))

    return {
      braille: data.braille || "",
      spanish: data.spanish || "",
      processedImage: data.processed_image || "",
      processingTime: data.processing_time || 0,
    }
  } catch (error: any) {
    console.error("Error en el servicio de IA:", error)

    // Si hay un error de conexión, activar el modo de prueba
    if (error.message === "Failed to fetch" || error.message.includes("NetworkError")) {
      TEST_MODE = true
      console.log("AI Service: Activando modo de prueba debido a error de conexión")
      return processImage(imageData)
    }

    throw new Error(`Error en el servicio de IA: ${error.message}`)
  }
}

/**
 * Traduce texto Braille a español
 * @param brailleText - Texto en formato Braille
 * @returns Texto traducido al español
 */
export async function translateBrailleText(brailleText: string): Promise<{
  spanish: string
}> {
  try {
    // Si estamos en modo de prueba, simular una respuesta
    if (TEST_MODE) {
      console.log("Usando modo de prueba para translateBrailleText")
      // Simular un tiempo de procesamiento
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Traducción básica usando un mapeo simple
      const brailleToSpanish: { [key: string]: string } = {
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
        "⠀": " ",
        " ": " ",
      }

      const spanish = brailleText
        .split("")
        .map((char) => brailleToSpanish[char] || char)
        .join("")

      return {
        spanish: spanish,
      }
    }

    const response = await fetch(`${AI_BACKEND_URL}/translate-braille`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ braille: brailleText }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error al traducir el texto Braille")
    }

    const data = await response.json()

    return {
      spanish: data.spanish || "",
    }
  } catch (error: any) {
    console.error("Error en el servicio de traducción:", error)

    // Si hay un error de conexión, activar el modo de prueba
    if (error.message === "Failed to fetch") {
      TEST_MODE = true
      console.log("Activando modo de prueba debido a error de conexión")
      return translateBrailleText(brailleText)
    }

    throw new Error(`Error en el servicio de traducción: ${error.message}`)
  }
}

/**
 * Envía feedback sobre una traducción para mejorar el modelo
 * @param feedback - Objeto con la información del feedback
 * @returns Mensaje de confirmación
 */
export async function sendAIFeedback(feedback: {
  originalText: string
  expectedOutput: string
  manualCorrection: string
  accuracy: number
}): Promise<{ message: string }> {
  try {
    // Si estamos en modo de prueba, simular una respuesta
    if (TEST_MODE) {
      console.log("Usando modo de prueba para sendAIFeedback")
      // Simular un tiempo de procesamiento
      await new Promise((resolve) => setTimeout(resolve, 500))

      return {
        message: "Feedback enviado correctamente (modo de prueba)",
      }
    }

    const response = await fetch(`${AI_BACKEND_URL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedback),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error al enviar feedback")
    }

    const data = await response.json()

    return {
      message: data.message || "Feedback enviado correctamente",
    }
  } catch (error: any) {
    console.error("Error al enviar feedback:", error)

    // Si hay un error de conexión, activar el modo de prueba
    if (error.message === "Failed to fetch") {
      TEST_MODE = true
      console.log("Activando modo de prueba debido a error de conexión")
      return sendAIFeedback(feedback)
    }

    throw new Error(`Error al enviar feedback: ${error.message}`)
  }
}

/**
 * Obtiene el estado de salud del backend de IA
 * @returns Estado del backend
 */
export async function checkAIBackendHealth(): Promise<{
  status: string
  version: string
}> {
  try {
    // Si ya estamos en modo de prueba, devolver un estado simulado
    if (TEST_MODE) {
      console.log("Usando modo de prueba para checkAIBackendHealth")
      return {
        status: "healthy (test mode)",
        version: "1.0.0-test",
      }
    }

    const response = await fetch(`${AI_BACKEND_URL}/health`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error("El backend de IA no está disponible")
    }

    return await response.json()
  } catch (error: any) {
    console.error("Error al verificar el estado del backend:", error)

    // Activar el modo de prueba
    TEST_MODE = true
    console.log("Activando modo de prueba debido a error de conexión")

    throw new Error(`Error al verificar el estado del backend: ${error.message}`)
  }
}

// Función para activar/desactivar el modo de prueba manualmente
export function setTestMode(enabled: boolean): void {
  TEST_MODE = enabled
  console.log(`Modo de prueba ${enabled ? "activado" : "desactivado"} manualmente`)
}

// Función para verificar si estamos en modo de prueba
export function isInTestMode(): boolean {
  return TEST_MODE
}

