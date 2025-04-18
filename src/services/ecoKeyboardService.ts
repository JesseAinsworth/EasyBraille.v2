import { getEcoKeyboardsCollection } from "@/lib/mongodb"
import type { EcoKeyboard } from "@/models/EcoKeyboard"
import { ObjectId } from "mongodb"

export async function createEcoKeyboard(
  keyboardData: Omit<EcoKeyboard, "_id" | "createdAt" | "updatedAt">,
): Promise<EcoKeyboard> {
  const collection = await getEcoKeyboardsCollection()

  const now = new Date()
  const newKeyboard: EcoKeyboard = {
    ...keyboardData,
    createdAt: now,
    updatedAt: now,
  }

  const result = await collection.insertOne(newKeyboard as any)
  return {
    ...newKeyboard,
    _id: result.insertedId.toString(),
  }
}

export async function getUserEcoKeyboards(userId: string): Promise<EcoKeyboard[]> {
  const collection = await getEcoKeyboardsCollection()
  return collection.find({ userId }).sort({ createdAt: -1 }).toArray() as Promise<EcoKeyboard[]>
}

export async function getEcoKeyboardById(id: string): Promise<EcoKeyboard | null> {
  const collection = await getEcoKeyboardsCollection()
  return collection.findOne({ _id: id }) as Promise<EcoKeyboard | null>
}

export async function updateEcoKeyboard(id: string, keyboardData: Partial<EcoKeyboard>): Promise<EcoKeyboard | null> {
  const collection = await getEcoKeyboardsCollection()

  const updateData = {
    ...keyboardData,
    updatedAt: new Date(),
  }

  await collection.updateOne({ _id: id }, { $set: updateData })

  return getEcoKeyboardById(id)
}

export async function deleteEcoKeyboard(id: string): Promise<boolean> {
  const collection = await getEcoKeyboardsCollection()
  const result = await collection.deleteOne({ _id: id })
  return result.deletedCount === 1
}

export async function getDefaultEcoKeyboard(userId: string): Promise<EcoKeyboard | null> {
  const collection = await getEcoKeyboardsCollection()
  return collection.findOne({ userId, isDefault: true }) as Promise<EcoKeyboard | null>
}

export async function setDefaultEcoKeyboard(id: string, userId: string): Promise<boolean> {
  const collection = await getEcoKeyboardsCollection()

  // Primero, quitar el estado predeterminado de todos los teclados del usuario
  await collection.updateMany({ userId }, { $set: { isDefault: false } })

  // Luego, establecer el teclado seleccionado como predeterminado
  const result = await collection.updateOne(
    { _id: id, userId },
    { $set: { isDefault: true, updatedAt: new Date() } },
  )

  return result.modifiedCount === 1
}
