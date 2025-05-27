import Link from 'next/link';
import { ArrowRight, CheckCircle, Zap, Shield, Globe, Code, Rocket, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-xl">J</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                JomMCP
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-50/50 to-purple-50/30 dark:from-primary/10 dark:via-blue-950/20 dark:to-purple-950/10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Status Badge */}
            <div className="mb-8 inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
              <CheckCircle className="w-4 h-4 mr-2" />
              Platform Ready
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="block">Automate</span>
              <span className="block bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                API to MCP Server
              </span>
              <span className="block">Conversion</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform your APIs into powerful MCP servers with{' '}
              <span className="text-foreground font-semibold">zero configuration</span>.
              Register, generate, and deploy in minutes, not hours.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Building
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-border text-foreground rounded-xl hover:bg-muted transition-all duration-200 font-semibold text-lg"
              >
                Learn More
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">3 min</div>
                <div className="text-muted-foreground">Average Setup Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">Automated Generation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Monitoring & Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              How It <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform your APIs into MCP servers in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center mb-4">
                  <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                  <h3 className="text-2xl font-bold">Register API</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Upload your OpenAPI specification or provide your API endpoint. Our platform validates and analyzes your API structure automatically.
                </p>
                <div className="flex items-center text-primary font-medium">
                  <span>Takes 30 seconds</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center mb-4">
                  <span className="w-8 h-8 bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                  <h3 className="text-2xl font-bold">Generate Server</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Our AI-powered generator creates optimized MCP server code with proper error handling, authentication, and documentation.
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  <span>Automated in 2 minutes</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-green-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center mb-4">
                  <span className="w-8 h-8 bg-green-600/10 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                  <h3 className="text-2xl font-bold">Deploy & Monitor</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Deploy your MCP server to our cloud infrastructure with automatic scaling, monitoring, and real-time status updates.
                </p>
                <div className="flex items-center text-green-600 font-medium">
                  <span>Live in 30 seconds</span>
                  <CheckCircle className="ml-2 w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-muted/30 via-background to-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Powerful <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to build, deploy, and manage MCP servers at scale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Lightning Fast</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate and deploy MCP servers in under 3 minutes with our optimized pipeline and intelligent caching.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-primary/20">
              <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600/20 transition-colors">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Enterprise Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                Built-in authentication, encryption, and compliance features to meet enterprise security requirements.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-primary/20">
              <div className="w-12 h-12 bg-green-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600/20 transition-colors">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Real-time Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor performance, track usage, and get insights with comprehensive analytics and alerting.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-primary/20">
              <div className="w-12 h-12 bg-purple-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600/20 transition-colors">
                <Code className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Auto Documentation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automatically generate comprehensive documentation, examples, and SDK code for your MCP servers.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-primary/20">
              <div className="w-12 h-12 bg-orange-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-600/20 transition-colors">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Global CDN</h3>
              <p className="text-muted-foreground leading-relaxed">
                Deploy to multiple regions with automatic load balancing and edge caching for optimal performance.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-primary/20">
              <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-600/20 transition-colors">
                <Rocket className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Auto Scaling</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automatically scale your MCP servers based on demand with intelligent resource management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Status Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Platform <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Status</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real-time status of all platform services and infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-green-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Backend Services</h3>
              <p className="text-muted-foreground mb-4">All microservices running smoothly</p>
              <div className="text-sm text-muted-foreground">
                <div className="flex justify-between mb-1">
                  <span>Uptime</span>
                  <span className="font-medium">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span>Response Time</span>
                  <span className="font-medium">45ms</span>
                </div>
              </div>
            </div>

            <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-green-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Frontend Dashboard</h3>
              <p className="text-muted-foreground mb-4">Web interface fully functional</p>
              <div className="text-sm text-muted-foreground">
                <div className="flex justify-between mb-1">
                  <span>Load Time</span>
                  <span className="font-medium">1.2s</span>
                </div>
                <div className="flex justify-between">
                  <span>CDN Status</span>
                  <span className="font-medium">Active</span>
                </div>
              </div>
            </div>

            <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-green-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Authentication</h3>
              <p className="text-muted-foreground mb-4">Secure login & registration ready</p>
              <div className="text-sm text-muted-foreground">
                <div className="flex justify-between mb-1">
                  <span>Security</span>
                  <span className="font-medium">JWT + 2FA</span>
                </div>
                <div className="flex justify-between">
                  <span>Sessions</span>
                  <span className="font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Last updated: <span className="font-medium">Just now</span>
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium"
            >
              View detailed status
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary/5 via-blue-50/50 to-purple-50/30 dark:from-primary/10 dark:via-blue-950/20 dark:to-purple-950/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Transform</span> Your APIs?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of developers who are already using JomMCP to automate their API to MCP server workflows.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="group inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Free Today
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-border text-foreground rounded-xl hover:bg-muted transition-all duration-200 font-semibold text-lg"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-muted/30 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-xl">J</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  JomMCP Platform
                </span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                Automate your API to MCP server conversion with our powerful platform.
                Build, deploy, and scale with confidence.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>&copy; 2025 JomMCP Platform. All rights reserved.</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link href="/auth/register" className="hover:text-foreground transition-colors">Get Started</Link></li>
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Documentation</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Status Page</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>Built with ❤️ for the developer community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
