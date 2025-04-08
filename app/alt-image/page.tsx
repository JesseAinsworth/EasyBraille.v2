import AlternativeImageProcessor from "@/components/AlternativeImageProcessor"

export default function AlternativeImagePage() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-skyblue">Procesador Alternativo de Imágenes</h1>
        <AlternativeImageProcessor />
      </div>
    </main>
  )
}

