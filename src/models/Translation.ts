import type { ObjectId } from "mongodb"

export interface Translation {
  _id?: ObjectId
  userId: ObjectId
  originalText: string
  brailleText: string
  translationType: "text-to-braille" | "braille-to-text" | "image-to-braille"
  language: string
  imageUrl?: string
  createdAt: Date
  updatedAt?: Date
}

export interface CreateTranslationData {
  userId: string
  originalText: string
  brailleText: string
  translationType: "text-to-braille" | "braille-to-text" | "image-to-braille"
  language?: string
  imageUrl?: string
}

export function validateTranslationData(data: CreateTranslationData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.userId) {
    errors.push("El ID de usuario es requerido")
  }

  if (!data.originalText || data.originalText.trim().length === 0) {
    errors.push("El texto original es requerido")
  }

  if (!data.brailleText || data.brailleText.trim().length === 0) {
    errors.push("El texto en braille es requerido")
  }

  if (!["text-to-braille", "braille-to-text", "image-to-braille"].includes(data.translationType)) {
    errors.push("Tipo de traducción inválido")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
