import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SidebarNavigation } from '@/components/SidebarNavigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Atuel Celulares | Gestión & Analítica',
  description: 'Aplicación moderna de gestión, inventario, caja y consultoría con IA para Atuel Celulares',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-[#07090e] text-slate-100 min-h-screen flex flex-col md:flex-row antialiased selection:bg-violet-500 selection:text-white relative overflow-x-hidden`}>
        {/* Ambient Glow Effects */}
        <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="fixed top-0 right-0 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="fixed bottom-0 left-1/3 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

        <SidebarNavigation />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
