import dynamic from "next/dynamic";
import { Suspense } from "react";
import Loading from "@/components/Loading";

// Importa el componente dinámicamente SIN `ssr: false`
const BrailleTranslator = dynamic(() => import("@/components/BrailleTranslator"), {
  loading: () => <div className="p-4 text-center">Cargando traductor...</div>,
});

export default function Translator() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-skyblue">
          Traductor de Braille a Español
        </h1>
        <Suspense fallback={<Loading />}>
          <BrailleTranslator />
        </Suspense>
      </div>
    </main>
  );
}
