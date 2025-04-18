export interface Translation {
    _id?: string
    userId: string
    inputText: string
    outputText: string
    direction: "tobraille" | "frombraille"
    timestamp: Date
  }
  