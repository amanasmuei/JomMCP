export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border bg-gray-50 p-8">
        <div className="container text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <span className="text-3xl font-bold text-gray-800">JomMCP Platform</span>
          </div>
          <p className="text-gray-600">API to MCP Server Automation</p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container text-center">
          <div className="mb-4 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded">
            🚀 Now in Beta
          </div>
          <h1 className="text-3xl font-bold mb-8 text-gray-800">
            Automate API to MCP Server Conversion
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            JomMCP Platform simplifies the process of converting APIs into MCP servers.<br/>
            Register your APIs, generate MCP server code, and deploy with just a few clicks.
          </p>
          <div className="space-y-4">
            <a href="/test" className="inline-block bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition-colors">
              Test Page
            </a>
            <br/>
            <a href="/auth/login" className="inline-block border border-gray-300 text-gray-800 px-6 py-3 rounded hover:bg-gray-50 transition-colors">
              Login (Coming Soon)
            </a>
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">Platform Status</h2>
          <div className="space-y-4 text-gray-600">
            <p>✅ Backend Services: Ready</p>
            <p>🔧 Frontend: In Development</p>
            <p>📝 Documentation: Available</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container text-center text-gray-600">
          <p>&copy; 2024 JomMCP Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
