'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Server, Search, Filter, Download, Eye, Code, Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useMCPServers, useDownloadMCPServerCode } from '@/lib/react-query';
import { formatRelativeTime, getStatusColor, getStatusIcon } from '@/lib/utils';

export default function ServersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: mcpServers, isLoading } = useMCPServers(page, 20);
  const downloadMCPServerCode = useDownloadMCPServerCode();

  const handleDownload = async (serverId: string) => {
    try {
      await downloadMCPServerCode.mutateAsync(serverId);
    } catch (error) {
      console.error('Failed to download server code:', error);
    }
  };

  const filteredServers = mcpServers?.items?.filter(server =>
    server.name.toLowerCase().includes(search.toLowerCase()) ||
    server.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'generating': return 25;
      case 'building': return 50;
      case 'testing': return 75;
      case 'ready': return 100;
      case 'failed': return 0;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">MCP Servers</h1>
          <p className="text-muted-foreground mt-1">
            Generated MCP servers from your registered APIs
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button asChild>
            <Link href="/dashboard/servers/new">
              <Plus className="h-4 w-4 mr-2" />
              Generate Server
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search servers..."
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

      {/* Servers Grid */}
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
      ) : filteredServers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Server className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No MCP servers found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {search ? 'No servers match your search criteria.' : 'Get started by generating your first MCP server.'}
            </p>
            <Button asChild>
              <Link href="/dashboard/servers/new">
                <Plus className="h-4 w-4 mr-2" />
                Generate Server
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServers.map((server) => (
            <Card key={server.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{server.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge className={getStatusColor(server.status)}>
                        {server.status}
                      </Badge>
                      {server.version && (
                        <Badge variant="outline">v{server.version}</Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="text-lg">
                    {getStatusIcon(server.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar for Generation Status */}
                {['pending', 'generating', 'building', 'testing'].includes(server.status) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-muted-foreground">{getProgressValue(server.status)}%</span>
                    </div>
                    <Progress value={getProgressValue(server.status)} className="h-2" />
                  </div>
                )}

                {/* Server Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API Source:</span>
                    <span className="font-medium truncate max-w-[120px]">
                      {server.api_registration?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatRelativeTime(server.created_at)}</span>
                  </div>
                  {server.description && (
                    <p className="text-muted-foreground text-xs mt-2 line-clamp-2">
                      {server.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/servers/${server.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>

                  {server.status === 'ready' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(server.id)}
                        disabled={downloadMCPServerCode.isPending}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Code
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/deployments/new?server=${server.id}`}>
                          <Play className="h-3 w-3 mr-1" />
                          Deploy
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {mcpServers && mcpServers.total > 20 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(mcpServers.total / 20)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(mcpServers.total / 20)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
