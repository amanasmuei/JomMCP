import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Zap, Database, Server, Cloud, CheckCircle, Users, Rocket } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-secondary/30">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">JomMCP</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full">
              <Rocket className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Transform APIs into AI-ready servers</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="block">Transform Your APIs into</span>
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              MCP Servers
            </span>
          </h1>
          
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Automatically generate and deploy Model Context Protocol (MCP) servers from your existing APIs.
            Make your services AI-assistant ready in minutes, not hours.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register" className="group">
                Start Building
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/docs">
                Learn More
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="group hover:shadow-medium transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">API Registration</h3>
              </div>
              <p className="text-muted-foreground">
                Register your existing APIs with our platform. Support for REST, GraphQL, and OpenAPI specifications.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-medium transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-success-500/10 rounded-lg">
                  <Server className="h-6 w-6 text-success-500" />
                </div>
                <h3 className="text-lg font-semibold">MCP Generation</h3>
              </div>
              <p className="text-muted-foreground">
                Automatically generate MCP-compliant servers from your API specifications with intelligent mapping.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-medium transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-warning-500/10 rounded-lg">
                  <Cloud className="h-6 w-6 text-warning-500" />
                </div>
                <h3 className="text-lg font-semibold">One-Click Deploy</h3>
              </div>
              <p className="text-muted-foreground">
                Deploy your MCP servers to production with a single click. Built-in monitoring and scaling.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose JomMCP?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for developers who want to integrate their APIs with AI assistants quickly and efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-success-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Instant Integration</h3>
                  <p className="text-muted-foreground">
                    Connect your APIs to AI assistants in minutes, not weeks. No complex setup required.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-success-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Production Ready</h3>
                  <p className="text-muted-foreground">
                    Built-in monitoring, logging, and scaling. Deploy with confidence to production environments.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-success-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Developer Friendly</h3>
                  <p className="text-muted-foreground">
                    Comprehensive documentation, examples, and support for multiple API formats.
                  </p>
                </div>
              </div>
            </div>

            <Card className="lg:ml-8">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-xl font-semibold">Join Our Community</h3>
                    <p className="text-muted-foreground">Connect with other developers</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">
                  Get help, share ideas, and collaborate with other developers building AI-integrated applications.
                </p>
                <Button variant="outline" className="w-full">
                  Join Discord Community
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-24">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">JomMCP</span>
            </div>
            <p className="text-muted-foreground">
              &copy; 2024 JomMCP Platform. Built for the AI-powered future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
