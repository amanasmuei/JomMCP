'use client';

import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { registrationsApi } from '@/lib/api/registrations';
import { generationApi } from '@/lib/api/generation';
import { deploymentsApi } from '@/lib/api/deployments';
import { documentationApi } from '@/lib/api/documentation';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';
import {
  PlusIcon,
  CpuChipIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

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

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your API registrations and MCP servers
        </p>
      </div>

      {/* System Health Status */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">System Health</h3>
              <div className="flex items-center">
                {healthStatus?.status === 'healthy' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                ) : healthStatus?.status === 'degraded' ? (
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className={`text-sm font-medium ${
                  healthStatus?.status === 'healthy' ? 'text-green-600 dark:text-green-400' :
                  healthStatus?.status === 'degraded' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {healthStatus?.status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CpuChipIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    API Registrations
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {registrations?.total || 0}
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
                <CloudIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    MCP Servers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {mcpServers?.total || 0}
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
                <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Active Deployments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {deployments?.items?.filter((d: any) => d.status === 'running').length || 0}
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
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Documentation
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {mcpServers?.items?.filter((s: any) => s.status === 'ready').length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard/registrations/new"
            className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 ring-4 ring-white dark:ring-gray-800">
                <CpuChipIcon className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Register API
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Add a new API to generate MCP servers from
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/generation"
            className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 ring-4 ring-white dark:ring-gray-800">
                <CloudIcon className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Generate Server
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Create a new MCP server from your APIs
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/deployments"
            className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-400 ring-4 ring-white dark:ring-gray-800">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Deploy Server
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Deploy your MCP servers to production
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/documentation"
            className="relative group bg-white dark:bg-gray-800 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-400 ring-4 ring-white dark:ring-gray-800">
                <DocumentTextIcon className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                View Docs
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Browse generated API documentation
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* API Registrations */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Recent API Registrations
              </h3>
              <Link
                href="/dashboard/registrations"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all
              </Link>
            </div>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
          ) : registrations?.items.length === 0 ? (
            <div className="text-center py-8">
              <CpuChipIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No API registrations
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by registering your first API.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/registrations/new"
                  className="btn-primary"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Register API
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {registrations?.items.map((registration: any) => (
                  <li key={registration.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <CpuChipIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {registration.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {registration.api_type.toUpperCase()} • {registration.base_url}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </span>
                        <Link
                          href={`/dashboard/registrations/${registration.id}`}
                          className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          </div>
        </div>

        {/* MCP Servers */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Recent MCP Servers
              </h3>
              <Link
                href="/dashboard/generation"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            ) : mcpServers?.items.length === 0 ? (
              <div className="text-center py-8">
                <CloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No MCP servers
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Generate your first MCP server from an API.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mcpServers?.items.slice(0, 3).map((server: any) => (
                    <li key={server.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                              <CloudIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {server.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {server.description || 'No description'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            server.status === 'ready' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            server.status === 'generating' || server.status === 'building' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            server.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {server.status === 'generating' || server.status === 'building' ? (
                              <ClockIcon className="h-3 w-3 mr-1" />
                            ) : null}
                            {server.status}
                          </span>
                          <Link
                            href={`/dashboard/generation/${server.id}`}
                            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
