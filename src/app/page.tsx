import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BlindsIcon as Braille, Globe, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <section className="flex-1 py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Traductor de Braille a Español y viceversa
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Traduce fácilmente entre Braille y español con nuestra herramienta intuitiva. Perfecta para estudiantes,
                educadores y personas con discapacidad visual.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/translator">
                <Button size="lg" className="gap-2">
                  Comenzar a traducir <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg">
                  Crear cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="bg-primary/10 p-4 rounded-full">
                <Braille className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Traducciones con IA y Teclado fisico de Braille</h3>
                <p className="text-muted-foreground">
                  Para traducciones de Braille a Español y Viceversa.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="bg-primary/10 p-4 rounded-full">
                <Globe className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Accesible en Cualquier Lugar</h3>
                <p className="text-muted-foreground">
                  Accede a nuestra herramienta desde cualquier dispositivo, en cualquier momento.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="bg-primary/10 p-4 rounded-full">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Para Todos los Usuarios</h3>
                <p className="text-muted-foreground">
                  Diseñado para ser utilizado por personas con y sin discapacidad visual.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
