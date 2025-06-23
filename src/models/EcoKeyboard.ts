import type { ObjectId } from "mongodb"

// Modelo usado al guardar en MongoDB
export interface EcoKeyboard {
  _id: string | ObjectId // Puede venir como ObjectId o string
  userId: string | ObjectId
  brailleCode: string
  character: string
  actionType: "keyPress" | "delete" | "submit" | "other"
  timestamp: Date
  deviceId?: string
}

// Datos usados al crear una nueva acción (sin _id aún)
export interface CreateEcoKeyboardData {
  userId: string
  brailleCode: string
  character: string
  actionType: "keyPress" | "delete" | "submit" | "other"
  timestamp: Date
  deviceId?: string
}
