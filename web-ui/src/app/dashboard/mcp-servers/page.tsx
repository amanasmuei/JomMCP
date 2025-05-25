'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mcpApi } from '@/lib/api/mcp';
import { MCPServer } from '@/types/mcp';
import { useWebSocket } from '@/hooks/useWebSocket';
import Link from 'next/link';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function MCPServersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: serversData, isLoading, error, refetch } = useQuery({
    queryKey: ['mcp-servers', currentPage, pageSize],
    queryFn: () => mcpApi.list(),
  });

  // WebSocket for real-time updates
  useWebSocket({
    onMessage: (message) => {
      if (message.type === 'generation_status' || message.type === 'deployment_status') {
        refetch();
      }
    },
  });

  const servers = serversData?.items || [];

  const getStatusIcon = (status: MCPServer['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'stopped':
        return <StopIcon className="h-5 w-5 text-gray-500" />;
      case 'error':
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
      case 'generating':
      case 'building':
      case 'deploying':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'ready':
        return <PlayIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: MCPServer['status']) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200', label: 'Pending' },
      generating: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', label: 'Generating' },
      building: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200', label: 'Building' },
      ready: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', label: 'Ready' },
      deploying: { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-800 dark:text-indigo-200', label: 'Deploying' },
      running: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', label: 'Running' },
      stopped: { bg: 'bg-gray-100 dark:bg-gray-900', text: 'text-gray-800 dark:text-gray-200', label: 'Stopped' },
      error: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', label: 'Error' },
      failed: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', label: 'Failed' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredServers = servers.filter(server => {
    const matchesSearch = !searchTerm || 
      server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || server.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Error loading MCP servers
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MCP Servers</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your generated MCP servers and their deployments
            </p>
          </div>
          <Link
            href="/dashboard/mcp-servers/new"
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Generate Server
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
              placeholder="Search MCP servers..."
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
            <option value="generating">Generating</option>
            <option value="building">Building</option>
            <option value="ready">Ready</option>
            <option value="deploying">Deploying</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
            <option value="error">Error</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading MCP servers...</p>
        </div>
      ) : filteredServers.length === 0 ? (
        <div className="text-center py-12">
          <CpuChipIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {searchTerm || filterStatus !== 'all' ? 'No matching servers' : 'No MCP servers'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by generating your first MCP server.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <div className="mt-6">
              <Link
                href="/dashboard/mcp-servers/new"
                className="btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Generate Server
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Grid View */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServers.map((server) => (
              <div key={server.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {getStatusIcon(server.status)}
                      <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white truncate">
                        {server.name}
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
                                  href={`/dashboard/mcp-servers/${server.id}`}
                                  className={`${
                                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                  } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                >
                                  View Details
                                </Link>
                              )}
                            </Menu.Item>
                            {server.status === 'ready' && (
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    href={`/dashboard/deployments/new?server=${server.id}`}
                                    className={`${
                                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                    } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                  >
                                    Deploy Server
                                  </Link>
                                )}
                              </Menu.Item>
                            )}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>

                  <div className="mb-4">
                    {getStatusBadge(server.status)}
                  </div>

                  {server.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {server.description}
                    </p>
                  )}

                  <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                    {server.docker_image_name && (
                      <div>
                        <span className="font-medium">Image:</span> {server.docker_image_name}:{server.docker_image_tag}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Created:</span> {new Date(server.created_at).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span> {new Date(server.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  {server.error_message && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {server.error_message}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Link
                      href={`/dashboard/mcp-servers/${server.id}`}
                      className="btn-outline btn-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
