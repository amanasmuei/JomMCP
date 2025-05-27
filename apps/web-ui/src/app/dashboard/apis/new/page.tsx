'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Globe, Key, FileText } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateAPIRegistration } from '@/lib/react-query';
import { APIType, AuthenticationType } from '@/types/api';

const apiRegistrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  api_type: z.nativeEnum(APIType, {
    required_error: 'API type is required',
  }),
  base_url: z.string().url('Must be a valid URL'),
  authentication_type: z.nativeEnum(AuthenticationType, {
    required_error: 'Authentication type is required',
  }),
  credentials: z.record(z.string()).optional(),
  headers: z.record(z.string()).optional(),
  spec_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type APIRegistrationForm = z.infer<typeof apiRegistrationSchema>;

export default function NewAPIPage() {
  const router = useRouter();
  const [authHeaders, setAuthHeaders] = useState<Record<string, string>>({});
  const [customHeaders, setCustomHeaders] = useState<Record<string, string>>({});

  const createAPIRegistration = useCreateAPIRegistration();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<APIRegistrationForm>({
    resolver: zodResolver(apiRegistrationSchema),
    defaultValues: {
      authentication_type: AuthenticationType.NONE,
      api_type: APIType.REST,
    },
  });

  const authType = watch('authentication_type');

  const onSubmit = async (data: APIRegistrationForm) => {
    try {
      const payload = {
        ...data,
        credentials: authHeaders,
        headers: customHeaders,
        spec_url: data.spec_url || undefined,
      };

      await createAPIRegistration.mutateAsync(payload);
      router.push('/dashboard/apis');
    } catch (error) {
      console.error('Failed to create API registration:', error);
    }
  };

  const addAuthHeader = () => {
    setAuthHeaders(prev => ({ ...prev, '': '' }));
  };

  const updateAuthHeader = (oldKey: string, newKey: string, value: string) => {
    setAuthHeaders(prev => {
      const updated = { ...prev };
      if (oldKey !== newKey) {
        delete updated[oldKey];
      }
      updated[newKey] = value;
      return updated;
    });
  };

  const removeAuthHeader = (key: string) => {
    setAuthHeaders(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const addCustomHeader = () => {
    setCustomHeaders(prev => ({ ...prev, '': '' }));
  };

  const updateCustomHeader = (oldKey: string, newKey: string, value: string) => {
    setCustomHeaders(prev => {
      const updated = { ...prev };
      if (oldKey !== newKey) {
        delete updated[oldKey];
      }
      updated[newKey] = value;
      return updated;
    });
  };

  const removeCustomHeader = (key: string) => {
    setCustomHeaders(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/apis">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Register New API</h1>
          <p className="text-muted-foreground mt-1">
            Add a new API to start generating MCP servers
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Provide basic details about your API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">API Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="My API"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_type">API Type *</Label>
                <Select onValueChange={(value) => setValue('api_type', value as APIType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select API type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={APIType.REST}>REST API</SelectItem>
                    <SelectItem value={APIType.GRAPHQL}>GraphQL</SelectItem>
                    <SelectItem value={APIType.GRPC}>gRPC</SelectItem>
                  </SelectContent>
                </Select>
                {errors.api_type && (
                  <p className="text-sm text-destructive">{errors.api_type.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe what this API does..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_url">Base URL *</Label>
              <Input
                id="base_url"
                {...register('base_url')}
                placeholder="https://api.example.com"
                type="url"
              />
              {errors.base_url && (
                <p className="text-sm text-destructive">{errors.base_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="spec_url">Specification URL</Label>
              <Input
                id="spec_url"
                {...register('spec_url')}
                placeholder="https://api.example.com/openapi.json"
                type="url"
              />
              <p className="text-sm text-muted-foreground">
                Optional: OpenAPI/Swagger specification URL for better code generation
              </p>
              {errors.spec_url && (
                <p className="text-sm text-destructive">{errors.spec_url.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Authentication
            </CardTitle>
            <CardDescription>
              Configure how to authenticate with your API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="authentication_type">Authentication Type *</Label>
              <Select onValueChange={(value) => setValue('authentication_type', value as AuthenticationType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select authentication type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AuthenticationType.NONE}>No Authentication</SelectItem>
                  <SelectItem value={AuthenticationType.API_KEY}>API Key</SelectItem>
                  <SelectItem value={AuthenticationType.BEARER_TOKEN}>Bearer Token</SelectItem>
                  <SelectItem value={AuthenticationType.BASIC_AUTH}>Basic Authentication</SelectItem>
                </SelectContent>
              </Select>
              {errors.authentication_type && (
                <p className="text-sm text-destructive">{errors.authentication_type.message}</p>
              )}
            </div>

            {authType !== AuthenticationType.NONE && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Authentication Configuration</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addAuthHeader}>
                    Add Field
                  </Button>
                </div>
                <div className="space-y-2">
                  {Object.entries(authHeaders).map(([key, value], index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Field name"
                        value={key}
                        onChange={(e) => updateAuthHeader(key, e.target.value, value)}
                      />
                      <Input
                        placeholder="Field value"
                        value={value}
                        onChange={(e) => updateAuthHeader(key, key, e.target.value)}
                        type={key.toLowerCase().includes('password') ? 'password' : 'text'}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeAuthHeader(key)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Headers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Custom Headers</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCustomHeader}>
                  Add Header
                </Button>
              </div>
              <div className="space-y-2">
                {Object.entries(customHeaders).map(([key, value], index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Header name"
                      value={key}
                      onChange={(e) => updateCustomHeader(key, e.target.value, value)}
                    />
                    <Input
                      placeholder="Header value"
                      value={value}
                      onChange={(e) => updateCustomHeader(key, key, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeCustomHeader(key)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/apis">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Register API'}
          </Button>
        </div>
      </form>
    </div>
  );
}
