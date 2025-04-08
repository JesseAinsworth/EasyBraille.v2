import mongoose, { type Document, Schema } from "mongoose"

export interface IPerformanceMetric extends Document {
  endpoint: string
  method: string
  responseTime: number
  statusCode: number
  userAgent?: string
  ipAddress?: string
  userId?: mongoose.Types.ObjectId
  timestamp: Date
}

const PerformanceMetricSchema = new Schema<IPerformanceMetric>({
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  responseTime: { type: Number, required: true }, // en milisegundos
  statusCode: { type: Number, required: true },
  userAgent: { type: String },
  ipAddress: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
})

// Índices para consultas eficientes
PerformanceMetricSchema.index({ endpoint: 1, timestamp: -1 })
PerformanceMetricSchema.index({ responseTime: -1 })

export default mongoose.models.PerformanceMetric ||
  mongoose.model<IPerformanceMetric>("PerformanceMetric", PerformanceMetricSchema)

