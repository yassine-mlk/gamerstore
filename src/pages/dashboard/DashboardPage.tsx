
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import { useTheme } from '@/contexts/ThemeContext';
import UserProfileMenu from '@/components/dashboard/UserProfileMenu';

const DashboardPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useTheme();

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'dark' : ''} bg-gray-50 dark:bg-blue-950`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`flex-1 transition-all duration-300 overflow-auto`}>
        <div className="container mx-auto p-6">
          <div className="flex justify-end mb-4">
            <UserProfileMenu />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
