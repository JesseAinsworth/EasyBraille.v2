import { ObjectId } from "mongodb"

export interface AiInteraction {
  _id: string
  userId: string
  prompt: string
  response: string
  timestamp: Date
  metadata?: Record<string, any>
}

// Versión cruda que usa MongoDB (con ObjectId)
export interface AiInteractionDB extends Omit<AiInteraction, "_id"> {
  _id: ObjectId
}
