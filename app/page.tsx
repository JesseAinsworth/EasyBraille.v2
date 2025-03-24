import Link from "next/link"
import Image from "next/image"
import "./gradient-animation.css"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center animated-gradient-bg p-6">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl shadow-xl bg-white/30 backdrop-blur-md">
        <div className="flex flex-col md:flex-row">
          {/* Sección izquierda con información */}
          <div className="p-8 md:w-1/2 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-black mb-4">Traductor de Braille a Español</h1>
            <p className="text-black/80 mb-8">Traduciendo ideas de forma simple y accesible</p>

            <div className="space-y-4 mt-4">
              <Link
                href="/register"
                className="block w-full text-center py-3 px-4 rounded-lg shadow-md text-skyblue bg-white hover:bg-blue-50 transition-colors font-medium"
              >
                Registrarse
              </Link>
              <Link
                href="/login"
                className="block w-full text-center py-3 px-4 rounded-lg shadow-md text-black bg-white/20 border border-white hover:bg-white/30 transition-colors"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>

          {/* Sección derecha con logo */}
          <div className="hidden md:flex md:w-1/2 bg-white rounded-r-3xl p-8 items-center justify-center">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lgo22-removebg-preview-pdYh434AYK9kXdpDlHynBGuiT2J6TW.png"
                  alt="EasyBraille Logo"
                  width={200}
                  height={200}
                />
              </div>
              <h2 className="text-2xl font-bold text-skyblue mb-4">EasyBraille</h2>
              <p className="text-gray-500">La forma más sencilla de traducir Braille</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

