import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md overflow-hidden rounded-3xl shadow-xl">
        {/* Sección con fondo de color */}
        <div className="relative bg-gradient-to-br from-skyblue to-blue-300 p-8 text-white">
          {/* Círculos decorativos */}
          <div className="absolute top-12 left-6 w-16 h-16 rounded-full bg-white/20"></div>
          <div className="absolute bottom-20 right-8 w-24 h-24 rounded-full bg-white/20"></div>
          <div className="absolute bottom-40 left-12 w-10 h-10 rounded-full bg-white/20"></div>

          {/* Logo y texto */}
          <div className="mt-12 mb-8 flex justify-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-01-21%20at%2011.25.54%20PM-52PYtCGtW2B1TpHkPJ8FIt38F7mlTL.jpeg"
              alt="EasyBraille Logo"
              width={150}
              height={150}
              className="rounded-full"
            />
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">Traductor de Braille a Español</h1>
          <p className="text-center text-blue-50 mb-8">Traduciendo ideas</p>

          <div className="space-y-4 mt-8">
            <Link
              href="/register"
              className="block w-full text-center py-3 px-4 rounded-lg shadow-md text-skyblue bg-white hover:bg-blue-50 transition-colors font-medium"
            >
              Registrarse
            </Link>
            <Link
              href="/login"
              className="block w-full text-center py-3 px-4 rounded-lg shadow-md text-white bg-white/20 border border-white hover:bg-white/30 transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

