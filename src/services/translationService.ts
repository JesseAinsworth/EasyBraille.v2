import { getTranslationsCollection } from "@/lib/mongodb"
import type { Translation } from "@/models/Translation"

export async function saveTranslation(translationData: Omit<Translation, "_id">): Promise<Translation> {
  const collection = await getTranslationsCollection()
  const result = await collection.insertOne(translationData as any)
  return {
    ...translationData,
    _id: result.insertedId.toString(),
  }
}

export async function getUserTranslations(userId: string): Promise<Translation[]> {
  const collection = await getTranslationsCollection()
  return collection.find({ userId }).sort({ timestamp: -1 }).toArray()
}

export async function getTranslationById(id: string): Promise<Translation | null> {
  const collection = await getTranslationsCollection()
  return collection.findOne({ _id: id }) as Promise<Translation | null>
}

export async function deleteTranslation(id: string): Promise<boolean> {
  const collection = await getTranslationsCollection()
  const result = await collection.deleteOne({ _id: id })
  return result.deletedCount === 1
}

export async function deleteAllUserTranslations(userId: string): Promise<number> {
  const collection = await getTranslationsCollection()
  const result = await collection.deleteMany({ userId })
  return result.deletedCount || 0
}
