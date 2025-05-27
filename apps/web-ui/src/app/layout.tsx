import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'JomMCP Platform',
    template: '%s | JomMCP Platform',
  },
  description: 'Transform your APIs into AI-ready MCP servers. Generate and deploy Model Context Protocol servers from your existing APIs in minutes.',
  keywords: ['MCP', 'API', 'automation', 'deployment', 'microservices', 'AI', 'Claude', 'OpenAI', 'Model Context Protocol'],
  authors: [{ name: 'JomMCP Team' }],
  creator: 'JomMCP Team',
  robots: 'index, follow',
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'JomMCP Platform',
    description: 'Transform your APIs into AI-ready MCP servers',
    type: 'website',
    locale: 'en_US',
    siteName: 'JomMCP Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JomMCP Platform',
    description: 'Transform your APIs into AI-ready MCP servers',
    creator: '@jommcp',
  },
  metadataBase: new URL('https://jommcp.dev'),
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} h-full bg-background text-foreground antialiased`}>
        <Providers>
          <div className="relative min-h-full">
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'toast',
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: 'hsl(var(--success-500))',
                  secondary: 'hsl(var(--card))',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'hsl(var(--card))',
                },
              },
              loading: {
                iconTheme: {
                  primary: 'hsl(var(--primary))',
                  secondary: 'hsl(var(--card))',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
