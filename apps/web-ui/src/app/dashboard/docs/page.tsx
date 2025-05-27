'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mcpApi } from '@/lib/api/mcp';
import { MCPServer } from '@/types/mcp';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import {
  Search,
  Filter,
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  Code,
  Globe,
  LayoutDashboard,
  AlertTriangle,
} from 'lucide-react';

export default function DocumentationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFormat, setFilterFormat] = useState<string>('all');

  const { data: serversData, isLoading, error } = useQuery({
    queryKey: ['mcp-servers'],
    queryFn: () => mcpApi.list(),
  });

  const servers = serversData?.items || [];

  const filteredServers = servers.filter(server => {
    const matchesSearch = !searchTerm ||
      server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (server.description && server.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterFormat === 'all' || server.status === 'ready';

    return matchesSearch && matchesFilter;
  });

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Documentation', icon: FileText }
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
              Error loading documentation
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Documentation</h1>
            <p className="text-muted-foreground text-lg">
              Browse and download generated API documentation for your MCP servers
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search documentation..."
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
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value)}
              >
                <option value="all">All Servers</option>
                <option value="ready">Ready Only</option>
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
            <p className="text-muted-foreground">Loading documentation...</p>
          </CardContent>
        </Card>
      ) : filteredServers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm ? 'No matching documentation' : 'No documentation available'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Generate MCP servers to create documentation.'
              }
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link href="/dashboard/mcp-servers/new">
                  Generate MCP Server
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredServers.map((server) => (
            <Card key={server.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{server.name}</CardTitle>
                    {server.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {server.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={server.status === 'ready' ? 'secondary' : 'outline'}>
                    {server.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Created:</span> {new Date(server.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {new Date(server.updated_at).toLocaleDateString()}
                  </div>
                </div>

                {server.status === 'ready' ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <Globe className="h-3 w-3" />
                        <span>HTML</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>Markdown</span>
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center space-x-1">
                        <Code className="h-3 w-3" />
                        <span>JSON</span>
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Button className="w-full" asChild>
                      <Link href={`/dashboard/mcp-servers/${server.id}`}>
                        View Full Documentation
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Documentation will be available once the server is ready
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/mcp-servers/${server.id}`}>
                        View Server Status
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
