"use client";


import { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";

const BrailleTranslator = memo(function BrailleTranslator() {
  const [brailleInput, setBrailleInput] = useState("");
  const [spanishOutput, setSpanishOutput] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const router = useRouter();

  const translateBraille = useCallback(async () => {
    if (!brailleInput.trim()) return;

    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ braille: brailleInput }),
      });

      if (!response.ok) {
        throw new Error(`Error en la traducción: ${response.status}`);
      }

      const data = await response.json();
      setSpanishOutput(data.spanish);
    } catch (error) {
      console.error("Error al traducir:", error);
      setSpanishOutput("Error al traducir. Por favor, intenta de nuevo.");
    } finally {
      setIsTranslating(false);
    }
  }, [brailleInput]);

  const handleGoToHistory = useCallback(() => {
    router.push("/history");
  }, [router]);

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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          rows={4}
        />
      </div>

      <button
        onClick={translateBraille}
        disabled={isTranslating || !brailleInput.trim()}
        className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:opacity-50"
      >
        {isTranslating ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Traduciendo...
          </span>
        ) : (
          "Traducir"
        )}
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
          aria-live="polite"
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
          rows={4}
        />
      </div>

      <button
        onClick={handleGoToHistory}
        className="w-full py-2 px-4 border border-sky-500 rounded-md shadow-sm text-sky-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
      >
        Ver Historial
      </button>
    </div>
  );
});

export default BrailleTranslator;
