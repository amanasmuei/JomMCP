'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deploymentsApi } from '@/lib/api/deployments';
import { mcpApi } from '@/lib/api/mcp';
import { DeploymentCreateRequest } from '@/types/mcp';
import { useWebSocket } from '@/hooks/useWebSocket';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeftIcon, CloudIcon } from '@heroicons/react/24/outline';

export default function NewDeploymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedServerId = searchParams.get('server');

  const [formData, setFormData] = useState<DeploymentCreateRequest>({
    mcp_server_id: preselectedServerId || '',
    name: '',
    namespace: 'default',
    cpu_limit: '500m',
    memory_limit: '512Mi',
    replicas: 1,
    port: 8080,
    environment_variables: {},
    health_check_path: '/health',
  });

  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>([]);
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null);

  const { data: servers } = useQuery({
    queryKey: ['mcp-servers'],
    queryFn: () => mcpApi.list(),
  });

  const deployMutation = useMutation({
    mutationFn: deploymentsApi.create,
    onSuccess: (data) => {
      toast.success('Deployment started!');
      setDeploymentStatus({ deployment_id: data.id, status: 'pending' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to start deployment');
    },
  });

  // WebSocket for real-time deployment updates
  useWebSocket('/deployment/status', {
    onMessage: (message) => {
      if (message.type === 'deployment_status' && deploymentStatus?.deployment_id) {
        if (message.data.deployment_id === deploymentStatus.deployment_id) {
          setDeploymentStatus(message.data);

          if (message.data.status === 'running') {
            toast.success('Deployment completed successfully!');
            setTimeout(() => {
              router.push(`/dashboard/deployments/${message.data.deployment_id}`);
            }, 2000);
          } else if (message.data.status === 'failed' || message.data.status === 'error') {
            toast.error('Deployment failed');
          }
        }
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert env vars array to object
    const environmentVariables = envVars.reduce((acc, { key, value }) => {
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    const deploymentData = {
      ...formData,
      environment_variables: environmentVariables,
    };

    deployMutation.mutate(deploymentData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const addEnvVar = () => {
    setEnvVars(prev => [...prev, { key: '', value: '' }]);
  };

  const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
    setEnvVars(prev => prev.map((env, i) =>
      i === index ? { ...env, [field]: value } : env
    ));
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(prev => prev.filter((_, i) => i !== index));
  };

  const selectedServer = servers?.items.find(s => s.id === formData.mcp_server_id);
  const availableServers = servers?.items.filter(s => s.status === 'ready') || [];

  if (deploymentStatus) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-8">
              <div className="text-center">
                <CloudIcon className="mx-auto h-12 w-12 text-blue-600" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                  Deploying MCP Server
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Please wait while we deploy your MCP server...
                </p>
              </div>

              <div className="mt-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Deployment Progress
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {deploymentStatus.status}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        deploymentStatus.status === 'pending' ? 'bg-yellow-500 w-1/4' :
                        deploymentStatus.status === 'deploying' ? 'bg-blue-500 w-1/2' :
                        deploymentStatus.status === 'scaling' ? 'bg-purple-500 w-3/4' :
                        deploymentStatus.status === 'running' ? 'bg-green-500 w-full' :
                        deploymentStatus.status === 'failed' || deploymentStatus.status === 'error' ? 'bg-red-500 w-full' :
                        'bg-gray-400 w-1/4'
                      }`}
                    />
                  </div>
                </div>

                {deploymentStatus.deployment_logs && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Deployment Logs
                    </h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono max-h-64 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{deploymentStatus.deployment_logs}</pre>
                    </div>
                  </div>
                )}

                {deploymentStatus.error_message && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
                      Error Details
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {deploymentStatus.error_message}
                    </p>
                  </div>
                )}

                <div className="mt-8 flex justify-center">
                  {deploymentStatus.status === 'running' ? (
                    <Link
                      href={`/dashboard/deployments/${deploymentStatus.deployment_id}`}
                      className="btn-primary"
                    >
                      View Deployment
                    </Link>
                  ) : deploymentStatus.status === 'failed' || deploymentStatus.status === 'error' ? (
                    <Link
                      href="/dashboard/deployments"
                      className="btn-secondary"
                    >
                      Back to Deployments
                    </Link>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Deploying...
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
                href="/dashboard/deployments"
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Deployment</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Configuration */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Basic Configuration
              </h3>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="mcp_server_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    MCP Server *
                  </label>
                  <select
                    name="mcp_server_id"
                    id="mcp_server_id"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.mcp_server_id}
                    onChange={handleChange}
                  >
                    <option value="">Select an MCP server</option>
                    {availableServers.map((server) => (
                      <option key={server.id} value={server.id}>
                        {server.name}
                      </option>
                    ))}
                  </select>
                  {selectedServer && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {selectedServer.description || `Docker image: ${selectedServer.docker_image_name}:${selectedServer.docker_image_tag}`}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Deployment Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="my-mcp-deployment"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="namespace" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Namespace
                    </label>
                    <input
                      type="text"
                      name="namespace"
                      id="namespace"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.namespace}
                      onChange={handleChange}
                      placeholder="default"
                    />
                  </div>

                  <div>
                    <label htmlFor="replicas" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Replicas
                    </label>
                    <input
                      type="number"
                      name="replicas"
                      id="replicas"
                      min="1"
                      max="10"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.replicas}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resource Configuration */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Resource Configuration
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="cpu_limit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    CPU Limit
                  </label>
                  <input
                    type="text"
                    name="cpu_limit"
                    id="cpu_limit"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.cpu_limit}
                    onChange={handleChange}
                    placeholder="500m"
                  />
                </div>

                <div>
                  <label htmlFor="memory_limit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Memory Limit
                  </label>
                  <input
                    type="text"
                    name="memory_limit"
                    id="memory_limit"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.memory_limit}
                    onChange={handleChange}
                    placeholder="512Mi"
                  />
                </div>

                <div>
                  <label htmlFor="port" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Port
                  </label>
                  <input
                    type="number"
                    name="port"
                    id="port"
                    min="1"
                    max="65535"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.port}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="health_check_path" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Health Check Path
                </label>
                <input
                  type="text"
                  name="health_check_path"
                  id="health_check_path"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.health_check_path}
                  onChange={handleChange}
                  placeholder="/health"
                />
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Environment Variables
                </h3>
                <button
                  type="button"
                  onClick={addEnvVar}
                  className="btn-outline btn-sm"
                >
                  Add Variable
                </button>
              </div>

              <div className="space-y-3">
                {envVars.map((env, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Key"
                      className="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={env.key}
                      onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      className="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={env.value}
                      onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeEnvVar(index)}
                      className="btn-outline btn-sm text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {envVars.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No environment variables configured.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/deployments"
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={deployMutation.isPending}
              className="btn-primary"
            >
              {deployMutation.isPending ? 'Starting Deployment...' : 'Deploy Server'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
