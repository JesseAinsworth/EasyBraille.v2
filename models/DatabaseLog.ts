import mongoose, { type Document, Schema } from "mongoose"

// Definir la interfaz sin extender directamente de Document
interface DatabaseLogAttributes {
  action: string
  collectionName: string // Cambiado de 'collection' a 'collectionName'
  documentId?: mongoose.Types.ObjectId
  userId?: mongoose.Types.ObjectId
  details?: any
  ipAddress?: string
  timestamp: Date
}

// Usar Document<any, any, DatabaseLogAttributes> para el tipado correcto
export interface IDatabaseLog extends Document<any, any, DatabaseLogAttributes>, DatabaseLogAttributes {}

const DatabaseLogSchema = new Schema<DatabaseLogAttributes>({
  action: { type: String, required: true }, // 'create', 'update', 'delete', 'read', 'security_alert'
  collectionName: { type: String, required: true }, // Cambiado de 'collection' a 'collectionName'
  documentId: { type: Schema.Types.ObjectId },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now },
})

export default mongoose.models.DatabaseLog || mongoose.model<IDatabaseLog>("DatabaseLog", DatabaseLogSchema)

