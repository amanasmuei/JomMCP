'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generationApi } from '@/lib/api/generation';
import { registrationsApi } from '@/lib/api/registrations';
import { RealTimeStatus } from '@/components/RealTimeStatus';
import Link from 'next/link';
import {
  PlusIcon,
  CloudIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function GenerationPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  const { data: mcpServers, isLoading } = useQuery({
    queryKey: ['mcp-servers'],
    queryFn: () => generationApi.list({ page: 1, size: 50 }),
    enabled: !!user,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: registrations } = useQuery({
    queryKey: ['api-registrations'],
    queryFn: () => registrationsApi.list({ page: 1, size: 100 }),
    enabled: !!user,
  });

  const regenerateMutation = useMutation({
    mutationFn: (serverId: string) => generationApi.regenerate(serverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (serverId: string) => generationApi.delete(serverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] });
      setSelectedServerId(null);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
      case 'generating':
      case 'building':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
      case 'generating':
      case 'building':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRegistrationName = (registrationId: string) => {
    const registration = registrations?.items.find(r => r.id === registrationId);
    return registration?.name || 'Unknown API';
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MCP Server Generation</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Generate and manage MCP servers from your API registrations
            </p>
          </div>
          <Link
            href="/dashboard/generation/new"
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Generate Server
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MCP Servers List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                MCP Servers
              </h3>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading servers...</p>
                </div>
              ) : mcpServers?.items.length === 0 ? (
                <div className="text-center py-8">
                  <CloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No MCP servers
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Generate your first MCP server from an API registration.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/dashboard/generation/new"
                      className="btn-primary"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Generate Server
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {mcpServers?.items.map((server: any) => (
                    <div
                      key={server.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedServerId === server.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedServerId(server.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(server.status)}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {server.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              From: {getRegistrationName(server.api_registration_id)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
                            {server.status}
                          </span>
                          <div className="flex space-x-1">
                            {server.status === 'ready' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Navigate to deployment
                                }}
                                className="p-1 text-gray-400 hover:text-blue-500"
                                title="Deploy"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                regenerateMutation.mutate(server.id);
                              }}
                              disabled={regenerateMutation.isPending}
                              className="p-1 text-gray-400 hover:text-green-500 disabled:opacity-50"
                              title="Regenerate"
                            >
                              <ArrowPathIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this MCP server?')) {
                                  deleteMutation.mutate(server.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {server.description && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {server.description}
                        </p>
                      )}
                      
                      {server.docker_image_name && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Image: {server.docker_image_name}:{server.docker_image_tag}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Status Panel */}
        <div className="lg:col-span-1">
          {selectedServerId ? (
            <RealTimeStatus 
              serverId={selectedServerId}
              className="sticky top-6"
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
              <div className="text-center">
                <CloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Select a server
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Choose an MCP server to view real-time status updates
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
