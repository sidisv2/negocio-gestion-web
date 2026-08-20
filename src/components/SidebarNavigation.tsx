'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, Wallet, Bot, Store } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Caja Rápida (POS)', href: '/pos', icon: ShoppingCart },
  { name: 'Inventario', href: '/inventario', icon: Package },
  { name: 'Caja & Gastos', href: '/caja', icon: Wallet },
  { name: 'Asistente IA', href: '/asistente-ia', icon: Bot },
];

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col justify-between p-4 shadow-xl border-r border-slate-800 shrink-0">
      <div>
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800 mb-6">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-600/30">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide text-white">Mi Negocio</h1>
            <span className="text-xs text-indigo-400 font-medium">Gestión & POS</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-base transition-all duration-200',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                )}
              >
                <Icon className={clsx('w-5 h-5', isActive ? 'text-white' : 'text-slate-400')} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 mt-6">
        <p className="text-xs text-slate-400 font-medium">Modo Producción</p>
        <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Sistema Listo
        </p>
      </div>
    </aside>
  );
}
