"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function BrailleTranslator() {
  const [brailleInput, setBrailleInput] = useState("")
  const [spanishOutput, setSpanishOutput] = useState("")
  const router = useRouter()

  const translateBraille = async () => {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ braille: brailleInput }),
    })
    const data = await response.json()
    setSpanishOutput(data.spanish)
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <label htmlFor="braille-input" className="block text-sm font-medium text-gray-700">
          Texto en Braille
        </label>
        <textarea
          id="braille-input"
          placeholder="Ingrese texto en Braille aquí..."
          value={brailleInput}
          onChange={(e) => setBrailleInput(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-skyblue focus:border-transparent"
          rows={4}
        />
      </div>

      <button
        onClick={translateBraille}
        className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-skyblue hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skyblue transition-colors"
      >
        Traducir
      </button>

      <div className="space-y-2">
        <label htmlFor="spanish-output" className="block text-sm font-medium text-gray-700">
          Traducción al Español
        </label>
        <textarea
          id="spanish-output"
          placeholder="Traducción al español..."
          value={spanishOutput}
          readOnly
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
          rows={4}
        />
      </div>

      <button
        onClick={() => router.push("/history")}
        className="w-full py-2 px-4 border border-skyblue rounded-md shadow-sm text-skyblue bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-skyblue transition-colors"
      >
        Ver Historial
      </button>
    </div>
  )
}

