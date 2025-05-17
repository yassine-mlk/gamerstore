import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  FileText,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Settings,
  ShoppingCart,
  UserCircle,
  CheckSquare,
  Crown,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

interface SidebarItem {
  title: string;
  path: string;
  icon: React.ElementType;
  roles?: string[]; // Which roles can see this item
}

const items: SidebarItem[] = [
  {
    title: 'Tableau de bord',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'team', 'super'],
  },
  {
    title: 'Clients',
    path: '/dashboard/clients',
    icon: Users,
    roles: ['admin', 'team'],
  },
  {
    title: 'Fournisseurs',
    path: '/dashboard/fournisseurs',
    icon: Users,
    roles: ['admin'],
  },
  {
    title: 'Stock',
    path: '/dashboard/stock',
    icon: Package,
    roles: ['admin', 'team'],
  },
  {
    title: 'Ventes',
    path: '/dashboard/ventes',
    icon: ShoppingCart,
    roles: ['admin', 'team'],
  },
  {
    title: 'Devis',
    path: '/dashboard/devis',
    icon: Receipt,
    roles: ['admin', 'team'],
  },
  {
    title: 'Équipe',
    path: '/dashboard/team',
    icon: UserCircle,
    roles: ['admin'],
  },
  {
    title: 'Livraisons',
    path: '/dashboard/livraisons',
    icon: Truck,
    roles: ['admin', 'team'],
  },
  {
    title: 'Factures',
    path: '/dashboard/factures',
    icon: FileText,
    roles: ['admin'],
  },
  {
    title: 'Tâches',
    path: '/dashboard/tasks',
    icon: CheckSquare,
    roles: ['admin', 'team'],
  },
  {
    title: 'Paramètres',
    path: '/dashboard/parametres',
    icon: Settings,
    roles: ['admin'],
  },
  {
    title: 'Admin Platform',
    path: '/dashboard/admin',
    icon: Crown,
    roles: ['super'],
  },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logo, businessName, logoLoading } = useTheme();
  
  // For demo purposes, we'll use a hardcoded role
  // In a real app, this would come from authentication
  // Adding 'super' role for the platform owner
  const userRole = localStorage.getItem('userRole') || 'admin'; // 'admin', 'team' or 'super'

  const filteredItems = items.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div 
      className={cn(
        "h-screen border-r bg-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <div className={cn(
          "flex items-center gap-2",
          collapsed ? "justify-center flex-grow" : ""
        )}>
          <div className={cn(
            "h-8 flex items-center justify-center",
            collapsed ? "w-8 mx-auto" : "w-auto"
          )}>
            {logo ? (
              <img 
                src={logo} 
                alt="Logo" 
                className={cn(
                  "h-8 w-auto object-contain transition-all duration-300",
                  logoLoading ? "opacity-0" : "opacity-100"
                )}
                onError={(e) => {
                  e.currentTarget.src = "/logo.png";
                }} 
              />
            ) : (
              <div className="h-8 w-8 rounded-md bg-sidebar-accent/20 animate-pulse" />
            )}
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-primary">
              {businessName}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={collapsed ? "ml-0" : "ml-auto"}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="flex flex-col flex-1 py-4 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {filteredItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-2")} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className={cn(
            "flex items-center w-full text-red-500 hover:text-red-600 hover:bg-red-50",
            collapsed ? "justify-center" : "justify-start"
          )}
          onClick={handleLogout}
        >
          <LogIn className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
          {!collapsed && <span>Déconnexion</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
