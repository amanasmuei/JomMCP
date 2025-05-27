'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Globe, Server, Rocket, Activity, TrendingUp, Clock, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAPIRegistrations, useMCPServers, useDeployments } from '@/lib/react-query';
import { useWebSocket } from '@/components/providers/websocket-provider';
import { formatRelativeTime, getStatusColor, getStatusIcon } from '@/lib/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const { addStatusUpdateHandler } = useWebSocket();

  // Fetch data
  const { data: apiRegistrations, isLoading: loadingAPIs } = useAPIRegistrations(1, 10);
  const { data: mcpServers, isLoading: loadingServers } = useMCPServers(1, 10);
  const { data: deployments, isLoading: loadingDeployments } = useDeployments(1, 10);

  // Calculate metrics
  const totalAPIs = apiRegistrations?.total || 0;
  const totalServers = mcpServers?.total || 0;
  const totalDeployments = deployments?.total || 0;
  const runningDeployments = deployments?.items?.filter(d => d.status === 'running').length || 0;

  // Listen for real-time updates
  useEffect(() => {
    const removeHandler = addStatusUpdateHandler((message) => {
      setRecentActivity(prev => [
        {
          id: Date.now(),
          type: 'status_update',
          resource: message.data.resource_type,
          resourceId: message.data.resource_id,
          status: message.data.status,
          message: message.data.message,
          timestamp: message.timestamp,
        },
        ...prev.slice(0, 9) // Keep only 10 most recent
      ]);
    });

    return removeHandler;
  }, [addStatusUpdateHandler]);

  const metrics = [
    {
      title: 'Total APIs',
      value: totalAPIs,
      icon: Globe,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      href: '/dashboard/apis',
    },
    {
      title: 'MCP Servers',
      value: totalServers,
      icon: Server,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      href: '/dashboard/servers',
    },
    {
      title: 'Deployments',
      value: totalDeployments,
      icon: Rocket,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      href: '/dashboard/deployments',
    },
    {
      title: 'Running',
      value: runningDeployments,
      icon: Activity,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900',
      href: '/dashboard/deployments?status=running',
    },
  ];

  const quickActions = [
    {
      title: 'Register New API',
      description: 'Add a new API to start generating MCP servers',
      icon: Plus,
      href: '/dashboard/apis/new',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Generate MCP Server',
      description: 'Create a new MCP server from existing APIs',
      icon: Server,
      href: '/dashboard/servers/new',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Deploy Server',
      description: 'Deploy an MCP server to production',
      icon: Rocket,
      href: '/dashboard/deployments/new',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your APIs and deployments.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button asChild>
            <Link href="/dashboard/apis/new">
              <Plus className="h-4 w-4 mr-2" />
              Register API
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Link key={metric.title} href={metric.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {loadingAPIs || loadingServers || loadingDeployments ? (
                        <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                      ) : (
                        metric.value
                      )}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.bgColor}`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <div className="flex items-center p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                  <div className={`p-2 rounded-lg text-white mr-4 ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates from your resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Activity will appear here as you use the platform</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className="text-lg">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {activity.resource} status changed to{' '}
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      </p>
                      {activity.message && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent APIs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent APIs</CardTitle>
            <CardDescription>
              Your latest API registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAPIs ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : apiRegistrations?.items?.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No APIs registered yet</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="/dashboard/apis/new">Register your first API</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {apiRegistrations?.items?.slice(0, 3).map((api) => (
                  <Link key={api.id} href={`/dashboard/apis/${api.id}`}>
                    <div className="p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{api.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {api.api_type.toUpperCase()}
                          </p>
                        </div>
                        <CheckCircle className="h-4 w-4 text-success-500 ml-2" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent MCP Servers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Servers</CardTitle>
            <CardDescription>
              Your latest MCP servers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingServers ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : mcpServers?.items?.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Server className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No servers generated yet</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="/dashboard/servers/new">Generate your first server</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {mcpServers?.items?.slice(0, 3).map((server) => (
                  <Link key={server.id} href={`/dashboard/servers/${server.id}`}>
                    <div className="p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{server.name}</p>
                          <Badge className={getStatusColor(server.status)}>
                            {server.status}
                          </Badge>
                        </div>
                        <div className="text-lg ml-2">
                          {getStatusIcon(server.status)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Deployments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Deployments</CardTitle>
            <CardDescription>
              Your latest deployments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDeployments ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : deployments?.items?.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Rocket className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No deployments yet</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="/dashboard/deployments/new">Create your first deployment</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {deployments?.items?.slice(0, 3).map((deployment) => (
                  <Link key={deployment.id} href={`/dashboard/deployments/${deployment.id}`}>
                    <div className="p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{deployment.name}</p>
                          <Badge className={getStatusColor(deployment.status)}>
                            {deployment.status}
                          </Badge>
                        </div>
                        <div className="text-lg ml-2">
                          {getStatusIcon(deployment.status)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
