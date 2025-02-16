import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-6 bg-white">
      <div className="text-center mb-8">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-01-21%20at%2011.25.54%20PM-52PYtCGtW2B1TpHkPJ8FIt38F7mlTL.jpeg"
          alt="EasyBraille Logo"
          width={300}
          height={300}
          className="mx-auto mb-4"
        />
        <h1 className="text-4xl font-bold mb-2 text-skyblue">Traductor de Braille a Español</h1>
        <p className="text-gray-600 mb-8">Traduciendo ideas</p>
      </div>
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/register"
          className="block w-full text-center py-3 px-4 rounded-lg shadow-md text-white bg-skyblue hover:bg-blue-400 transition-colors"
        >
          Registrarse
        </Link>
        <Link
          href="/login"
          className="block w-full text-center py-3 px-4 rounded-lg shadow-md text-skyblue bg-white border-2 border-skyblue hover:bg-gray-50 transition-colors"
        >
          Iniciar sesión
        </Link>
      </div>
    </main>
  )
}

