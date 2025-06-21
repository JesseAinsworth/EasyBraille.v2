import type { ObjectId } from "mongodb"

export interface AiInteraction {
  _id?: ObjectId
  userId: ObjectId
  query: string
  response: string
  interactionType: "translation" | "help" | "correction" | "suggestion"
  metadata?: {
    processingTime?: number
    confidence?: number
    model?: string
  }
  createdAt: Date
}

export interface CreateAiInteractionData {
  userId: string
  query: string
  response: string
  interactionType: "translation" | "help" | "correction" | "suggestion"
  metadata?: {
    processingTime?: number
    confidence?: number
    model?: string
  }
}

export function validateAiInteractionData(data: CreateAiInteractionData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.userId) {
    errors.push("El ID de usuario es requerido")
  }

  if (!data.query || data.query.trim().length === 0) {
    errors.push("La consulta es requerida")
  }

  if (!data.response || data.response.trim().length === 0) {
    errors.push("La respuesta es requerida")
  }

  if (!["translation", "help", "correction", "suggestion"].includes(data.interactionType)) {
    errors.push("Tipo de interacción inválido")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
