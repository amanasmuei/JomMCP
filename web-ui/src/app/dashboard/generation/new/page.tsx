'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useQuery, useMutation } from '@tanstack/react-query';
import { generationApi, MCPServerCreate } from '@/lib/api/generation';
import { registrationsApi } from '@/lib/api/registrations';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  CpuChipIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function NewGenerationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<MCPServerCreate>({
    name: '',
    description: '',
    api_registration_id: '',
    mcp_config: {
      version: '1.0.0',
      capabilities: {
        tools: true,
        resources: true,
        prompts: false
      },
      server: {
        name: '',
        version: '1.0.0'
      }
    },
  });

  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['api-registrations'],
    queryFn: () => registrationsApi.list({ page: 1, size: 100 }),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: MCPServerCreate) => generationApi.create(data),
    onSuccess: (data) => {
      toast.success('MCP server generation started!');
      router.push(`/dashboard/generation`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to start generation');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a server name');
      return;
    }
    
    if (!formData.api_registration_id) {
      toast.error('Please select an API registration');
      return;
    }

    // Update MCP config with server name
    const updatedFormData = {
      ...formData,
      mcp_config: {
        ...formData.mcp_config,
        server: {
          ...formData.mcp_config?.server,
          name: formData.name,
        }
      }
    };

    createMutation.mutate(updatedFormData);
  };

  const handleInputChange = (field: keyof MCPServerCreate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMCPConfigChange = (path: string[], value: any) => {
    setFormData(prev => {
      const newConfig = { ...prev.mcp_config };
      let current: any = newConfig;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      
      return {
        ...prev,
        mcp_config: newConfig
      };
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Generate MCP Server</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Create a new MCP server from an existing API registration
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Server Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., my-api-mcp-server"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe what this MCP server does..."
                  />
                </div>

                <div>
                  <label htmlFor="api_registration_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    API Registration *
                  </label>
                  <select
                    id="api_registration_id"
                    value={formData.api_registration_id}
                    onChange={(e) => handleInputChange('api_registration_id', e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select an API registration</option>
                    {registrations?.items.map((registration) => (
                      <option key={registration.id} value={registration.id}>
                        {registration.name} ({registration.api_type.toUpperCase()})
                      </option>
                    ))}
                  </select>
                  {registrationsLoading && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Loading registrations...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* MCP Configuration */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  MCP Configuration
                </h3>
                <InformationCircleIcon className="h-5 w-5 text-gray-400" title="Configure MCP server capabilities" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capabilities
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.mcp_config?.capabilities?.tools || false}
                        onChange={(e) => handleMCPConfigChange(['capabilities', 'tools'], e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Tools - Enable function calling</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.mcp_config?.capabilities?.resources || false}
                        onChange={(e) => handleMCPConfigChange(['capabilities', 'resources'], e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Resources - Enable data access</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.mcp_config?.capabilities?.prompts || false}
                        onChange={(e) => handleMCPConfigChange(['capabilities', 'prompts'], e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Prompts - Enable prompt templates</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="server_version" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Server Version
                  </label>
                  <input
                    type="text"
                    id="server_version"
                    value={formData.mcp_config?.server?.version || '1.0.0'}
                    onChange={(e) => handleMCPConfigChange(['server', 'version'], e.target.value)}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="1.0.0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary"
            >
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <CpuChipIcon className="h-4 w-4 mr-2" />
                  Generate Server
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
