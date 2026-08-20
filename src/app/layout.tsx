import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SidebarNavigation } from '@/components/SidebarNavigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Atuel Celulares | Gestión & Analítica',
  description: 'Aplicación moderna de gestión, inventario, caja y consultoría con IA para Atuel Celulares',
  manifest: '/manifest.json',
  themeColor: '#0b0f19',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-[#0b0f19] text-slate-100 min-h-screen flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white`}>
        <SidebarNavigation />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
