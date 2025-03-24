"use client";


import Link from "next/link"
import Image from "next/image"
import UserNav from "@/components/UserNav"
import { usePathname } from "next/navigation"
import { useEffect, useState, memo } from "react"

// Memoize the component to prevent unnecessary re-renders
const NavBar = memo(function NavBar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Only run on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything on server side
  if (!mounted) return null

  // Only show navbar on translator, settings, and history pages
  const allowedPaths = ["/translator", "/settings", "/history"]
  if (!allowedPaths.includes(pathname || "")) {
    return null
  }

  return (
    <nav className="bg-skyblue p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2" prefetch={true}>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lgo22-removebg-preview-pdYh434AYK9kXdpDlHynBGuiT2J6TW.png"
            alt="EasyBraille Logo"
            width={100}
            height={100}
            className="w-16 h-16 object-contain"
            priority
          />
          <span className="text-white text-xl font-bold hidden sm:block">EasyBraille</span>
        </Link>
        <UserNav />
      </div>
    </nav>
  )
})

export default NavBar

