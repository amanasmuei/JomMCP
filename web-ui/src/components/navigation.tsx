'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/providers/auth-provider';
import {
  CpuChipIcon,
  HomeIcon,
  CogIcon,
  CloudIcon,
  DocumentTextIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'API Registrations', href: '/dashboard/registrations', icon: CogIcon },
  { name: 'MCP Servers', href: '/dashboard/mcp-servers', icon: CpuChipIcon },
  { name: 'Deployments', href: '/dashboard/deployments', icon: CloudIcon },
  { name: 'Documentation', href: '/dashboard/docs', icon: DocumentTextIcon },
  { name: 'Administration', href: '/dashboard/admin', icon: ShieldCheckIcon },
];

interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <CpuChipIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">MCP Hub</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center px-4">
            <CpuChipIcon className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">MCP Hub</span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 lg:hidden"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 rounded-md"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{user.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
