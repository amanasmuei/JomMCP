'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mcpApi } from '@/lib/api/mcp';
import { MCPServer } from '@/types/mcp';
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
  Server,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Play,
  Square,
  LayoutDashboard,
} from 'lucide-react';

export default function MCPServersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: serversData, isLoading, error, refetch } = useQuery({
    queryKey: ['mcp-servers', currentPage, pageSize],
    queryFn: () => mcpApi.list(),
  });

  // WebSocket for real-time updates
  useWebSocket('/generation/status', {
    onMessage: (message) => {
      if (message.type === 'generation_status' || message.type === 'deployment_status') {
        refetch();
      }
    },
  });

  const servers = serversData?.items || [];

  const getStatusIcon = (status: MCPServer['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'stopped':
        return <Square className="h-4 w-4 text-gray-500" />;
      case 'error':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      case 'generating':
      case 'building':
      case 'deploying':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'ready':
        return <Play className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: MCPServer['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">Running</Badge>;
      case 'ready':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Ready</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'generating':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Generating</Badge>;
      case 'building':
        return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">Building</Badge>;
      case 'deploying':
        return <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">Deploying</Badge>;
      case 'stopped':
        return <Badge variant="secondary">Stopped</Badge>;
      case 'error':
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredServers = servers.filter(server => {
    const matchesSearch = !searchTerm ||
      server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || server.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'MCP Servers', icon: Server }
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
              Error loading MCP servers
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
            <h1 className="text-3xl font-bold text-foreground mb-2">MCP Servers</h1>
            <p className="text-muted-foreground text-lg">
              Manage your generated MCP servers and their deployments
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/mcp-servers/new">
              <Plus className="h-4 w-4 mr-2" />
              Generate Server
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
                  placeholder="Search MCP servers..."
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
                <option value="generating">Generating</option>
                <option value="building">Building</option>
                <option value="ready">Ready</option>
                <option value="deploying">Deploying</option>
                <option value="running">Running</option>
                <option value="stopped">Stopped</option>
                <option value="error">Error</option>
                <option value="failed">Failed</option>
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
            <p className="text-muted-foreground">Loading MCP servers...</p>
          </CardContent>
        </Card>
      ) : filteredServers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Server className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No matching servers' : 'No MCP servers'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by generating your first MCP server.'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button asChild>
                <Link href="/dashboard/mcp-servers/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Server
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Grid View */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServers.map((server) => (
              <Card key={server.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(server.status)}
                      <CardTitle className="text-lg truncate">
                        {server.name}
                      </CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    {getStatusBadge(server.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {server.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {server.description}
                    </p>
                  )}

                  <div className="space-y-2 text-xs text-muted-foreground">
                    {server.docker_image_name && (
                      <div>
                        <span className="font-medium">Image:</span> {server.docker_image_name}:{server.docker_image_tag}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Created:</span> {new Date(server.created_at).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span> {new Date(server.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  {server.error_message && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm text-destructive">
                        {server.error_message}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/mcp-servers/${server.id}`}>
                        View Details
                      </Link>
                    </Button>
                    {server.status === 'ready' && (
                      <Button variant="default" size="sm" asChild>
                        <Link href={`/dashboard/deployments/new?server=${server.id}`}>
                          Deploy
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
