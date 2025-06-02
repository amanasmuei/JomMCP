'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Server,
  Download,
  Play,
  Square,
  Code,
  FileText,
  Activity,
  Settings,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye
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
  useMCPServer,
  useMCPServerLogs,
  useDownloadMCPServerCode
} from '@/lib/react-query';
import { formatRelativeTime, getStatusColor, getStatusIcon } from '@/lib/utils';

export default function MCPServerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serverId = params.id as string;

  const [activeLogType, setActiveLogType] = useState<'generation' | 'build'>('generation');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: server, isLoading, error } = useMCPServer(serverId);
  const { data: logs } = useMCPServerLogs(serverId, activeLogType);
  const downloadMCPServerCode = useDownloadMCPServerCode();

  const handleDownload = async () => {
    try {
      await downloadMCPServerCode.mutateAsync(serverId);
    } catch (error) {
      console.error('Failed to download server code:', error);
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

  if (error || !server) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/servers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Server Not Found</h1>
            <p className="text-muted-foreground mt-1">
              The requested MCP server could not be found.
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Server Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The MCP server you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link href="/dashboard/servers">
                Back to Servers
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/servers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold">{server.name}</h1>
              <Badge className={getStatusColor(server.status)}>
                {server.status}
              </Badge>
              {server.version && (
                <Badge variant="outline">v{server.version}</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {server.description || 'No description provided'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {server.status === 'ready' && (
            <>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={downloadMCPServerCode.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                {downloadMCPServerCode.isPending ? 'Downloading...' : 'Download Code'}
              </Button>
              <Button asChild>
                <Link href={`/dashboard/deployments/new?server=${server.id}`}>
                  <Play className="h-4 w-4 mr-2" />
                  Deploy
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar for Generation Status */}
      {['pending', 'generating', 'building', 'testing'].includes(server.status) && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Generation Progress</h3>
                <span className="text-sm text-muted-foreground">{getProgressValue(server.status)}%</span>
              </div>
              <Progress value={getProgressValue(server.status)} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {server.status === 'pending' && 'Waiting to start generation...'}
                {server.status === 'generating' && 'Generating MCP server code...'}
                {server.status === 'building' && 'Building Docker image...'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="code">Generated Code</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    Server Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(server.status)}
                        <span className="capitalize">{server.status}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Source API</label>
                      <div className="flex items-center space-x-2">
                        <span>{server.api_registration?.name || 'Unknown'}</span>
                        {server.api_registration && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/apis/${server.api_registration_id}`}>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {server.docker_image_name && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Docker Image</label>
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-sm bg-muted px-2 py-1 rounded flex-1">
                          {server.docker_image_name}:{server.docker_image_tag || 'latest'}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(
                            `${server.docker_image_name}:${server.docker_image_tag || 'latest'}`,
                            'docker_image'
                          )}
                        >
                          {copiedField === 'docker_image' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
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
                    MCP Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {server.mcp_config && Object.keys(server.mcp_config).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(server.mcp_config).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="font-mono text-sm">{key}</span>
                          <span className="font-mono text-sm text-muted-foreground">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No configuration available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Server Logs
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={activeLogType === 'generation' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveLogType('generation')}
                      >
                        Generation
                      </Button>
                      <Button
                        variant={activeLogType === 'build' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveLogType('build')}
                      >
                        Build
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                    {logs?.logs ? (
                      <pre className="whitespace-pre-wrap">{logs.logs}</pre>
                    ) : (
                      <p className="text-muted-foreground">No logs available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    Generated Code
                  </CardTitle>
                  <CardDescription>
                    Preview and download the generated MCP server code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {server.status === 'ready' ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Code generation completed successfully
                        </p>
                        <Button
                          onClick={handleDownload}
                          disabled={downloadMCPServerCode.isPending}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {downloadMCPServerCode.isPending ? 'Downloading...' : 'Download Code'}
                        </Button>
                      </div>
                      {server.generated_code_path && (
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm font-medium">Generated Files Location:</p>
                          <p className="font-mono text-xs text-muted-foreground mt-1">
                            {server.generated_code_path}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : server.status === 'failed' ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                      <p className="text-sm text-muted-foreground">
                        Code generation failed. Check the logs for more details.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Code generation is in progress. Please wait...
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
                <p className="text-sm">{formatRelativeTime(server.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{formatRelativeTime(server.updated_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Server ID</label>
                <p className="font-mono text-xs bg-muted px-2 py-1 rounded">{server.id}</p>
              </div>
              {server.api_registration_id && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">API ID</label>
                  <p className="font-mono text-xs bg-muted px-2 py-1 rounded">{server.api_registration_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {server.status === 'ready' && (
                <>
                  <Button className="w-full" asChild>
                    <Link href={`/dashboard/deployments/new?server=${server.id}`}>
                      <Play className="h-4 w-4 mr-2" />
                      Deploy Server
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleDownload}
                    disabled={downloadMCPServerCode.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {downloadMCPServerCode.isPending ? 'Downloading...' : 'Download Code'}
                  </Button>
                </>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/apis/${server.api_registration_id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Source API
                </Link>
              </Button>
            </CardContent>
          </Card>

          {server.status === 'failed' && server.error_message && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Error Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{server.error_message}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
