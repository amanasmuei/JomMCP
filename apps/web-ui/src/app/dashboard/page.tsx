'use client';

import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { registrationsApi } from '@/lib/api/registrations';
import { generationApi } from '@/lib/api/generation';
import { deploymentsApi } from '@/lib/api/deployments';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import { formatRelativeTime, getStatusColor } from '@/lib/utils';
import {
  Plus,
  Database,
  Server,
  Cloud,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  Users,
  Zap,
  LayoutDashboard,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['api-registrations'],
    queryFn: () => registrationsApi.list({ page: 1, size: 10 }),
    enabled: !!user,
  });

  const { data: mcpServers, isLoading: mcpLoading } = useQuery({
    queryKey: ['mcp-servers'],
    queryFn: () => generationApi.list({ page: 1, size: 10 }),
    enabled: !!user,
  });

  const { data: deployments, isLoading: deploymentsLoading } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => deploymentsApi.list({ page: 1, size: 10 }),
    enabled: !!user,
  });

  const { data: healthStatus } = useQuery({
    queryKey: ['health-status'],
    queryFn: () => apiClient.healthCheck(),
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const isLoading = registrationsLoading || mcpLoading || deploymentsLoading;

  if (!user) {
    return <div>Loading...</div>;
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user.username}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your API registrations and MCP servers from your dashboard
        </p>
      </div>

      {/* System Health Status */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">System Health</h3>
            <div className="flex items-center space-x-2">
              {healthStatus?.status === 'healthy' ? (
                <CheckCircle className="h-4 w-4 text-success-500" />
              ) : healthStatus?.status === 'degraded' ? (
                <Activity className="h-4 w-4 text-warning-500" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <Badge variant={
                healthStatus?.status === 'healthy' ? 'success' :
                healthStatus?.status === 'degraded' ? 'warning' :
                'destructive'
              }>
                {healthStatus?.status || 'Unknown'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Registrations</p>
                <p className="text-2xl font-bold">{registrations?.total || 0}</p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">MCP Servers</p>
                <p className="text-2xl font-bold">{mcpServers?.total || 0}</p>
              </div>
              <Server className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Deployments</p>
                <p className="text-2xl font-bold">
                  {deployments?.items?.filter((d: any) => d.status === 'running').length || 0}
                </p>
              </div>
              <Cloud className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ready Servers</p>
                <p className="text-2xl font-bold">
                  {mcpServers?.items?.filter((s: any) => s.status === 'ready').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group hover:shadow-medium transition-all duration-200 cursor-pointer">
            <Link href="/dashboard/registrations/new">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Register API</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add a new API to generate MCP servers from
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="group hover:shadow-medium transition-all duration-200 cursor-pointer">
            <Link href="/dashboard/mcp-servers/new">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-success-500/10 rounded-lg">
                    <Server className="h-6 w-6 text-success-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Generate Server</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a new MCP server from your APIs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="group hover:shadow-medium transition-all duration-200 cursor-pointer">
            <Link href="/dashboard/deployments/new">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-warning-500/10 rounded-lg">
                    <Cloud className="h-6 w-6 text-warning-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Deploy Server</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Deploy your MCP servers to production
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="group hover:shadow-medium transition-all duration-200 cursor-pointer">
            <Link href="/dashboard/docs">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <FileText className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">View Docs</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Browse generated API documentation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Registrations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent API Registrations</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/registrations">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : registrations?.items.length === 0 ? (
              <div className="text-center py-8">
                <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No API registrations</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by registering your first API.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/registrations/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Register API
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations?.items.map((registration: any) => (
                  <div key={registration.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Database className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{registration.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {registration.api_type.toUpperCase()} • {registration.base_url}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="success">Active</Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/registrations/${registration.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* MCP Servers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent MCP Servers</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/mcp-servers">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : mcpServers?.items.length === 0 ? (
              <div className="text-center py-8">
                <Server className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No MCP servers</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Generate your first MCP server from an API.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mcpServers?.items.slice(0, 3).map((server: any) => (
                  <div key={server.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-success-500/10 flex items-center justify-center">
                        <Server className="h-4 w-4 text-success-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{server.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {server.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(server.status).replace('badge-', '') as any}>
                        {server.status === 'generating' || server.status === 'building' ? (
                          <Clock className="h-3 w-3 mr-1" />
                        ) : null}
                        {server.status}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/mcp-servers/${server.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
