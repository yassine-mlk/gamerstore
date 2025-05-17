import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Users,
  LogOut,
  ShoppingCart,
  BarChart3
} from 'lucide-react';

const menuItems = [
  {
    title: 'Tableau de bord',
    icon: LayoutDashboard,
    href: '/dashboard'
  },
  {
    title: 'Ventes',
    icon: ShoppingCart,
    href: '/dashboard/ventes'
  },
  {
    title: 'Produits',
    icon: Package,
    href: '/dashboard/produits'
  },
  {
    title: 'Clients',
    icon: Users,
    href: '/dashboard/clients'
  },
  {
    title: 'Rapports',
    icon: BarChart3,
    href: '/dashboard/rapports'
  }
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <img src="/logo.png" alt="Logo" className="h-8 w-8" />
          <span>GamerStore</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900',
                location.pathname === item.href && 'bg-gray-100 text-gray-900'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900"
          onClick={() => {
            // Gérer la déconnexion ici
          }}
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );
} 