import mongoose, { type Document, Schema } from "mongoose"

export interface IEcoKeyboard extends Document {
  userId: mongoose.Types.ObjectId
  configuration: {
    layout?: string
    theme?: string
    sensitivity?: number
    customKeys?: Map<string, string>
  }
  history: Array<{
    action: string
    timestamp: Date
  }>
  createdAt: Date
}

const EcoKeyboardSchema = new Schema<IEcoKeyboard>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  configuration: {
    layout: { type: String, default: "standard" },
    theme: { type: String, default: "light" },
    sensitivity: { type: Number, default: 5, min: 1, max: 10 },
    customKeys: { type: Map, of: String, default: {} },
  },
  history: [
    {
      action: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.EcoKeyboard || mongoose.model<IEcoKeyboard>("EcoKeyboard", EcoKeyboardSchema)

