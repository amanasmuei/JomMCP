'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Rocket, Search, Filter, Play, Square, Eye, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  useDeployments,
  useStartDeployment,
  useStopDeployment
} from '@/lib/react-query';
import { formatRelativeTime, getStatusColor, getStatusIcon } from '@/lib/utils';

export default function DeploymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: deployments, isLoading } = useDeployments(page, 20);
  const startDeployment = useStartDeployment();
  const stopDeployment = useStopDeployment();

  const handleStart = async (deploymentId: string) => {
    try {
      await startDeployment.mutateAsync(deploymentId);
    } catch (error) {
      console.error('Failed to start deployment:', error);
    }
  };

  const handleStop = async (deploymentId: string) => {
    try {
      await stopDeployment.mutateAsync(deploymentId);
    } catch (error) {
      console.error('Failed to stop deployment:', error);
    }
  };

  const filteredDeployments = deployments?.items?.filter(deployment =>
    deployment.name.toLowerCase().includes(search.toLowerCase()) ||
    deployment.environment?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-500';
      case 'unhealthy': return 'bg-red-500';
      case 'degraded': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getResourceUsage = (deployment: any) => {
    // Mock resource usage - in real app this would come from monitoring
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      requests: Math.floor(Math.random() * 1000),
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deployments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your deployed MCP servers and their environments
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button asChild>
            <Link href="/dashboard/deployments/new">
              <Plus className="h-4 w-4 mr-2" />
              New Deployment
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deployments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Deployments Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDeployments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Rocket className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No deployments found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {search ? 'No deployments match your search criteria.' : 'Get started by creating your first deployment.'}
            </p>
            <Button asChild>
              <Link href="/dashboard/deployments/new">
                <Plus className="h-4 w-4 mr-2" />
                New Deployment
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeployments.map((deployment) => {
            const resources = getResourceUsage(deployment);

            return (
              <Card key={deployment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{deployment.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge className={getStatusColor(deployment.status)}>
                          {deployment.status}
                        </Badge>
                        <Badge variant="outline">{deployment.environment}</Badge>
                        {deployment.health && (
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getHealthColor(deployment.health)}`}></div>
                            <span className="text-xs">{deployment.health}</span>
                          </div>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-lg">
                      {getStatusIcon(deployment.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Resource Usage */}
                  {deployment.status === 'running' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">CPU</span>
                          <span>{resources.cpu}%</span>
                        </div>
                        <Progress value={resources.cpu} className="h-1" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Memory</span>
                          <span>{resources.memory}%</span>
                        </div>
                        <Progress value={resources.memory} className="h-1" />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Requests/min</span>
                        <span>{resources.requests}</span>
                      </div>
                    </div>
                  )}

                  {/* Deployment Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MCP Server:</span>
                      <span className="font-medium truncate max-w-[120px]">
                        {deployment.mcp_server?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{formatRelativeTime(deployment.created_at)}</span>
                    </div>
                    {deployment.url && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">URL:</span>
                        <a
                          href={deployment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs truncate max-w-[120px]"
                        >
                          {deployment.url}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/deployments/${deployment.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Link>
                    </Button>

                    {deployment.status === 'stopped' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStart(deployment.id)}
                        disabled={startDeployment.isPending}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    )}

                    {deployment.status === 'running' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStop(deployment.id)}
                        disabled={stopDeployment.isPending}
                      >
                        <Square className="h-3 w-3 mr-1" />
                        Stop
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {deployments && deployments.total > 20 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(deployments.total / 20)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(deployments.total / 20)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
