'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ClockIcon,
  ServerIcon,
  UsersIcon,
  CogIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
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
      case 'healthy': return <CheckCircleIcon className="h-5 w-5" />;
      case 'degraded': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'down': return <ExclamationTriangleIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!systemStatus) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <CogIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Administration</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={refreshLogs}
                className="btn-outline btn-sm"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* System Status */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {Object.entries(systemStatus.services).map(([service, status]) => (
            <div key={service} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={getStatusColor(status)}>
                      {getStatusIcon(status)}
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate capitalize">
                        {service} Service
                      </dt>
                      <dd className={`text-lg font-medium ${getStatusColor(status)} capitalize`}>
                        {status}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {systemStatus.metrics.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Registered APIs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {systemStatus.metrics.totalAPIs}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ServerIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      MCP Servers
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {systemStatus.metrics.totalServers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Deployments
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {systemStatus.metrics.totalDeployments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Active Deployments
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {systemStatus.metrics.activeDeployments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {systemStatus.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'success' ? 'bg-green-400' :
                      activity.status === 'warning' ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Error Reports */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Error Reports ({errors.length})
                </h3>
                <button
                  onClick={clearErrors}
                  className="btn-outline btn-sm text-red-600 hover:text-red-700"
                  disabled={errors.length === 0}
                >
                  Clear Errors
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {errors.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No errors reported</p>
                ) : (
                  errors.slice(-10).map((error) => (
                    <div key={error.id} className="border-l-4 border-red-400 pl-3">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {error.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {error.category} • {formatTimestamp(error.timestamp)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* System Logs */}
        <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                System Logs ({logs.length})
              </h3>
              <button
                onClick={clearLogs}
                className="btn-outline btn-sm"
                disabled={logs.length === 0}
              >
                Clear Logs
              </button>
            </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
