'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { deploymentsApi } from '@/lib/api/deployments';
import { Deployment } from '@/types/mcp';
import { useWebSocket } from '@/hooks/useWebSocket';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Cloud,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Play,
  Square,
  RotateCcw,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react';

export default function DeploymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: deploymentsData, isLoading, error, refetch } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => deploymentsApi.list(),
  });

  // WebSocket for real-time updates
  useWebSocket('/deployment/status', {
    onMessage: (message) => {
      if (message.type === 'deployment_status') {
        refetch();
      }
    },
  });

  const deployments = deploymentsData?.items || [];

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'stopped':
        return <Square className="h-4 w-4 text-gray-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      case 'deploying':
      case 'scaling':
      case 'updating':
      case 'stopping':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Deployment['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">Running</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'deploying':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Deploying</Badge>;
      case 'scaling':
        return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">Scaling</Badge>;
      case 'updating':
        return <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">Updating</Badge>;
      case 'stopping':
        return <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">Stopping</Badge>;
      case 'stopped':
        return <Badge variant="secondary">Stopped</Badge>;
      case 'failed':
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredDeployments = deployments.filter(deployment => {
    const matchesSearch = !searchTerm ||
      deployment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deployment.namespace?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || deployment.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Deployments', icon: Cloud }
  ];

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Error loading deployments
            </h3>
            <p className="text-muted-foreground">
              Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Deployments</h1>
            <p className="text-muted-foreground text-lg">
              Manage your MCP server deployments and monitor their status
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/deployments/new">
              <Plus className="h-4 w-4 mr-2" />
              New Deployment
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search deployments..."
                  className="pl-10 pr-4 py-2 w-full border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="border border-border rounded-md bg-background text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="deploying">Deploying</option>
                <option value="running">Running</option>
                <option value="scaling">Scaling</option>
                <option value="updating">Updating</option>
                <option value="stopping">Stopping</option>
                <option value="stopped">Stopped</option>
                <option value="failed">Failed</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading deployments...</p>
          </CardContent>
        </Card>
      ) : filteredDeployments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Cloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No matching deployments' : 'No deployments'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by deploying your first MCP server.'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button asChild>
                <Link href="/dashboard/deployments/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Deployment
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDeployments.map((deployment) => (
            <Card key={deployment.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(deployment.status)}
                    <CardTitle className="text-lg truncate">
                      {deployment.name}
                    </CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2">
                  {getStatusBadge(deployment.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  {deployment.namespace && (
                    <div>
                      <span className="font-medium">Namespace:</span> {deployment.namespace}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Replicas:</span> {deployment.replicas}
                  </div>
                  <div>
                    <span className="font-medium">Port:</span> {deployment.port}
                  </div>
                  {deployment.external_url && (
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">URL:</span>
                      <a
                        href={deployment.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors flex items-center space-x-1"
                      >
                        <span className="truncate">{deployment.external_url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Created:</span> {new Date(deployment.created_at).toLocaleDateString()}
                  </div>
                </div>

                {deployment.error_message && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">
                      {deployment.error_message}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/deployments/${deployment.id}`}>
                      View Details
                    </Link>
                  </Button>
                  {deployment.status === 'running' && (
                    <Button variant="secondary" size="sm">
                      Scale
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
