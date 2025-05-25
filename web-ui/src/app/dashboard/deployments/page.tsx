'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { deploymentsApi } from '@/lib/api/deployments';
import { Deployment } from '@/types/mcp';
import { useWebSocket } from '@/hooks/useWebSocket';
import Link from 'next/link';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  CloudIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function DeploymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: deploymentsData, isLoading, error, refetch } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => deploymentsApi.list(),
  });

  // WebSocket for real-time updates
  useWebSocket({
    onMessage: (message) => {
      if (message.type === 'deployment_status') {
        refetch();
      }
    },
  });

  const deployments = deploymentsData?.items || [];

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'stopped':
        return <StopIcon className="h-5 w-5 text-gray-500" />;
      case 'failed':
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
      case 'deploying':
      case 'scaling':
      case 'updating':
      case 'stopping':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Deployment['status']) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200', label: 'Pending' },
      deploying: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', label: 'Deploying' },
      running: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', label: 'Running' },
      scaling: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200', label: 'Scaling' },
      updating: { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-800 dark:text-indigo-200', label: 'Updating' },
      stopping: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200', label: 'Stopping' },
      stopped: { bg: 'bg-gray-100 dark:bg-gray-900', text: 'text-gray-800 dark:text-gray-200', label: 'Stopped' },
      failed: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', label: 'Failed' },
      error: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', label: 'Error' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredDeployments = deployments.filter(deployment => {
    const matchesSearch = !searchTerm || 
      deployment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deployment.namespace?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || deployment.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Error loading deployments
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deployments</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your MCP server deployments and monitor their status
            </p>
          </div>
          <Link
            href="/dashboard/deployments/new"
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Deployment
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search deployments..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-4 w-4 text-gray-400" />
          <select
            className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="deploying">Deploying</option>
            <option value="running">Running</option>
            <option value="scaling">Scaling</option>
            <option value="updating">Updating</option>
            <option value="stopping">Stopping</option>
            <option value="stopped">Stopped</option>
            <option value="failed">Failed</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading deployments...</p>
        </div>
      ) : filteredDeployments.length === 0 ? (
        <div className="text-center py-12">
          <CloudIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {searchTerm || filterStatus !== 'all' ? 'No matching deployments' : 'No deployments'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by deploying your first MCP server.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <div className="mt-6">
              <Link
                href="/dashboard/deployments/new"
                className="btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Deployment
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDeployments.map((deployment) => (
            <div key={deployment.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(deployment.status)}
                    <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white truncate">
                      {deployment.name}
                    </h3>
                  </div>
                  <Menu as="div" className="relative">
                    <Menu.Button className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href={`/dashboard/deployments/${deployment.id}`}
                                className={`${
                                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                              >
                                View Details
                              </Link>
                            )}
                          </Menu.Item>
                          {deployment.status === 'running' && (
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  className={`${
                                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                  } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                >
                                  Scale Deployment
                                </button>
                              )}
                            </Menu.Item>
                          )}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>

                <div className="mb-4">
                  {getStatusBadge(deployment.status)}
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {deployment.namespace && (
                    <div>
                      <span className="font-medium">Namespace:</span> {deployment.namespace}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Replicas:</span> {deployment.replicas}
                  </div>
                  <div>
                    <span className="font-medium">Port:</span> {deployment.port}
                  </div>
                  {deployment.external_url && (
                    <div>
                      <span className="font-medium">URL:</span>{' '}
                      <a 
                        href={deployment.external_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {deployment.external_url}
                      </a>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Created:</span> {new Date(deployment.created_at).toLocaleDateString()}
                  </div>
                </div>

                {deployment.error_message && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {deployment.error_message}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Link
                    href={`/dashboard/deployments/${deployment.id}`}
                    className="btn-outline btn-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
