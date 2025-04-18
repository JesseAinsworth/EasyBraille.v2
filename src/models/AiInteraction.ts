export interface AiInteraction {
  _id?: string
  userId: string
  prompt: string
  response: string
  timestamp: Date
  metadata?: Record<string, any>
}
