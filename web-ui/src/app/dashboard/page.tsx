'use client';

import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { registrationsApi } from '@/lib/api/registrations';
import { mcpApi } from '@/lib/api/mcp';
import { deploymentsApi } from '@/lib/api/deployments';
import Link from 'next/link';
import {
  PlusIcon,
  CpuChipIcon,
  CloudIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['api-registrations'],
    queryFn: () => registrationsApi.list({ page: 1, size: 10 }),
    enabled: !!user,
  });

  const { data: mcpServers, isLoading: mcpLoading } = useQuery({
    queryKey: ['mcp-servers'],
    queryFn: () => mcpApi.list(),
    enabled: !!user,
  });

  const { data: deployments, isLoading: deploymentsLoading } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => deploymentsApi.list(),
    enabled: !!user,
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
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
                    {registrations?.items?.length || 0}
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
                    {mcpServers?.items?.length || 0}
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
      </div>

      {/* API Registrations Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              API Registrations
            </h3>
            <Link
              href="/dashboard/registrations/new"
              className="btn-primary"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Register API
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
    </div>
  );
}
