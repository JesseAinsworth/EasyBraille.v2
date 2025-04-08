import mongoose, { type Document, Schema } from "mongoose"

export interface ITranslation extends Document {
  userId: mongoose.Types.ObjectId
  originalText: string
  translatedText: string
  createdAt: Date
}

const TranslationSchema = new Schema<ITranslation>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  originalText: { type: String, required: true },
  translatedText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Translation || mongoose.model<ITranslation>("Translation", TranslationSchema)

