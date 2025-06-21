import { getEcoKeyboardsCollection } from "@/lib/mongodb";
import type { EcoKeyboard } from "@/models/EcoKeyboard";
import { ObjectId, type Document } from "mongodb";

// Función auxiliar para convertir documentos de MongoDB a nuestro tipo EcoKeyboard
function convertToEcoKeyboard(doc: Document | null): EcoKeyboard | null {
  if (!doc) return null;
  
  // Verificamos que _id exista en el documento antes de convertirlo
  const { _id, userId, brailleCode, character, actionType, timestamp, deviceId } = doc;

  if (!_id) {
    console.error("Documento sin _id encontrado");
    return null;
  }

  return {
    _id: _id.toString(), // Convertir ObjectId a string
    userId,
    brailleCode,
    character,
    actionType,
    timestamp,
    deviceId,
  };
}

// Log de una acción de teclado, insertando un nuevo registro en la base de datos
export async function logKeyboardAction(keyboardData: Omit<EcoKeyboard, "_id">): Promise<EcoKeyboard> {
  try {
    const collection = await getEcoKeyboardsCollection();
    const result = await collection.insertOne(keyboardData);

    return {
      ...keyboardData,
      _id: result.insertedId.toString(), // Convertir ObjectId a string
    };
  } catch (error) {
    console.error("Error al insertar acción de teclado:", error);
    throw new Error("Error al guardar acción de teclado");
  }
}

// Obtener todas las acciones de teclado de un usuario específico
export async function getUserKeyboardActions(userId: string): Promise<EcoKeyboard[]> {
  try {
    const collection = await getEcoKeyboardsCollection();
    const cursor = collection.find({ userId });
    const documents = await cursor.sort({ timestamp: -1 }).toArray();

    return documents
      .map(convertToEcoKeyboard)
      .filter((item): item is EcoKeyboard => item !== null);
  } catch (error) {
    console.error("Error al obtener acciones de teclado:", error);
    throw new Error("Error al obtener las acciones del usuario");
  }
}

// Obtener una acción de teclado por su ID
export async function getKeyboardActionById(id: string): Promise<EcoKeyboard | null> {
  try {
    const collection = await getEcoKeyboardsCollection();
    const objectId = new ObjectId(id); // Convertir string a ObjectId
    const document = await collection.findOne({ _id: objectId });

    return convertToEcoKeyboard(document);
  } catch (error) {
    console.error("Error al obtener acción de teclado por ID:", error);
    return null;
  }
}

// Obtener las acciones de teclado más recientes con un límite específico
export async function getRecentKeyboardActions(limit = 100): Promise<EcoKeyboard[]> {
  try {
    const collection = await getEcoKeyboardsCollection();
    const cursor = collection.find({});
    const documents = await cursor.sort({ timestamp: -1 }).limit(limit).toArray();

    return documents
      .map(convertToEcoKeyboard)
      .filter((item): item is EcoKeyboard => item !== null);
  } catch (error) {
    console.error("Error al obtener acciones recientes de teclado:", error);
    throw new Error("Error al obtener acciones recientes");
  }
}

// Eliminar una acción de teclado por su ID
export async function deleteKeyboardAction(id: string): Promise<boolean> {
  try {
    const collection = await getEcoKeyboardsCollection();
    const objectId = new ObjectId(id); // Convertir string a ObjectId
    const result = await collection.deleteOne({ _id: objectId });

    return result.deletedCount === 1; // Verificar si se eliminó el documento
  } catch (error) {
    console.error("Error al eliminar acción de teclado:", error);
    return false;
  }
}
