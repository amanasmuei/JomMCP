'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Server, Settings, Code } from 'lucide-react';
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
import { useAPIRegistrations, useGenerateMCPServer } from '@/lib/react-query';

const mcpServerGenerationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  api_registration_id: z.string().min(1, 'API registration is required'),
  language: z.enum(['python', 'typescript', 'go'], {
    required_error: 'Programming language is required',
  }),
  framework: z.string().optional(),
  features: z.array(z.string()).optional(),
  config: z.record(z.string()).optional(),
});

type MCPServerGenerationForm = z.infer<typeof mcpServerGenerationSchema>;

const languageFrameworks = {
  python: ['fastapi', 'flask', 'django'],
  typescript: ['express', 'nestjs', 'koa'],
  go: ['gin', 'echo', 'fiber'],
};

const availableFeatures = [
  { id: 'authentication', label: 'Authentication Support', description: 'Include authentication handling' },
  { id: 'validation', label: 'Input Validation', description: 'Add request/response validation' },
  { id: 'logging', label: 'Logging', description: 'Include structured logging' },
  { id: 'metrics', label: 'Metrics', description: 'Add performance metrics' },
  { id: 'caching', label: 'Caching', description: 'Include response caching' },
  { id: 'rate_limiting', label: 'Rate Limiting', description: 'Add rate limiting support' },
  { id: 'documentation', label: 'Auto Documentation', description: 'Generate API documentation' },
  { id: 'testing', label: 'Unit Tests', description: 'Include unit test templates' },
];

function NewMCPServerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [configFields, setConfigFields] = useState<Record<string, string>>({});

  const preselectedApiId = searchParams.get('api');
  const generateMCPServer = useGenerateMCPServer();
  const { data: apiRegistrations } = useAPIRegistrations(1, 100);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MCPServerGenerationForm>({
    resolver: zodResolver(mcpServerGenerationSchema),
    defaultValues: {
      language: 'python',
      framework: 'fastapi',
      api_registration_id: preselectedApiId || '',
    },
  });

  const selectedLanguage = watch('language');
  const selectedApiId = watch('api_registration_id');

  useEffect(() => {
    if (selectedLanguage) {
      const frameworks = languageFrameworks[selectedLanguage];
      setValue('framework', frameworks[0]);
    }
  }, [selectedLanguage, setValue]);

  const onSubmit = async (data: MCPServerGenerationForm) => {
    try {
      const payload = {
        ...data,
        features: selectedFeatures,
        config: configFields,
      };

      await generateMCPServer.mutateAsync(payload);
      router.push('/dashboard/servers');
    } catch (error) {
      console.error('Failed to generate MCP server:', error);
    }
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const addConfigField = () => {
    setConfigFields(prev => ({ ...prev, '': '' }));
  };

  const updateConfigField = (oldKey: string, newKey: string, value: string) => {
    setConfigFields(prev => {
      const updated = { ...prev };
      if (oldKey !== newKey) {
        delete updated[oldKey];
      }
      updated[newKey] = value;
      return updated;
    });
  };

  const removeConfigField = (key: string) => {
    setConfigFields(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const selectedApi = apiRegistrations?.items?.find(api => api.id === selectedApiId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/servers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Generate MCP Server</h1>
          <p className="text-muted-foreground mt-1">
            Create a new MCP server from your registered API
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Configure the basic settings for your MCP server
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Server Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="My MCP Server"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_registration_id">Source API *</Label>
                <Select onValueChange={(value) => setValue('api_registration_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an API" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiRegistrations?.items?.map((api) => (
                      <SelectItem key={api.id} value={api.id}>
                        {api.name} ({api.api_type.toUpperCase()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.api_registration_id && (
                  <p className="text-sm text-destructive">{errors.api_registration_id.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe what this MCP server does..."
                rows={3}
              />
            </div>

            {selectedApi && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Selected API Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span> {selectedApi.api_type.toUpperCase()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span> {selectedApi.status}
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Base URL:</span> {selectedApi.base_url}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Technical Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="h-5 w-5 mr-2" />
              Technical Configuration
            </CardTitle>
            <CardDescription>
              Choose the programming language and framework
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Programming Language *</Label>
                <Select onValueChange={(value) => setValue('language', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                  </SelectContent>
                </Select>
                {errors.language && (
                  <p className="text-sm text-destructive">{errors.language.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="framework">Framework</Label>
                <Select onValueChange={(value) => setValue('framework', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedLanguage && languageFrameworks[selectedLanguage]?.map((framework) => (
                      <SelectItem key={framework} value={framework}>
                        {framework.charAt(0).toUpperCase() + framework.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Features
            </CardTitle>
            <CardDescription>
              Select additional features to include in your MCP server
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedFeatures.includes(feature.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  }`}
                  onClick={() => toggleFeature(feature.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-4 h-4 rounded border-2 mt-0.5 ${
                      selectedFeatures.includes(feature.id)
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {selectedFeatures.includes(feature.id) && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{feature.label}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/servers">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Generating...' : 'Generate MCP Server'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewMCPServerPage() {
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
      <NewMCPServerForm />
    </Suspense>
  );
}
