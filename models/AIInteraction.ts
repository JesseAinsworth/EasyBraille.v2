import mongoose, { type Document, Schema } from "mongoose"

export interface IAIInteraction extends Document {
  userId: mongoose.Types.ObjectId
  inputText: string
  expectedOutput: string
  manualCorrection?: string
  accuracy?: number
  createdAt: Date
}

const AIInteractionSchema = new Schema<IAIInteraction>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  inputText: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  manualCorrection: { type: String },
  accuracy: { type: Number, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.AIInteraction || mongoose.model<IAIInteraction>("AIInteraction", AIInteractionSchema)

