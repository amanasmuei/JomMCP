'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Globe,
  Key,
  FileText,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useAPIRegistration,
  useDeleteAPIRegistration,
  useValidateAPIRegistration
} from '@/lib/react-query';
import { formatRelativeTime, getStatusColor, getStatusIcon } from '@/lib/utils';

export default function APIDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const apiId = params.id as string;
  const { data: api, isLoading } = useAPIRegistration(apiId);
  const deleteAPIRegistration = useDeleteAPIRegistration();
  const validateAPIRegistration = useValidateAPIRegistration();

  const handleDelete = async () => {
    try {
      await deleteAPIRegistration.mutateAsync(apiId);
      router.push('/dashboard/apis');
    } catch (error) {
      console.error('Failed to delete API:', error);
    }
  };

  const handleValidate = async () => {
    try {
      await validateAPIRegistration.mutateAsync(apiId);
    } catch (error) {
      console.error('Failed to validate API:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="w-48 h-8 bg-muted rounded animate-pulse"></div>
            <div className="w-64 h-4 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-32 h-6 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="w-full h-4 bg-muted rounded"></div>
                    <div className="w-3/4 h-4 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-6">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="w-24 h-6 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="w-full h-4 bg-muted rounded"></div>
                  <div className="w-2/3 h-4 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!api) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">API Not Found</h3>
        <p className="text-muted-foreground text-center mb-4">
          The API you're looking for doesn't exist or has been deleted.
        </p>
        <Button asChild>
          <Link href="/dashboard/apis">Back to APIs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/apis">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold">{api.name}</h1>
              <Badge className={getStatusColor(api.status)}>
                {api.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {api.description || 'No description provided'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={validateAPIRegistration.isPending}
          >
            <Play className="h-4 w-4 mr-2" />
            {validateAPIRegistration.isPending ? 'Validating...' : 'Validate'}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/apis/${api.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">API Type</label>
                      <p className="font-mono">{api.api_type.toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(api.status)}
                        <span className="capitalize">{api.status}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Base URL</label>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-sm bg-muted px-2 py-1 rounded flex-1">
                        {api.base_url}
                      </p>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={api.base_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                  {api.spec_url && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Specification URL</label>
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-sm bg-muted px-2 py-1 rounded flex-1">
                          {api.spec_url}
                        </p>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={api.spec_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    Authentication Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Type</label>
                      <p className="capitalize">{api.authentication_type.replace('_', ' ')}</p>
                    </div>
                    {api.configuration && Object.keys(api.configuration).length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Configuration</label>
                        <div className="space-y-2 mt-2">
                          {Object.entries(api.configuration).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                              <span className="font-mono text-sm">{key}</span>
                              <span className="font-mono text-sm text-muted-foreground">
                                {key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')
                                  ? '••••••••'
                                  : value
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="headers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Headers</CardTitle>
                </CardHeader>
                <CardContent>
                  {api.configuration?.headers && Object.keys(api.configuration.headers).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(api.configuration.headers).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="font-mono text-sm">{key}</span>
                          <span className="font-mono text-sm text-muted-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No custom headers configured</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Endpoints</CardTitle>
                  <CardDescription>
                    Discovered endpoints from API specification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Endpoint discovery will be implemented in a future update.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{formatRelativeTime(api.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{formatRelativeTime(api.updated_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID</label>
                <p className="font-mono text-xs bg-muted px-2 py-1 rounded">{api.id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" asChild>
                <Link href={`/dashboard/servers/new?api=${api.id}`}>
                  Generate MCP Server
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/docs/generate?api=${api.id}`}>
                  Generate Documentation
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{api.name}"? This action cannot be undone and will also delete any associated MCP servers and deployments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAPIRegistration.isPending}
            >
              {deleteAPIRegistration.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
