'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Rocket,
  Play,
  Square,
  RotateCcw,
  Activity,
  Settings,
  FileText,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useDeployment,
  useDeploymentLogs,
  useStartDeployment,
  useStopDeployment,
  useDeleteDeployment
} from '@/lib/react-query';
import { formatRelativeTime, getStatusColor, getStatusIcon } from '@/lib/utils';

export default function DeploymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deploymentId = params.id as string;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: deployment, isLoading, error } = useDeployment(deploymentId);
  const { data: logs } = useDeploymentLogs(deploymentId);
  const startDeployment = useStartDeployment();
  const stopDeployment = useStopDeployment();
  const deleteDeploymentMutation = useDeleteDeployment();

  const handleStart = async () => {
    try {
      await startDeployment.mutateAsync(deploymentId);
    } catch (error) {
      console.error('Failed to start deployment:', error);
    }
  };

  const handleStop = async () => {
    try {
      await stopDeployment.mutateAsync(deploymentId);
    } catch (error) {
      console.error('Failed to stop deployment:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDeploymentMutation.mutateAsync(deploymentId);
      router.push('/dashboard/deployments');
    } catch (error) {
      console.error('Failed to delete deployment:', error);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-500';
      case 'unhealthy': return 'text-red-500';
      case 'degraded': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getResourceUsage = () => {
    // Mock resource usage - in real app this would come from monitoring
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      requests: Math.floor(Math.random() * 1000),
      uptime: '2h 34m',
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-32"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-4 bg-muted rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-6">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 bg-muted rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !deployment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/deployments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Deployment Not Found</h1>
            <p className="text-muted-foreground mt-1">
              The requested deployment could not be found.
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Deployment Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The deployment you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link href="/dashboard/deployments">
                Back to Deployments
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const resources = getResourceUsage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/deployments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold">{deployment.name}</h1>
              <Badge className={getStatusColor(deployment.status)}>
                {deployment.status}
              </Badge>
              <Badge variant="outline">{deployment.environment}</Badge>
              {deployment.health && (
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    deployment.health === 'healthy' ? 'bg-green-500' :
                    deployment.health === 'unhealthy' ? 'bg-red-500' :
                    deployment.health === 'degraded' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                  <span className={`text-xs ${getHealthColor(deployment.health)}`}>
                    {deployment.health}
                  </span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Deployed from {deployment.mcp_server?.name || 'Unknown Server'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {deployment.status === 'stopped' && (
            <Button
              onClick={handleStart}
              disabled={startDeployment.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              {startDeployment.isPending ? 'Starting...' : 'Start'}
            </Button>
          )}
          {deployment.status === 'running' && (
            <Button
              variant="outline"
              onClick={handleStop}
              disabled={stopDeployment.isPending}
            >
              <Square className="h-4 w-4 mr-2" />
              {stopDeployment.isPending ? 'Stopping...' : 'Stop'}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Real-time Metrics for Running Deployments */}
      {deployment.status === 'running' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CPU Usage</p>
                  <p className="text-2xl font-bold">{resources.cpu}%</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
              <Progress value={resources.cpu} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Memory Usage</p>
                  <p className="text-2xl font-bold">{resources.memory}%</p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
              <Progress value={resources.memory} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Requests/min</p>
                  <p className="text-2xl font-bold">{resources.requests}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                  <p className="text-2xl font-bold">{resources.uptime}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Rocket className="h-5 w-5 mr-2" />
                    Deployment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(deployment.status)}
                        <span className="capitalize">{deployment.status}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Environment</label>
                      <p className="capitalize">{deployment.environment}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">MCP Server</label>
                      <div className="flex items-center space-x-2">
                        <span>{deployment.mcp_server?.name || 'Unknown'}</span>
                        {deployment.mcp_server && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/servers/${deployment.mcp_server_id}`}>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Replicas</label>
                      <p>{deployment.replica_count || 1}</p>
                    </div>
                  </div>
                  {deployment.endpoint_url && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Endpoint URL</label>
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-sm bg-muted px-2 py-1 rounded flex-1">
                          {deployment.endpoint_url}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(deployment.endpoint_url!, 'endpoint_url')}
                        >
                          {copiedField === 'endpoint_url' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={deployment.endpoint_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configuration" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Resource Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">CPU Limit</label>
                      <p className="font-mono">{deployment.cpu_limit || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Memory Limit</label>
                      <p className="font-mono">{deployment.memory_limit || 'Not set'}</p>
                    </div>
                  </div>
                  {deployment.environment_variables && Object.keys(deployment.environment_variables).length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Environment Variables</label>
                      <div className="space-y-2 mt-2">
                        {Object.entries(deployment.environment_variables).map(([key, value]) => (
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Deployment Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                    {logs ? (
                      <pre className="whitespace-pre-wrap">{logs}</pre>
                    ) : (
                      <p className="text-muted-foreground">No logs available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Performance Monitoring
                  </CardTitle>
                  <CardDescription>
                    Real-time performance metrics and health status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {deployment.status === 'running' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">CPU Usage</span>
                            <span>{resources.cpu}%</span>
                          </div>
                          <Progress value={resources.cpu} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Memory Usage</span>
                            <span>{resources.memory}%</span>
                          </div>
                          <Progress value={resources.memory} className="h-2" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Requests/min:</span>
                          <span className="ml-2 font-medium">{resources.requests}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Uptime:</span>
                          <span className="ml-2 font-medium">{resources.uptime}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Health:</span>
                          <span className={`ml-2 font-medium ${getHealthColor(deployment.health || 'unknown')}`}>
                            {deployment.health || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Monitoring data is only available for running deployments
                      </p>
                    </div>
                  )}
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
                <p className="text-sm">{formatRelativeTime(deployment.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{formatRelativeTime(deployment.updated_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Deployment ID</label>
                <p className="font-mono text-xs bg-muted px-2 py-1 rounded">{deployment.id}</p>
              </div>
              {deployment.container_id && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Container ID</label>
                  <p className="font-mono text-xs bg-muted px-2 py-1 rounded">{deployment.container_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {deployment.status === 'stopped' && (
                <Button
                  className="w-full"
                  onClick={handleStart}
                  disabled={startDeployment.isPending}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {startDeployment.isPending ? 'Starting...' : 'Start Deployment'}
                </Button>
              )}
              {deployment.status === 'running' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleStop}
                  disabled={stopDeployment.isPending}
                >
                  <Square className="h-4 w-4 mr-2" />
                  {stopDeployment.isPending ? 'Stopping...' : 'Stop Deployment'}
                </Button>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/servers/${deployment.mcp_server_id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View MCP Server
                </Link>
              </Button>
              {deployment.endpoint_url && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={deployment.endpoint_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Endpoint
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deployment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deployment.name}"? This action cannot be undone and will stop the deployment if it's currently running.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteDeploymentMutation.isPending}
            >
              {deleteDeploymentMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
