'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Activity, Server, Rocket, Globe, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWebSocket } from '@/components/providers/websocket-provider';
import { useAPIRegistrations, useMCPServers, useDeployments } from '@/lib/react-query';

// Mock real-time metrics data
const generateMetrics = () => ({
  cpu: Math.floor(Math.random() * 100),
  memory: Math.floor(Math.random() * 100),
  requests: Math.floor(Math.random() * 1000) + 100,
  errors: Math.floor(Math.random() * 10),
  uptime: '99.9%',
  responseTime: Math.floor(Math.random() * 200) + 50,
});

const generateChartData = () => {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => ({
    time: new Date(now.getTime() - (23 - i) * 60 * 60 * 1000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    requests: Math.floor(Math.random() * 500) + 100,
    errors: Math.floor(Math.random() * 20),
    responseTime: Math.floor(Math.random() * 100) + 50,
  }));
};

export default function MonitoringPage() {
  const [timeRange, setTimeRange] = useState('24h');
  const [metrics, setMetrics] = useState(generateMetrics());
  const [chartData] = useState(generateChartData());
  const { isConnected } = useWebSocket();

  const { data: apiRegistrations } = useAPIRegistrations(1, 100);
  const { data: mcpServers } = useMCPServers(1, 100);
  const { data: deployments } = useDeployments(1, 100);

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(generateMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = (value: number, type: 'cpu' | 'memory' | 'errors') => {
    if (type === 'errors') {
      if (value < 5) return { status: 'healthy', color: 'text-green-500' };
      if (value < 10) return { status: 'warning', color: 'text-yellow-500' };
      return { status: 'critical', color: 'text-red-500' };
    }
    
    if (value < 70) return { status: 'healthy', color: 'text-green-500' };
    if (value < 90) return { status: 'warning', color: 'text-yellow-500' };
    return { status: 'critical', color: 'text-red-500' };
  };

  const totalAPIs = apiRegistrations?.total || 0;
  const activeAPIs = apiRegistrations?.items?.filter(api => api.status === 'active').length || 0;
  const totalServers = mcpServers?.total || 0;
  const readyServers = mcpServers?.items?.filter(server => server.status === 'ready').length || 0;
  const totalDeployments = deployments?.total || 0;
  const runningDeployments = deployments?.items?.filter(deployment => deployment.status === 'running').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Real-time platform performance and resource monitoring
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total APIs</p>
                <p className="text-2xl font-bold">{totalAPIs}</p>
                <p className="text-xs text-muted-foreground">
                  {activeAPIs} active
                </p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">MCP Servers</p>
                <p className="text-2xl font-bold">{totalServers}</p>
                <p className="text-xs text-muted-foreground">
                  {readyServers} ready
                </p>
              </div>
              <Server className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deployments</p>
                <p className="text-2xl font-bold">{totalDeployments}</p>
                <p className="text-xs text-muted-foreground">
                  {runningDeployments} running
                </p>
              </div>
              <Rocket className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold">
                  {metrics.uptime}
                </p>
                <p className="text-xs text-green-500">
                  All systems operational
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Request Metrics
                </CardTitle>
                <CardDescription>
                  Real-time request volume and response times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Requests/min</span>
                    <span className="text-2xl font-bold">{metrics.requests}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg Response Time</span>
                    <span className="text-lg font-semibold">{metrics.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className={`text-lg font-semibold ${getHealthStatus(metrics.errors, 'errors').color}`}>
                      {((metrics.errors / metrics.requests) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  System Resources
                </CardTitle>
                <CardDescription>
                  Current system resource utilization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>CPU Usage</span>
                      <span className={getHealthStatus(metrics.cpu, 'cpu').color}>
                        {metrics.cpu}%
                      </span>
                    </div>
                    <Progress value={metrics.cpu} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Memory Usage</span>
                      <span className={getHealthStatus(metrics.memory, 'memory').color}>
                        {metrics.memory}%
                      </span>
                    </div>
                    <Progress value={metrics.memory} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Error Count</span>
                      <span className={getHealthStatus(metrics.errors, 'errors').color}>
                        {metrics.errors}
                      </span>
                    </div>
                    <Progress value={(metrics.errors / 20) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Historical performance data over the selected time range
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Performance charts will be displayed here
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Integration with monitoring tools like Grafana coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active</span>
                    <Badge variant="default">{activeAPIs}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Inactive</span>
                    <Badge variant="secondary">{totalAPIs - activeAPIs}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total</span>
                    <Badge variant="outline">{totalAPIs}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>MCP Servers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Ready</span>
                    <Badge variant="default">{readyServers}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Generating</span>
                    <Badge variant="secondary">
                      {mcpServers?.items?.filter(s => ['pending', 'generating', 'building'].includes(s.status)).length || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Failed</span>
                    <Badge variant="destructive">
                      {mcpServers?.items?.filter(s => s.status === 'failed').length || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deployments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Running</span>
                    <Badge variant="default">{runningDeployments}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Stopped</span>
                    <Badge variant="secondary">
                      {deployments?.items?.filter(d => d.status === 'stopped').length || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Failed</span>
                    <Badge variant="destructive">
                      {deployments?.items?.filter(d => d.status === 'failed').length || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                System Alerts
              </CardTitle>
              <CardDescription>
                Current system alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.cpu > 80 && (
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">High CPU Usage</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        CPU usage is at {metrics.cpu}%. Consider scaling resources.
                      </p>
                    </div>
                  </div>
                )}
                
                {metrics.memory > 85 && (
                  <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-200">High Memory Usage</p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Memory usage is at {metrics.memory}%. Immediate attention required.
                      </p>
                    </div>
                  </div>
                )}

                {metrics.cpu <= 80 && metrics.memory <= 85 && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">All Systems Operational</p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        No critical alerts at this time.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>
                Recent system events and logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                <div className="space-y-1">
                  <p>[{new Date().toISOString()}] INFO: System monitoring active</p>
                  <p>[{new Date(Date.now() - 60000).toISOString()}] INFO: WebSocket connection established</p>
                  <p>[{new Date(Date.now() - 120000).toISOString()}] INFO: API Gateway responding normally</p>
                  <p>[{new Date(Date.now() - 180000).toISOString()}] INFO: Database connection healthy</p>
                  <p>[{new Date(Date.now() - 240000).toISOString()}] INFO: All services operational</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
