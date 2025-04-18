export interface EcoKeyboard {
    _id?: string
    userId: string
    name: string
    layout: Record<string, string>
    isDefault: boolean
    createdAt: Date
    updatedAt: Date
  }
  