// Simple test page to diagnose white screen issues
export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>JomMCP Test Page</h1>
      <p>If you can see this, the basic Next.js setup is working.</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Environment Check:</h2>
        <ul>
          <li>API Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'Not set'}</li>
          <li>WS Base URL: {process.env.NEXT_PUBLIC_WS_BASE_URL || 'Not set'}</li>
          <li>Node Environment: {process.env.NODE_ENV || 'Not set'}</li>
        </ul>
      </div>
    </div>
  );
}
