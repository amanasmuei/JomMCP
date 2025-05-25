'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { mcpApi } from '@/lib/api/mcp';
import { useWebSocket } from '@/hooks/useWebSocket';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CpuChipIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlayIcon,
  StopIcon,
  CloudIcon,
  DocumentTextIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';

export default function MCPServerDetailsPage() {
  const params = useParams();
  const serverId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');

  const { data: server, isLoading, error, refetch } = useQuery({
    queryKey: ['mcp-server', serverId],
    queryFn: () => mcpApi.getById(serverId),
    enabled: !!serverId,
  });

  // WebSocket for real-time updates
  useWebSocket({
    onMessage: (message) => {
      if (message.type === 'generation_status' && message.data.server_id === serverId) {
        refetch();
      }
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'stopped':
        return <StopIcon className="h-6 w-6 text-gray-500" />;
      case 'error':
      case 'failed':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'pending':
      case 'generating':
      case 'building':
      case 'deploying':
        return <ClockIcon className="h-6 w-6 text-yellow-500 animate-spin" />;
      case 'ready':
        return <PlayIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
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

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading server details...</p>
        </div>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Server not found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The requested MCP server could not be found.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/mcp-servers" className="btn-primary">
              Back to Servers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: CpuChipIcon },
    { id: 'configuration', name: 'Configuration', icon: CodeBracketIcon },
    { id: 'logs', name: 'Logs', icon: DocumentTextIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link
                href="/dashboard/mcp-servers"
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div className="flex items-center">
                {getStatusIcon(server.status)}
                <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">{server.name}</h1>
                <div className="ml-4">
                  {getStatusBadge(server.status)}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              {server.status === 'ready' && (
                <Link
                  href={`/dashboard/deployments/new?server=${server.id}`}
                  className="btn-primary"
                >
                  <CloudIcon className="h-4 w-4 mr-2" />
                  Deploy Server
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Server Information</h3>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{server.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                    <dd className="mt-1">{getStatusBadge(server.status)}</dd>
                  </div>
                  {server.description && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{server.description}</dd>
                    </div>
                  )}
                  {server.docker_image_name && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Docker Image</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                        {server.docker_image_name}:{server.docker_image_tag}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(server.created_at).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(server.updated_at).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Error Message */}
            {server.error_message && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">Error Details</h3>
                <p className="text-sm text-red-600 dark:text-red-400">{server.error_message}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'configuration' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">MCP Configuration</h3>
            </div>
            <div className="px-6 py-4">
              {server.mcp_config ? (
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                  <code className="text-gray-900 dark:text-gray-100">
                    {JSON.stringify(server.mcp_config, null, 2)}
                  </code>
                </pre>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No configuration available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            {/* Generation Logs */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Generation Logs</h3>
              </div>
              <div className="px-6 py-4">
                {server.generated_code_path ? (
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">
                      {/* This would be fetched from the server in a real implementation */}
                      Generation completed successfully.
                      Generated code saved to: {server.generated_code_path}
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No generation logs available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
