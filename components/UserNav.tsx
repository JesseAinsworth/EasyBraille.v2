"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/droopdown-menu";
import { Button } from "@/components/ui/button";
import { History, Settings, LogOut, User } from "lucide-react";
import { useEffect, useState, memo, useCallback } from "react";

const UserNav = memo(function UserNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Definir primero los useCallback para mantener el orden de los hooks
  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        router.push("/login");
      } else {
        console.error("Error al cerrar sesión");
      }
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
    }
  }, [router]);

  const navigateTo = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allowedPaths = ["/translator", "/settings", "/history"];
  useEffect(() => {
    setShowMenu(allowedPaths.includes(pathname || ""));
  }, [pathname]);

  // No renderizar nada hasta que el componente esté montado
  if (!mounted) return null;

  if (!showMenu) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-white hover:bg-gray-100">
          <User className="h-5 w-5 text-skyblue" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigateTo("/history")}>
          <History className="mr-2 h-4 w-4" />
          <span>Historial</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigateTo("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export default UserNav;
