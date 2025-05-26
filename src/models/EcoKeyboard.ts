import { ObjectId } from "mongodb"

export interface EcoKeyboard {
  _id: string
  userId: string
  brailleCode: string
  character: string
  actionType: string
  timestamp: Date
  deviceId?: string
}

// Tipo que representa el documento tal como se guarda en MongoDB
export interface EcoKeyboardDB extends Omit<EcoKeyboard, "_id"> {
  _id: ObjectId
}
