import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: {
    default: 'JomMCP Platform - Automate API to MCP Server Conversion',
    template: '%s | JomMCP Platform'
  },
  description: 'Transform your APIs into powerful MCP servers with zero configuration. Deploy in minutes with AI-powered automation, enterprise-grade security, and real-time monitoring.',
  keywords: [
    'MCP server',
    'API automation',
    'Model Context Protocol',
    'API conversion',
    'serverless deployment',
    'API management',
    'cloud infrastructure',
    'developer tools',
    'microservices',
    'API gateway'
  ],
  authors: [{ name: 'JomMCP Team' }],
  creator: 'JomMCP Platform',
  publisher: 'JomMCP Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://jommcp.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'JomMCP Platform - Automate API to MCP Server Conversion',
    description: 'Transform your APIs into powerful MCP servers with zero configuration. Deploy in minutes with AI-powered automation.',
    url: 'https://jommcp.com',
    siteName: 'JomMCP Platform',
    images: [
      {
        url: '/api/og?title=JomMCP Platform&description=Automate API to MCP Server Conversion',
        width: 1200,
        height: 630,
        alt: 'JomMCP Platform - API to MCP Server Automation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JomMCP Platform - Automate API to MCP Server Conversion',
    description: 'Transform your APIs into powerful MCP servers with zero configuration. Deploy in minutes.',
    images: ['/api/og?title=JomMCP Platform&description=Automate API to MCP Server Conversion'],
    creator: '@jommcp',
    site: '@jommcp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "JomMCP Platform",
              "description": "Transform your APIs into powerful MCP servers with zero configuration",
              "url": "https://jommcp.com",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Free tier available"
              },
              "creator": {
                "@type": "Organization",
                "name": "JomMCP Team"
              },
              "featureList": [
                "API to MCP Server Automation",
                "Zero Configuration Setup",
                "Enterprise Security",
                "Real-time Monitoring",
                "Auto Documentation Generation"
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
