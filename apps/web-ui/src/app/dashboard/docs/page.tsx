'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Search, Plus, Eye, Download, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAPIRegistrations, useGenerateDocumentation } from '@/lib/react-query';
import { formatRelativeTime } from '@/lib/utils';

export default function DocsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('apis');

  const { data: apiRegistrations, isLoading } = useAPIRegistrations(1, 100);
  const generateDocumentation = useGenerateDocumentation();

  const handleGenerateDoc = async (apiId: string) => {
    try {
      await generateDocumentation.mutateAsync(apiId);
    } catch (error) {
      console.error('Failed to generate documentation:', error);
    }
  };

  const filteredAPIs = apiRegistrations?.items?.filter(api =>
    api.name.toLowerCase().includes(search.toLowerCase()) ||
    api.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Mock documentation data - in real app this would come from API
  const mockDocs = [
    {
      id: '1',
      title: 'Weather API Documentation',
      type: 'api',
      format: 'openapi',
      url: '/docs/weather-api',
      created_at: new Date().toISOString(),
      api_name: 'Weather API',
    },
    {
      id: '2',
      title: 'User Management MCP Server Guide',
      type: 'mcp_server',
      format: 'markdown',
      url: '/docs/user-mcp-server',
      created_at: new Date().toISOString(),
      server_name: 'User Management Server',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="text-muted-foreground mt-1">
            View and generate documentation for your APIs and MCP servers
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button asChild>
            <Link href="/dashboard/docs/generate">
              <Plus className="h-4 w-4 mr-2" />
              Generate Docs
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documentation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="apis">API Documentation</TabsTrigger>
          <TabsTrigger value="servers">MCP Server Docs</TabsTrigger>
          <TabsTrigger value="generated">Generated Docs</TabsTrigger>
        </TabsList>

        <TabsContent value="apis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Generate and view documentation for your registered APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                      <div className="space-y-2">
                        <div className="w-32 h-4 bg-muted rounded"></div>
                        <div className="w-48 h-3 bg-muted rounded"></div>
                      </div>
                      <div className="w-24 h-8 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredAPIs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No APIs found</h3>
                  <p className="text-muted-foreground mb-4">
                    Register an API first to generate documentation
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/apis/new">Register API</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAPIs.map((api) => (
                    <div key={api.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{api.name}</h4>
                          <Badge variant="outline">{api.api_type.toUpperCase()}</Badge>
                          <Badge className={api.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {api.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {api.description || 'No description provided'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created {formatRelativeTime(api.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {api.spec_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={api.spec_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Spec
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateDoc(api.id)}
                          disabled={generateDocumentation.isPending}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Generate
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/apis/${api.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>MCP Server Documentation</CardTitle>
              <CardDescription>
                Documentation for your generated MCP servers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No MCP server documentation</h3>
                <p className="text-muted-foreground mb-4">
                  Generate an MCP server first to create documentation
                </p>
                <Button asChild>
                  <Link href="/dashboard/servers/new">Generate MCP Server</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generated" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Documentation</CardTitle>
              <CardDescription>
                All generated documentation files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{doc.title}</h4>
                        <Badge variant="outline">{doc.format.toUpperCase()}</Badge>
                        <Badge variant="secondary">{doc.type.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {doc.type === 'api' ? `API: ${doc.api_name}` : `Server: ${doc.server_name}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Generated {formatRelativeTime(doc.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </a>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
