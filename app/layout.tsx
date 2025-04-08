import type { Metadata } from "next"
import type React from "react"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
  title: "EasyBraille - Traductor de Braille a Español",
  description: "Traduciendo ideas - Traductor de Braille a Español",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}

