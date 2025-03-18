import LoginForm from "../../components/LoginForm"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl shadow-xl">
        {/* Sección izquierda con fondo de color */}
        <div className="relative bg-gradient-to-br from-skyblue to-blue-300 p-8 text-white">
          {/* Botón de volver */}
          <Link
            href="/"
            className="inline-flex items-center text-white hover:text-blue-100 transition-colors absolute top-4 left-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Volver</span>
          </Link>

          {/* Círculos decorativos */}
          <div className="absolute top-12 left-6 w-16 h-16 rounded-full bg-white/20"></div>
          <div className="absolute bottom-20 right-8 w-24 h-24 rounded-full bg-white/20"></div>
          <div className="absolute bottom-40 left-12 w-10 h-10 rounded-full bg-white/20"></div>

          {/* Logo y texto */}
          <div className="mt-12 mb-8 flex justify-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-01-21%20at%2011.25.54%20PM-52PYtCGtW2B1TpHkPJ8FIt38F7mlTL.jpeg"
              alt="EasyBraille Logo"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">¡Bienvenido!</h1>
          <p className="text-center text-blue-50 mb-8">Ingresa tus credenciales para acceder a tu cuenta</p>

          {/* Botón de registro en la parte inferior */}
          <div className="mt-12 text-center">
            <p className="text-blue-50 mb-2">¿No tienes una cuenta?</p>
            <Link
              href="/register"
              className="inline-block bg-white text-skyblue font-medium py-2 px-6 rounded-full hover:bg-blue-50 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>

        {/* Sección derecha con formulario */}
        <div className="bg-white p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar sesión</h2>
          <LoginForm />

          {/* Opciones de inicio de sesión social */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continuar con</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-3">
              <button className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50">
                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </button>
              <button className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </button>
              <button className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
              </button>
              <button className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

