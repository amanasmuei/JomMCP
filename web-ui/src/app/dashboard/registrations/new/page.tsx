'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { registrationsApi } from '@/lib/api/registrations';
import { APIRegistrationCreate } from '@/types/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function NewRegistrationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<APIRegistrationCreate>({
    name: '',
    description: '',
    base_url: '',
    api_type: 'rest',
    authentication_type: 'none',
    credentials: {},
    health_check_url: '',
    health_check_interval_seconds: 300,
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const createMutation = useMutation({
    mutationFn: registrationsApi.create,
    onSuccess: (data) => {
      toast.success('API registered successfully!');
      router.push(`/dashboard/registrations/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to register API');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCredentialChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [key]: value,
      },
    }));
  };

  const validateAPI = async () => {
    if (!formData.base_url) {
      toast.error('Please enter a base URL first');
      return;
    }

    setIsValidating(true);
    try {
      const result = await registrationsApi.validate({
        base_url: formData.base_url,
        authentication_type: formData.authentication_type,
        credentials: formData.credentials,
      });
      setValidationResult(result);

      if (result.is_valid) {
        toast.success('API validation successful!');
        if (result.detected_api_type && result.detected_api_type !== formData.api_type) {
          setFormData(prev => ({
            ...prev,
            api_type: result.detected_api_type,
          }));
        }
      } else {
        toast.error(`API validation failed: ${result.error_message}`);
      }
    } catch (error: any) {
      toast.error('Failed to validate API');
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  const renderCredentialFields = () => {
    switch (formData.authentication_type) {
      case 'api_key':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">API Key</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.credentials?.api_key || ''}
                onChange={(e) => handleCredentialChange('api_key', e.target.value)}
                placeholder="Enter your API key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Header Name (optional)</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.credentials?.header_name || ''}
                onChange={(e) => handleCredentialChange('header_name', e.target.value)}
                placeholder="X-API-Key"
              />
            </div>
          </div>
        );
      case 'bearer_token':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">Bearer Token</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.credentials?.token || ''}
              onChange={(e) => handleCredentialChange('token', e.target.value)}
              placeholder="Enter your bearer token"
            />
          </div>
        );
      case 'basic_auth':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.credentials?.username || ''}
                onChange={(e) => handleCredentialChange('username', e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.credentials?.password || ''}
                onChange={(e) => handleCredentialChange('password', e.target.value)}
                placeholder="Enter password"
              />
            </div>
          </div>
        );
      case 'oauth2_client_credentials':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client ID</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.credentials?.client_id || ''}
                onChange={(e) => handleCredentialChange('client_id', e.target.value)}
                placeholder="Enter client ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Secret</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.credentials?.client_secret || ''}
                onChange={(e) => handleCredentialChange('client_secret', e.target.value)}
                placeholder="Enter client secret"
              />
            </div>
          </div>
        );
      case 'oauth2_authorization_code':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client ID</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.credentials?.client_id || ''}
                onChange={(e) => handleCredentialChange('client_id', e.target.value)}
                placeholder="Enter client ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Secret</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.credentials?.client_secret || ''}
                onChange={(e) => handleCredentialChange('client_secret', e.target.value)}
                placeholder="Enter client secret"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Redirect URI</label>
              <input
                type="url"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.credentials?.redirect_uri || ''}
                onChange={(e) => handleCredentialChange('redirect_uri', e.target.value)}
                placeholder="Enter redirect URI"
              />
            </div>
          </div>
        );
      case 'jwt':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">JWT Token</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                value={formData.credentials?.token || ''}
                onChange={(e) => handleCredentialChange('token', e.target.value)}
                placeholder="Enter JWT token"
              />
            </div>
          </div>
        );
      case 'custom':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Custom Headers (JSON)</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                value={formData.credentials?.headers || ''}
                onChange={(e) => handleCredentialChange('headers', e.target.value)}
                placeholder='{"Authorization": "Custom token", "X-API-Key": "value"}'
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Register New API</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    API Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="My Awesome API"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of your API"
                  />
                </div>

                <div>
                  <label htmlFor="base_url" className="block text-sm font-medium text-gray-700">
                    Base URL *
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="url"
                      name="base_url"
                      id="base_url"
                      required
                      className="flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      value={formData.base_url}
                      onChange={handleChange}
                      placeholder="https://api.example.com"
                    />
                    <button
                      type="button"
                      onClick={validateAPI}
                      disabled={isValidating || !formData.base_url}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100 disabled:opacity-50"
                    >
                      {isValidating ? 'Validating...' : 'Validate'}
                    </button>
                  </div>
                  {validationResult && (
                    <div className={`mt-2 flex items-center text-sm ${validationResult.is_valid ? 'text-green-600' : 'text-red-600'}`}>
                      {validationResult.is_valid && <CheckCircleIcon className="h-4 w-4 mr-1" />}
                      {validationResult.is_valid ? 'API is accessible' : validationResult.error_message}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="api_type" className="block text-sm font-medium text-gray-700">
                    API Type *
                  </label>
                  <select
                    name="api_type"
                    id="api_type"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.api_type}
                    onChange={handleChange}
                  >
                    <option value="rest">REST API</option>
                    <option value="graphql">GraphQL</option>
                    <option value="soap">SOAP</option>
                    <option value="grpc">gRPC</option>
                    <option value="websocket">WebSocket</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Authentication
              </h3>

              <div className="space-y-6">
                <div>
                  <label htmlFor="authentication_type" className="block text-sm font-medium text-gray-700">
                    Authentication Type
                  </label>
                  <select
                    name="authentication_type"
                    id="authentication_type"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.authentication_type}
                    onChange={handleChange}
                  >
                    <option value="none">No Authentication</option>
                    <option value="api_key">API Key</option>
                    <option value="bearer_token">Bearer Token</option>
                    <option value="basic_auth">Basic Authentication</option>
                    <option value="oauth2_client_credentials">OAuth 2.0 Client Credentials</option>
                    <option value="oauth2_authorization_code">OAuth 2.0 Authorization Code</option>
                    <option value="jwt">JWT</option>
                  </select>
                </div>

                {formData.authentication_type !== 'none' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Credentials</h4>
                    {renderCredentialFields()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Health Check */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Health Check (Optional)
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="health_check_url" className="block text-sm font-medium text-gray-700">
                    Health Check URL
                  </label>
                  <input
                    type="url"
                    name="health_check_url"
                    id="health_check_url"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.health_check_url}
                    onChange={handleChange}
                    placeholder="https://api.example.com/health"
                  />
                </div>

                <div>
                  <label htmlFor="health_check_interval_seconds" className="block text-sm font-medium text-gray-700">
                    Check Interval (seconds)
                  </label>
                  <input
                    type="number"
                    name="health_check_interval_seconds"
                    id="health_check_interval_seconds"
                    min="60"
                    max="3600"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.health_check_interval_seconds}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard"
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary"
            >
              {createMutation.isPending ? 'Registering...' : 'Register API'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
