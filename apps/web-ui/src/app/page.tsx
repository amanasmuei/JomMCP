"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Zap, Shield, Globe, Code, Rocket, BarChart3, Upload, Settings, Play, Monitor, FileText, Database } from 'lucide-react';
import { HeroHighlight, Highlight } from '@/components/aceternity/hero-highlight';
import { TextGenerateEffect } from '@/components/aceternity/sparkles';
import { HoverEffect } from '@/components/aceternity/card-hover-effect';
import { BentoGrid, BentoGridItem } from '@/components/aceternity/bento-grid';
import { Button } from '@/components/ui/button';
import { FloatingNav } from '@/components/aceternity/floating-navbar';
import { ProcessTimeline } from '@/components/landing/process-timeline';
import { InteractiveDemo } from '@/components/landing/interactive-demo';
import { MetricsShowcase } from '@/components/landing/metrics-showcase';
import { VisualFlow } from '@/components/landing/visual-flow';

const navItems = [
  {
    name: "Home",
    link: "/",
    icon: <Globe className="h-4 w-4 text-neutral-500 dark:text-white" />,
  },
  {
    name: "Features",
    link: "#features",
    icon: <Zap className="h-4 w-4 text-neutral-500 dark:text-white" />,
  },
  {
    name: "Dashboard",
    link: "/dashboard",
    icon: <BarChart3 className="h-4 w-4 text-neutral-500 dark:text-white" />,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <FloatingNav navItems={navItems} />

      {/* Navigation Header */}
      <nav className="relative z-50 border-b border-neutral-800 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">J</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                JomMCP
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Button asChild size="sm">
                <Link href="/auth/register">
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroHighlight containerClassName="min-h-screen">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Status Badge */}
            <div className="mb-8 inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 backdrop-blur-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Platform Ready
            </div>

            {/* Main Heading */}
            <div className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <TextGenerateEffect words="Automate API to MCP Server Conversion" />
              <div className="mt-4">
                <Highlight className="text-black dark:text-white">
                  with Zero Configuration
                </Highlight>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-neutral-400 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform your APIs into powerful MCP servers with{' '}
              <span className="text-white font-semibold">zero configuration</span>.
              Register, generate, and deploy in minutes, not hours.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button asChild size="lg" className="group">
                <Link href="/dashboard">
                  Start Building
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#features">
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">3 min</div>
                <div className="text-neutral-400">Average Setup Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
                <div className="text-neutral-400">Automated Generation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">24/7</div>
                <div className="text-neutral-400">Monitoring & Support</div>
              </div>
            </div>
          </div>
        </div>
      </HeroHighlight>

      {/* How It Works Section */}
      <section id="features" className="py-24 px-4 bg-black relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/10 via-purple-950/10 to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
                How It <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Works</span>
              </h2>
              <p className="text-xl text-neutral-400 max-w-3xl mx-auto mb-8">
                Transform your APIs into MCP servers with our intelligent automation platform
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm text-neutral-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Zero Configuration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Production Ready</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visual Flow Overview */}
          <div className="mb-20">
            <VisualFlow />
          </div>

          {/* Process Timeline */}
          <div className="mb-20">
            <ProcessTimeline />
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
                See It In <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Action</span>
              </h2>
              <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
                Watch how JomMCP transforms a simple weather API into a fully functional MCP server
              </p>
            </motion.div>
          </div>

          <InteractiveDemo />
        </div>
      </section>

      {/* Metrics Showcase Section */}
      <section className="py-24 px-4 bg-black relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/10 via-blue-950/10 to-black pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
                Platform <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Metrics</span>
              </h2>
              <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
                Real-time performance metrics that showcase the power and reliability of our platform
              </p>
            </motion.div>
          </div>

          <MetricsShowcase />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
              Powerful <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
              Everything you need to build, deploy, and manage MCP servers at scale
            </p>
          </div>

          <HoverEffect items={[
            {
              title: "Lightning Fast",
              description: "Generate and deploy MCP servers in under 3 minutes with our optimized pipeline and intelligent caching.",
              link: "#",
              icon: <Zap className="w-6 h-6 text-blue-400" />
            },
            {
              title: "Enterprise Security",
              description: "Built-in authentication, encryption, and compliance features to meet enterprise security requirements.",
              link: "#",
              icon: <Shield className="w-6 h-6 text-green-400" />
            },
            {
              title: "Real-time Analytics",
              description: "Monitor performance, track usage, and get insights with comprehensive analytics and alerting.",
              link: "#",
              icon: <BarChart3 className="w-6 h-6 text-purple-400" />
            },
            {
              title: "Auto Documentation",
              description: "Automatically generate comprehensive documentation, examples, and SDK code for your MCP servers.",
              link: "#",
              icon: <Code className="w-6 h-6 text-orange-400" />
            },
            {
              title: "Global CDN",
              description: "Deploy to multiple regions with automatic load balancing and edge caching for optimal performance.",
              link: "#",
              icon: <Globe className="w-6 h-6 text-cyan-400" />
            },
            {
              title: "Auto Scaling",
              description: "Automatically scale your MCP servers based on demand with intelligent resource management.",
              link: "#",
              icon: <Rocket className="w-6 h-6 text-red-400" />
            }
          ]} />
        </div>
      </section>

      {/* Platform Status Section */}
      <section className="py-24 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
              Platform <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Status</span>
            </h2>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
              Real-time status of all platform services and infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="group bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-green-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-400">Operational</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Backend Services</h3>
              <p className="text-neutral-400 mb-4">All microservices running smoothly</p>
              <div className="text-sm text-neutral-400">
                <div className="flex justify-between mb-1">
                  <span>Uptime</span>
                  <span className="font-medium text-white">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span>Response Time</span>
                  <span className="font-medium text-white">45ms</span>
                </div>
              </div>
            </div>

            <div className="group bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-green-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-400">Operational</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Frontend Dashboard</h3>
              <p className="text-neutral-400 mb-4">Web interface fully functional</p>
              <div className="text-sm text-neutral-400">
                <div className="flex justify-between mb-1">
                  <span>Load Time</span>
                  <span className="font-medium text-white">1.2s</span>
                </div>
                <div className="flex justify-between">
                  <span>CDN Status</span>
                  <span className="font-medium text-white">Active</span>
                </div>
              </div>
            </div>

            <div className="group bg-neutral-900 border border-neutral-800 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-green-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-400">Operational</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Authentication</h3>
              <p className="text-neutral-400 mb-4">Secure login & registration ready</p>
              <div className="text-sm text-neutral-400">
                <div className="flex justify-between mb-1">
                  <span>Security</span>
                  <span className="font-medium text-white">JWT + 2FA</span>
                </div>
                <div className="flex justify-between">
                  <span>Sessions</span>
                  <span className="font-medium text-white">Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-neutral-400 mb-4">
              Last updated: <span className="font-medium text-white">Just now</span>
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              View detailed status
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-950/20 via-purple-950/20 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
            Ready to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Transform</span> Your APIs?
          </h2>
          <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">
            Join thousands of developers who are already using JomMCP to automate their API to MCP server workflows.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="group">
              <Link href="/auth/register">
                Start Free Today
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">
                View Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">J</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  JomMCP Platform
                </span>
              </div>
              <p className="text-neutral-400 mb-6 max-w-md">
                Automate your API to MCP server conversion with our powerful platform.
                Build, deploy, and scale with confidence.
              </p>
              <div className="text-sm text-neutral-500">
                <p>&copy; 2025 JomMCP Platform. All rights reserved.</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Platform</h3>
              <ul className="space-y-3 text-neutral-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-3 text-neutral-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Status Page</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-neutral-400">
            <p>Built with ❤️ for the developer community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
