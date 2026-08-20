import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarNavigation } from "@/components/SidebarNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gestión & Analítica - Mi Negocio",
  description: "Sistema de Control de Caja, Inventario y Consultoría IA para Negocio Minorista",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white pb-20 md:pb-0`}>
        <SidebarNavigation />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
