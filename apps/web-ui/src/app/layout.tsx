import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JomMCP Platform - API to MCP Server Automation',
  description: 'Automate the conversion of APIs to MCP servers with JomMCP Platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}
