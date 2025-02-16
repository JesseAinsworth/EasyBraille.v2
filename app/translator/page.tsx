import BrailleTranslator from "../../components/BrailleTranslator"

export default function Translator() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-skyblue">Traductor de Braille a Español</h1>
        <BrailleTranslator />
      </div>
    </main>
  )
}

