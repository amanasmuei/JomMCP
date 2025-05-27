'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Database,
  Server,
  Cloud,
  FileText,
  Settings,
  User,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Zap,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'API Registrations', href: '/dashboard/registrations', icon: Database },
  { name: 'MCP Servers', href: '/dashboard/mcp-servers', icon: Server },
  { name: 'Deployments', href: '/dashboard/deployments', icon: Cloud },
  { name: 'Documentation', href: '/dashboard/docs', icon: FileText },
  { name: 'Administration', href: '/dashboard/admin', icon: Settings },
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
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col bg-card border-r border-border shadow-hard">
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">JomMCP</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r border-border">
          <div className="flex h-16 items-center px-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">JomMCP</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-8 w-8"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:inline-block">
                  {user.username}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
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
