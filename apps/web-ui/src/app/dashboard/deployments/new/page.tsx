'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Rocket, Settings, Server, Globe } from 'lucide-react';
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
import { useMCPServers, useCreateDeployment } from '@/lib/react-query';

const deploymentCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  mcp_server_id: z.string().min(1, 'MCP server is required'),
  environment: z.enum(['development', 'staging', 'production'], {
    required_error: 'Environment is required',
  }),
  cpu_limit: z.string().optional(),
  memory_limit: z.string().optional(),
  replica_count: z.number().min(1).max(10).optional(),
  auto_scaling: z.boolean().optional(),
  health_check_path: z.string().optional(),
  health_check_interval: z.number().min(10).max(300).optional(),
});

type DeploymentCreateForm = z.infer<typeof deploymentCreateSchema>;

const environmentConfigs = {
  development: {
    cpu_limit: '0.5',
    memory_limit: '512Mi',
    replica_count: 1,
    auto_scaling: false,
  },
  staging: {
    cpu_limit: '1',
    memory_limit: '1Gi',
    replica_count: 2,
    auto_scaling: true,
  },
  production: {
    cpu_limit: '2',
    memory_limit: '2Gi',
    replica_count: 3,
    auto_scaling: true,
  },
};

function NewDeploymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('development');

  const preselectedServerId = searchParams.get('server');
  const createDeployment = useCreateDeployment();
  const { data: mcpServers } = useMCPServers(1, 100);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DeploymentCreateForm>({
    resolver: zodResolver(deploymentCreateSchema),
    defaultValues: {
      environment: 'development',
      mcp_server_id: preselectedServerId || '',
      replica_count: 1,
      auto_scaling: false,
      health_check_path: '/health',
      health_check_interval: 30,
    },
  });

  const selectedServerId = watch('mcp_server_id');
  const environment = watch('environment');

  useEffect(() => {
    if (environment && environmentConfigs[environment as keyof typeof environmentConfigs]) {
      const config = environmentConfigs[environment as keyof typeof environmentConfigs];
      setValue('cpu_limit', config.cpu_limit);
      setValue('memory_limit', config.memory_limit);
      setValue('replica_count', config.replica_count);
      setValue('auto_scaling', config.auto_scaling);
      setSelectedEnvironment(environment);
    }
  }, [environment, setValue]);

  const onSubmit = async (data: DeploymentCreateForm) => {
    try {
      const payload = {
        ...data,
        environment_variables: envVars,
        deployment_config: {
          auto_scaling: data.auto_scaling,
          health_check_path: data.health_check_path,
          health_check_interval_seconds: data.health_check_interval,
        },
      };

      await createDeployment.mutateAsync(payload);
      router.push('/dashboard/deployments');
    } catch (error) {
      console.error('Failed to create deployment:', error);
    }
  };

  const addEnvVar = () => {
    setEnvVars(prev => ({ ...prev, '': '' }));
  };

  const updateEnvVar = (oldKey: string, newKey: string, value: string) => {
    setEnvVars(prev => {
      const updated = { ...prev };
      if (oldKey !== newKey) {
        delete updated[oldKey];
      }
      updated[newKey] = value;
      return updated;
    });
  };

  const removeEnvVar = (key: string) => {
    setEnvVars(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const selectedServer = mcpServers?.items?.find(server => server.id === selectedServerId);
  const readyServers = mcpServers?.items?.filter(server => server.status === 'ready') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/deployments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Deployment</h1>
          <p className="text-muted-foreground mt-1">
            Deploy your MCP server to a target environment
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Rocket className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Configure the basic settings for your deployment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Deployment Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="my-mcp-deployment"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="environment">Environment *</Label>
                <Select onValueChange={(value) => setValue('environment', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
                {errors.environment && (
                  <p className="text-sm text-destructive">{errors.environment.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mcp_server_id">MCP Server *</Label>
              <Select onValueChange={(value) => setValue('mcp_server_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an MCP server" />
                </SelectTrigger>
                <SelectContent>
                  {readyServers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.name} (Ready)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mcp_server_id && (
                <p className="text-sm text-destructive">{errors.mcp_server_id.message}</p>
              )}
              {readyServers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No ready MCP servers available. Please generate a server first.
                </p>
              )}
            </div>

            {selectedServer && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Selected Server Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span> {selectedServer.status}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source API:</span> {selectedServer.api_registration?.name}
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Description:</span> {selectedServer.description || 'No description'}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resource Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Resource Configuration
            </CardTitle>
            <CardDescription>
              Configure CPU, memory, and scaling settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpu_limit">CPU Limit</Label>
                <Input
                  id="cpu_limit"
                  {...register('cpu_limit')}
                  placeholder="1"
                />
                <p className="text-xs text-muted-foreground">
                  CPU cores (e.g., 0.5, 1, 2)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memory_limit">Memory Limit</Label>
                <Input
                  id="memory_limit"
                  {...register('memory_limit')}
                  placeholder="1Gi"
                />
                <p className="text-xs text-muted-foreground">
                  Memory (e.g., 512Mi, 1Gi, 2Gi)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="replica_count">Replica Count</Label>
                <Input
                  id="replica_count"
                  type="number"
                  min="1"
                  max="10"
                  {...register('replica_count', { valueAsNumber: true })}
                  placeholder="1"
                />
                <p className="text-xs text-muted-foreground">
                  Number of instances (1-10)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="health_check_path">Health Check Path</Label>
                <Input
                  id="health_check_path"
                  {...register('health_check_path')}
                  placeholder="/health"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="health_check_interval">Health Check Interval (seconds)</Label>
                <Input
                  id="health_check_interval"
                  type="number"
                  min="10"
                  max="300"
                  {...register('health_check_interval', { valueAsNumber: true })}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Environment Preset: {selectedEnvironment}</h4>
              <p className="text-sm text-muted-foreground">
                Resource limits are automatically configured based on the selected environment.
                You can override these values above.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Environment Variables
                </CardTitle>
                <CardDescription>
                  Configure environment variables for your deployment
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addEnvVar}>
                Add Variable
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {Object.keys(envVars).length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No environment variables configured. Click "Add Variable" to add one.
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(envVars).map(([key, value], index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Variable name"
                      value={key}
                      onChange={(e) => updateEnvVar(key, e.target.value, value)}
                    />
                    <Input
                      placeholder="Variable value"
                      value={value}
                      onChange={(e) => updateEnvVar(key, key, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeEnvVar(key)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/deployments">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting || readyServers.length === 0}>
            {isSubmitting ? 'Creating...' : 'Create Deployment'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewDeploymentPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="w-48 h-8 bg-muted rounded animate-pulse"></div>
            <div className="w-64 h-4 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full h-64 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    }>
      <NewDeploymentForm />
    </Suspense>
  );
}
