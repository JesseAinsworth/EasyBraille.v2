import { getAiInteractionsCollection } from "@/lib/mongodb"
import type { AiInteraction } from "@/models/AiInteraction"
import { ObjectId } from "mongodb"

export async function saveAiInteraction(interactionData: Omit<AiInteraction, "_id">): Promise<AiInteraction> {
  const collection = await getAiInteractionsCollection()

  const result = await collection.insertOne(interactionData as any)
  return {
    ...interactionData,
    _id: result.insertedId.toString(),
  }
}

export async function getUserAiInteractions(userId: string): Promise<AiInteraction[]> {
  const collection = await getAiInteractionsCollection()
  // Usar una sintaxis más directa para la consulta
  const results = await collection.find({ userId }).sort({ timestamp: -1 }).toArray()
  // Convertir los _id de ObjectId a string
  return results.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
  })) as unknown as AiInteraction[]
}

export async function getAiInteractionById(id: string): Promise<AiInteraction | null> {
  const collection = await getAiInteractionsCollection()
  try {
    // Usar una sintaxis más directa para la consulta
    const doc = await collection.findOne({ _id: new ObjectId(id) })
    if (!doc) return null
    // Convertir _id de ObjectId a string
    return {
      ...doc,
      _id: doc._id.toString(),
    } as unknown as AiInteraction
  } catch (error) {
    console.error("Error al convertir ID:", error)
    return null
  }
}

export async function deleteAiInteraction(id: string): Promise<boolean> {
  const collection = await getAiInteractionsCollection()
  try {
    // Usar una sintaxis más directa para la consulta
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
  } catch (error) {
    console.error("Error al eliminar interacción:", error)
    return false
  }
}
