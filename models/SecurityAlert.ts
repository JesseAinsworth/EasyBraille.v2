import mongoose, { type Document, Schema } from "mongoose"

export interface ISecurityAlert extends Document {
  type: string
  severity: string
  message: string
  details?: any
  ipAddress?: string
  userId?: mongoose.Types.ObjectId
  resolved: boolean
  resolvedBy?: mongoose.Types.ObjectId
  resolvedAt?: Date
  createdAt: Date
}

const SecurityAlertSchema = new Schema<ISecurityAlert>({
  type: {
    type: String,
    required: true,
    enum: ["failed_login", "multiple_failed_logins", "unauthorized_access", "suspicious_activity", "database_change"],
  },
  severity: {
    type: String,
    required: true,
    enum: ["low", "medium", "high", "critical"],
  },
  message: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.SecurityAlert || mongoose.model<ISecurityAlert>("SecurityAlert", SecurityAlertSchema)

