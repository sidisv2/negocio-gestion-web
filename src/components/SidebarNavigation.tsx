'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, PackageCheck, Bot, Wallet, Store, LogOut, User } from 'lucide-react';
import clsx from 'clsx';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const navItems = [
  { name: 'Métricas', href: '/', icon: BarChart3 },
  { name: 'Inventario', href: '/inventario', icon: PackageCheck },
  { name: 'Caja & Gastos', href: '/caja', icon: Wallet },
  { name: 'Asesora IA', href: '/asistente-ia', icon: Bot },
];

export function SidebarNavigation() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    window.location.href = '/login';
  };

  if (pathname === '/login') return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col justify-between p-5 shadow-2xl border-r border-slate-800 shrink-0 min-h-screen">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800/80 mb-6">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-wide text-white">Mi Negocio</h1>
              <span className="text-xs text-indigo-400 font-medium">Gestión & Analítica</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-2.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-semibold text-base transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/25 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  )}
                >
                  <Icon className={clsx('w-5 h-5', isActive ? 'text-white' : 'text-slate-400')} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile & Logout Section */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          {user ? (
            <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-9 h-9 rounded-full border border-indigo-500/50" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.user_metadata?.full_name || 'Paola'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-800 text-xs text-slate-400 font-medium">
              Usuario de Demostración
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 font-semibold py-2.5 px-3 rounded-xl border border-slate-700/60 transition-all flex items-center justify-center gap-2 text-xs"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-50 px-2 py-2 shadow-2xl">
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all',
                  isActive
                    ? 'text-indigo-400 font-bold bg-indigo-500/10'
                    : 'text-slate-400 font-medium hover:text-slate-200'
                )}
              >
                <Icon className={clsx('w-5 h-5 mb-1', isActive ? 'text-indigo-400' : 'text-slate-400')} />
                <span className="text-[11px] leading-tight text-center">{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
