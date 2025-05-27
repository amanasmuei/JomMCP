# JomMCP Web UI

The frontend application for the JomMCP Platform, built with Next.js 14+ and TypeScript.

## 🚀 Features

- **Modern Stack**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Component Library**: shadcn/ui components with Radix UI primitives
- **State Management**: React Query for server state, React Context for client state
- **Real-time Updates**: WebSocket integration for live status updates
- **Authentication**: JWT-based auth with refresh tokens
- **Responsive Design**: Mobile-first design with dark/light theme support
- **Professional UI**: Uber-inspired design system for clean, minimalist interface

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **State Management**: React Query + React Context
- **Forms**: React Hook Form + Zod validation
- **Authentication**: JWT with refresh tokens
- **Real-time**: WebSocket client
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Theme**: next-themes

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard and main app pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── providers/        # Context providers
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── auth.ts          # Authentication logic
│   ├── api.ts           # API client
│   ├── websocket.ts     # WebSocket client
│   ├── react-query.ts   # React Query hooks
│   └── utils.ts         # Utility functions
├── types/               # TypeScript type definitions
├── styles/              # Global styles
└── hooks/               # Custom React hooks
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 8+

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Update the environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8000
   NEXT_PUBLIC_JWT_SECRET=your-secret-key
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm test
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_BASE_URL` | WebSocket base URL | `ws://localhost:8000` |
| `NEXT_PUBLIC_JWT_SECRET` | JWT secret for token validation | Required |

### API Integration

The frontend communicates with the JomMCP backend services through:

- **API Gateway**: Port 8000 - Main API endpoints
- **WebSocket**: Real-time updates for status changes
- **Authentication**: JWT tokens with automatic refresh

### Theme Configuration

The application supports light/dark themes with:

- System preference detection
- Manual theme switching
- Persistent theme storage
- CSS custom properties for theming

## 📱 Pages and Features

### Authentication
- **Login**: `/auth/login` - User authentication
- **Register**: `/auth/register` - User registration

### Dashboard
- **Overview**: `/dashboard` - Main dashboard with metrics
- **APIs**: `/dashboard/apis` - API registration management
- **Servers**: `/dashboard/servers` - MCP server generation
- **Deployments**: `/dashboard/deployments` - Deployment management
- **Documentation**: `/dashboard/docs` - Documentation viewer
- **Settings**: `/dashboard/settings` - User settings

### Key Features
- Real-time status updates via WebSocket
- Responsive design for all screen sizes
- Dark/light theme support
- Form validation with error handling
- Loading states and error boundaries
- Optimistic updates for better UX

## 🎨 Design System

The UI follows Uber's design principles:

- **Professional**: Clean, minimalist interface
- **Consistent**: Unified component library
- **Accessible**: WCAG compliant components
- **Responsive**: Mobile-first design approach
- **Performant**: Optimized for speed and efficiency

### Color Palette

- **Primary**: Blue tones for main actions
- **Success**: Green for positive states
- **Warning**: Yellow for caution states
- **Error**: Red for error states
- **Neutral**: Gray scale for text and backgrounds

## 🔌 WebSocket Integration

Real-time features include:

- **Status Updates**: Live status changes for resources
- **Log Streaming**: Real-time log output
- **Notifications**: Instant notifications for events
- **Connection Management**: Automatic reconnection handling

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build production image
docker build -t jommcp-web-ui .

# Run container
docker run -p 3000:3000 jommcp-web-ui
```

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Add proper error handling and loading states
4. Test your changes thoroughly
5. Update documentation as needed

## 📄 License

This project is part of the JomMCP Platform and follows the same licensing terms.
