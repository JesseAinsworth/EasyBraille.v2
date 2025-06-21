import { getAiInteractionsCollection } from "@/lib/mongodb"
import type { AiInteraction, AiInteractionDB } from "@/models/AiInteraction"
import { ObjectId } from "mongodb"

// Convierte documento de MongoDB (con ObjectId) a AiInteraction (con string)
function convertToAiInteraction(doc: AiInteractionDB | null): AiInteraction | null {
  if (!doc) return null
  return {
    _id: doc._id.toString(),
    userId: doc.userId,
    prompt: doc.prompt,
    response: doc.response,
    timestamp: doc.timestamp,
    metadata: doc.metadata,
  }
}

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
  const documents = await collection.find({ userId }).sort({ timestamp: -1 }).toArray()

  return documents.map(convertToAiInteraction).filter(Boolean) as AiInteraction[]
}

export async function getAiInteractionById(id: string): Promise<AiInteraction | null> {
  try {
    const collection = await getAiInteractionsCollection()
    const objectId = new ObjectId(id)
    const document = await collection.findOne({ _id: objectId })
    return convertToAiInteraction(document)
  } catch (error) {
    console.error("Error al obtener interacción por ID:", error)
    return null
  }
}

export async function deleteAiInteraction(id: string): Promise<boolean> {
  try {
    const collection = await getAiInteractionsCollection()
    const objectId = new ObjectId(id)
    const result = await collection.deleteOne({ _id: objectId })
    return result.deletedCount === 1
  } catch (error) {
    console.error("Error al eliminar interacción:", error)
    return false
  }
}
