'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  Server,
  Rocket,
  FileText,
  Settings,
  User,
  Menu,
  X,
  LogOut,
  Bell,
  Moon,
  Sun,
  Activity
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/components/providers/auth-provider';
import { useWebSocket } from '@/components/providers/websocket-provider';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'APIs', href: '/dashboard/apis', icon: Globe },
  { name: 'MCP Servers', href: '/dashboard/servers', icon: Server },
  { name: 'Deployments', href: '/dashboard/deployments', icon: Rocket },
  { name: 'Monitoring', href: '/dashboard/monitoring', icon: Activity },
  { name: 'Documentation', href: '/dashboard/docs', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isConnected } = useWebSocket();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-800">
            <Logo
              variant="compact"
              href="/dashboard"
              animated={true}
            />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-neutral-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={cn(
                    "h-5 w-5 mr-3 transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-105"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* WebSocket Status */}
          <div className="px-4 py-2 border-t border-neutral-800">
            <div className="flex items-center space-x-2 text-sm">
              <div className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-red-500'
              )} />
              <span className="text-neutral-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* User info */}
          <div className="px-4 py-4 border-t border-neutral-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">{user?.full_name || user?.username}</p>
                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-neutral-800"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-white">
                {navigation.find(item =>
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                )?.name || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-neutral-800"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-neutral-800">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User menu */}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="hidden sm:inline-flex bg-neutral-700 text-neutral-200">
                {user?.role}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-neutral-800"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 bg-black min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
