'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import {
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Users,
  Settings,
  FileText,
  LayoutDashboard,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { logger } from '@/lib/logger';
import { errorHandler } from '@/lib/error-handling';

interface SystemStatus {
  services: {
    registration: 'healthy' | 'degraded' | 'down';
    generator: 'healthy' | 'degraded' | 'down';
    deployment: 'healthy' | 'degraded' | 'down';
    database: 'healthy' | 'degraded' | 'down';
  };
  metrics: {
    totalUsers: number;
    totalAPIs: number;
    totalServers: number;
    totalDeployments: number;
    activeDeployments: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'user_registration' | 'api_registration' | 'server_generation' | 'deployment';
    message: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
  }>;
}

export default function AdminPage() {
  const [logs, setLogs] = useState(logger.getLogs({ limit: 50 }));
  const [errors, setErrors] = useState(errorHandler.getErrorReports());
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  // Mock system status - in real implementation, this would come from APIs
  useEffect(() => {
    const mockStatus: SystemStatus = {
      services: {
        registration: 'healthy',
        generator: 'healthy',
        deployment: 'healthy',
        database: 'healthy',
      },
      metrics: {
        totalUsers: 15,
        totalAPIs: 8,
        totalServers: 12,
        totalDeployments: 6,
        activeDeployments: 4,
      },
      recentActivity: [
        {
          id: '1',
          type: 'deployment',
          message: 'MCP server "weather-api" deployed successfully',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'success',
        },
        {
          id: '2',
          type: 'server_generation',
          message: 'Generated MCP server for "payment-api"',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: 'success',
        },
        {
          id: '3',
          type: 'api_registration',
          message: 'New API registered: "user-management-api"',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'success',
        },
        {
          id: '4',
          type: 'user_registration',
          message: 'New user registered: john.doe@example.com',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          status: 'success',
        },
      ],
    };
    setSystemStatus(mockStatus);
  }, []);

  const refreshLogs = () => {
    setLogs(logger.getLogs({ limit: 50 }));
    setErrors(errorHandler.getErrorReports());
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const clearErrors = () => {
    errorHandler.clearErrorReports();
    setErrors([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5" />;
      case 'down': return <AlertTriangle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Administration', icon: Settings }
  ];

  if (!systemStatus) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading system status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">System Administration</h1>
            <p className="text-muted-foreground text-lg">
              Monitor system health, metrics, and activity logs
            </p>
          </div>
          <Button onClick={refreshLogs} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
      {/* System Status */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {Object.entries(systemStatus.services).map(([service, status]) => (
          <Card key={service}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={getStatusColor(status)}>
                  {getStatusIcon(status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground capitalize">
                    {service} Service
                  </p>
                  <p className={`text-lg font-semibold ${getStatusColor(status)} capitalize`}>
                    {status}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Users className="h-6 w-6 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {systemStatus.metrics.totalUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-6 w-6 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Registered APIs
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {systemStatus.metrics.totalAPIs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Server className="h-6 w-6 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  MCP Servers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {systemStatus.metrics.totalServers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-6 w-6 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Deployments
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {systemStatus.metrics.totalDeployments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Deployments
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {systemStatus.metrics.activeDeployments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStatus.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-400' :
                    activity.status === 'warning' ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Error Reports ({errors.length})</CardTitle>
              <Button
                onClick={clearErrors}
                variant="outline"
                size="sm"
                disabled={errors.length === 0}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {errors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No errors reported</p>
              ) : (
                errors.slice(-10).map((error) => (
                  <div key={error.id} className="border-l-4 border-destructive pl-3">
                    <p className="text-sm text-foreground font-medium">
                      {error.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {error.category} • {formatTimestamp(error.timestamp)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Logs */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Logs ({logs.length})</CardTitle>
            <Button
              onClick={clearLogs}
              variant="outline"
              size="sm"
              disabled={logs.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">No logs available</p>
            ) : (
              logs.slice(-20).map((log) => (
                <div key={log.id} className="mb-1">
                  <span className="text-gray-400">[{formatTimestamp(log.timestamp)}]</span>
                  <span className={`ml-2 ${
                    log.level === 'error' ? 'text-red-400' :
                    log.level === 'warn' ? 'text-yellow-400' :
                    log.level === 'info' ? 'text-blue-400' :
                    'text-green-400'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                  {log.category && (
                    <span className="text-purple-400 ml-2">[{log.category}]</span>
                  )}
                  <span className="ml-2">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
