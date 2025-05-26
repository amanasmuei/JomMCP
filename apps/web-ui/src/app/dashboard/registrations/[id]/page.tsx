'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationsApi } from '@/lib/api/registrations';
import { mcpApi } from '@/lib/api/mcp';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PlayIcon,
  TrashIcon,
  CpuChipIcon,
  CloudIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const registrationId = params.id as string;

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [mcpServerName, setMcpServerName] = useState('');

  const { data: registration, isLoading } = useQuery({
    queryKey: ['api-registration', registrationId],
    queryFn: () => registrationsApi.get(registrationId),
    enabled: !!registrationId,
  });

  const { data: mcpServers } = useQuery({
    queryKey: ['mcp-servers'],
    queryFn: () => mcpApi.list(),
    select: (data) => data.items.filter(server => server.api_registration_id === registrationId),
  });

  const deleteMutation = useMutation({
    mutationFn: registrationsApi.delete,
    onSuccess: () => {
      toast.success('API registration deleted');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete registration');
    },
  });

  const generateMutation = useMutation({
    mutationFn: mcpApi.generate,
    onSuccess: () => {
      toast.success('MCP server generation started');
      setShowGenerateModal(false);
      setMcpServerName('');
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to start generation');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this API registration?')) {
      deleteMutation.mutate(registrationId);
    }
  };

  const handleGenerate = () => {
    if (!mcpServerName.trim()) {
      toast.error('Please enter a name for the MCP server');
      return;
    }

    generateMutation.mutate({
      api_registration_id: registrationId,
      name: mcpServerName.trim(),
      description: `MCP server for ${registration?.name}`,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      generating: { color: 'bg-blue-100 text-blue-800', text: 'Generating' },
      building: { color: 'bg-purple-100 text-purple-800', text: 'Building' },
      ready: { color: 'bg-green-100 text-green-800', text: 'Ready' },
      error: { color: 'bg-red-100 text-red-800', text: 'Error' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Registration not found</h2>
          <Link href="/dashboard" className="mt-4 btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{registration.name}</h1>
                <p className="text-sm text-gray-500">{registration.api_type.toUpperCase()} API</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowGenerateModal(true)}
                className="btn-primary"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Generate MCP Server
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="btn-outline text-red-600 border-red-300 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* API Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  API Details
                </h3>

                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Base URL</dt>
                    <dd className="mt-1 text-sm text-gray-900 break-all">{registration.base_url}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">API Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{registration.api_type.toUpperCase()}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Authentication</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {registration.authentication_type.replace('_', ' ').toUpperCase()}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(registration.created_at).toLocaleDateString()}
                    </dd>
                  </div>

                  {registration.description && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">{registration.description}</dd>
                    </div>
                  )}

                  {registration.health_check_url && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Health Check URL</dt>
                      <dd className="mt-1 text-sm text-gray-900 break-all">{registration.health_check_url}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* MCP Servers */}
          <div>
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  MCP Servers
                </h3>

                {mcpServers && mcpServers.length > 0 ? (
                  <div className="space-y-3">
                    {mcpServers.map((server) => (
                      <div key={server.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CpuChipIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{server.name}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(server.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(server.status)}
                        </div>

                        {server.error_message && (
                          <div className="mt-2 flex items-start">
                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-600">{server.error_message}</p>
                          </div>
                        )}

                        <div className="mt-2 flex justify-end">
                          <Link
                            href={`/dashboard/mcp-servers/${server.id}`}
                            className="text-xs text-blue-600 hover:text-blue-500"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CpuChipIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No MCP servers</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Generate your first MCP server from this API.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowGenerateModal(true)}
                        className="btn-primary"
                      >
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Generate MCP Server
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Generate MCP Server
              </h3>

              <div className="mb-4">
                <label htmlFor="serverName" className="block text-sm font-medium text-gray-700 mb-2">
                  Server Name
                </label>
                <input
                  type="text"
                  id="serverName"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={mcpServerName}
                  onChange={(e) => setMcpServerName(e.target.value)}
                  placeholder="Enter server name"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="btn-primary"
                >
                  {generateMutation.isPending ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
