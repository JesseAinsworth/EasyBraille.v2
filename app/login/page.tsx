import LoginForm from "../../components/LoginForm"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import "../gradient-animation.css"

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient-bg p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl shadow-xl bg-white/30 backdrop-blur-md">
        <div className="flex flex-col md:flex-row">
          {/* Sección izquierda con formulario */}
          <div className="p-8 md:w-1/2 flex flex-col justify-center">
            <Link href="/" className="inline-flex items-center text-white hover:text-blue-100 transition-colors mb-8">
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span>Volver</span>
            </Link>

            <h1 className="text-3xl font-bold text-center mb-8 text-white">LOGIN</h1>

            <LoginForm />

            <div className="mt-6 text-center">
              <p className="text-white/80 mb-2">¿No tienes una cuenta?</p>
              <Link href="/register" className="text-white hover:text-blue-100 transition-colors">
                Registrarse
              </Link>
            </div>

            {/* Enlace para administradores */}
            <div className="mt-8 pt-4 border-t border-white/20 text-center">
              <p className="text-white/60 text-sm mb-2">¿Eres administrador?</p>
              <Link href="/admin-login" className="text-white/70 text-sm hover:text-white transition-colors">
                Acceso para administradores
              </Link>
            </div>
          </div>

          {/* Sección derecha con imagen */}
          <div className="hidden md:flex md:w-1/2 bg-white rounded-r-3xl p-8 items-center justify-center">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lgo22-removebg-preview-pdYh434AYK9kXdpDlHynBGuiT2J6TW.png"
                  alt="EasyBraille Logo"
                  width={150}
                  height={150}
                />
              </div>
              <h2 className="text-2xl font-bold text-skyblue mb-4">EasyBraille</h2>
              <p className="text-gray-500">Traductor de Braille a Español</p>
              <p className="text-gray-400 mt-2">Traduciendo ideas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

