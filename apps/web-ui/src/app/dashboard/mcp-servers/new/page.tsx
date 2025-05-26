'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { mcpApi } from '@/lib/api/mcp';
import { registrationsApi } from '@/lib/api/registrations';
import { MCPServerGenerationRequest } from '@/types/mcp';
import { useWebSocket } from '@/hooks/useWebSocket';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeftIcon, CpuChipIcon } from '@heroicons/react/24/outline';

export default function NewMCPServerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRegistrationId = searchParams.get('registration');

  const [formData, setFormData] = useState<MCPServerGenerationRequest>({
    api_registration_id: preselectedRegistrationId || '',
    name: '',
    description: '',
    mcp_config: {},
  });

  const [generationStatus, setGenerationStatus] = useState<any>(null);

  const { data: registrations } = useQuery({
    queryKey: ['api-registrations'],
    queryFn: () => registrationsApi.list({ page: 1, size: 100 }),
  });

  const generateMutation = useMutation({
    mutationFn: mcpApi.generate,
    onSuccess: (data) => {
      toast.success('MCP server generation started!');
      setGenerationStatus({ server_id: data.id, status: 'pending' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to start generation');
    },
  });

  // WebSocket for real-time generation updates
  useWebSocket('/generation/status', {
    onMessage: (message) => {
      if (message.type === 'generation_status' && generationStatus?.server_id) {
        if (message.data.server_id === generationStatus.server_id) {
          setGenerationStatus(message.data);

          if (message.data.status === 'ready') {
            toast.success('MCP server generated successfully!');
            setTimeout(() => {
              router.push(`/dashboard/mcp-servers/${message.data.server_id}`);
            }, 2000);
          } else if (message.data.status === 'error' || message.data.status === 'failed') {
            toast.error('MCP server generation failed');
          }
        }
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectedRegistration = registrations?.items.find(r => r.id === formData.api_registration_id);

  if (generationStatus) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-8">
              <div className="text-center">
                <CpuChipIcon className="mx-auto h-12 w-12 text-blue-600" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                  Generating MCP Server
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Please wait while we generate your MCP server...
                </p>
              </div>

              <div className="mt-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Generation Progress
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {generationStatus.status}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        generationStatus.status === 'pending' ? 'bg-yellow-500 w-1/4' :
                        generationStatus.status === 'generating' ? 'bg-blue-500 w-1/2' :
                        generationStatus.status === 'building' ? 'bg-purple-500 w-3/4' :
                        generationStatus.status === 'ready' ? 'bg-green-500 w-full' :
                        generationStatus.status === 'error' || generationStatus.status === 'failed' ? 'bg-red-500 w-full' :
                        'bg-gray-400 w-1/4'
                      }`}
                    />
                  </div>
                </div>

                {generationStatus.generation_logs && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Generation Logs
                    </h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono max-h-64 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{generationStatus.generation_logs}</pre>
                    </div>
                  </div>
                )}

                {generationStatus.build_logs && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Build Logs
                    </h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono max-h-64 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{generationStatus.build_logs}</pre>
                    </div>
                  </div>
                )}

                {generationStatus.error_message && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
                      Error Details
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {generationStatus.error_message}
                    </p>
                  </div>
                )}

                <div className="mt-8 flex justify-center">
                  {generationStatus.status === 'ready' ? (
                    <Link
                      href={`/dashboard/mcp-servers/${generationStatus.server_id}`}
                      className="btn-primary"
                    >
                      View Server Details
                    </Link>
                  ) : generationStatus.status === 'error' || generationStatus.status === 'failed' ? (
                    <Link
                      href="/dashboard/mcp-servers"
                      className="btn-secondary"
                    >
                      Back to Servers
                    </Link>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Processing...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
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
              <Link
                href="/dashboard/mcp-servers"
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Generate MCP Server</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Server Configuration
              </h3>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="api_registration_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    API Registration *
                  </label>
                  <select
                    name="api_registration_id"
                    id="api_registration_id"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.api_registration_id}
                    onChange={handleChange}
                  >
                    <option value="">Select an API registration</option>
                    {registrations?.items.map((registration) => (
                      <option key={registration.id} value={registration.id}>
                        {registration.name} ({registration.api_type.toUpperCase()})
                      </option>
                    ))}
                  </select>
                  {selectedRegistration && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {selectedRegistration.description || selectedRegistration.base_url}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Server Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="My MCP Server"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of your MCP server"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/mcp-servers"
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={generateMutation.isPending}
              className="btn-primary"
            >
              {generateMutation.isPending ? 'Starting Generation...' : 'Generate Server'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
