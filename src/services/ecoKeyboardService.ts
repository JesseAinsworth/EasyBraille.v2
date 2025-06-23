import { getEcoKeyboardsCollection } from "@/lib/mongodb"
import type { EcoKeyboard } from "@/models/EcoKeyboard"
import { ObjectId, type Document } from "mongodb"

// Convierte un documento de MongoDB a un objeto EcoKeyboard
function convertToEcoKeyboard(doc: Document | null): EcoKeyboard | null {
  if (!doc) return null

  const { _id, userId, brailleCode, character, actionType, timestamp, deviceId } = doc

  if (!_id) {
    console.error("Documento sin _id encontrado")
    return null
  }

  return {
    _id: _id.toString(),
    userId,
    brailleCode,
    character,
    actionType,
    timestamp,
    deviceId,
  }
}

// Insertar una nueva acción de teclado
export async function logKeyboardAction(
  keyboardData: Omit<EcoKeyboard, "_id">
): Promise<EcoKeyboard> {
  try {
    const collection = await getEcoKeyboardsCollection()
    const result = await collection.insertOne(keyboardData)

    return {
      ...keyboardData,
      _id: result.insertedId.toString(),
    }
  } catch (error) {
    console.error("Error al insertar acción de teclado:", error)
    throw new Error("Error al guardar acción de teclado")
  }
}

// Obtener acciones de un usuario específico
export async function getUserKeyboardActions(userId: string): Promise<EcoKeyboard[]> {
  try {
    const collection = await getEcoKeyboardsCollection()
    const documents = await collection.find({ userId }).sort({ timestamp: -1 }).toArray()

    return documents
      .map(convertToEcoKeyboard)
      .filter((item): item is EcoKeyboard => item !== null)
  } catch (error) {
    console.error("Error al obtener acciones de teclado:", error)
    throw new Error("Error al obtener las acciones del usuario")
  }
}

// Obtener acción por ID
export async function getKeyboardActionById(id: string): Promise<EcoKeyboard | null> {
  try {
    const collection = await getEcoKeyboardsCollection()
    const objectId = new ObjectId(id)
    const document = await collection.findOne({ _id: objectId })

    return convertToEcoKeyboard(document)
  } catch (error) {
    console.error("Error al obtener acción de teclado por ID:", error)
    return null
  }
}

// Obtener las acciones más recientes
export async function getRecentKeyboardActions(limit = 100): Promise<EcoKeyboard[]> {
  try {
    const collection = await getEcoKeyboardsCollection()
    const documents = await collection.find({}).sort({ timestamp: -1 }).limit(limit).toArray()

    return documents
      .map(convertToEcoKeyboard)
      .filter((item): item is EcoKeyboard => item !== null)
  } catch (error) {
    console.error("Error al obtener acciones recientes de teclado:", error)
    throw new Error("Error al obtener acciones recientes")
  }
}

// Eliminar acción por ID
export async function deleteKeyboardAction(id: string): Promise<boolean> {
  try {
    const collection = await getEcoKeyboardsCollection()
    const objectId = new ObjectId(id)
    const result = await collection.deleteOne({ _id: objectId })

    return result.deletedCount === 1
  } catch (error) {
    console.error("Error al eliminar acción de teclado:", error)
    return false
  }
}
