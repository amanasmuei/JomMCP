"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Code, 
  Rocket, 
  CheckCircle, 
  ArrowRight, 
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DemoStep {
  id: number;
  title: string;
  description: string;
  code: string;
  output: string;
  icon: React.ReactNode;
  color: string;
}

const demoSteps: DemoStep[] = [
  {
    id: 1,
    title: "API Registration",
    description: "Upload your OpenAPI specification",
    code: `{
  "openapi": "3.0.0",
  "info": {
    "title": "Weather API",
    "version": "1.0.0"
  },
  "paths": {
    "/weather": {
      "get": {
        "summary": "Get weather data",
        "parameters": [
          {
            "name": "city",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ]
      }
    }
  }
}`,
    output: "✅ API validated successfully\n📊 Found 1 endpoint\n🔍 Detected query parameters\n⚡ Ready for generation",
    icon: <FileText className="w-5 h-5" />,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    title: "MCP Server Generation",
    description: "AI generates optimized server code",
    code: `import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

class WeatherMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "weather-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      async () => ({
        tools: [
          {
            name: "get_weather",
            description: "Get weather data for a city",
            inputSchema: {
              type: "object",
              properties: {
                city: {
                  type: "string",
                  description: "City name"
                }
              },
              required: ["city"]
            }
          }
        ]
      })
    );
  }
}`,
    output: "🤖 AI analysis complete\n📝 Generated MCP server code\n🔒 Added authentication layer\n📚 Created documentation\n⚡ Optimized for performance",
    icon: <Code className="w-5 h-5" />,
    color: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    title: "Deployment",
    description: "Deploy to cloud infrastructure",
    code: `# Dockerfile generated
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: weather-mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: weather-mcp-server
  template:
    metadata:
      labels:
        app: weather-mcp-server
    spec:
      containers:
      - name: server
        image: jommcp/weather-mcp:latest
        ports:
        - containerPort: 3000`,
    output: "🚀 Container built successfully\n☁️ Deployed to cloud\n🌐 Load balancer configured\n📊 Monitoring enabled\n✅ Server is live!",
    icon: <Rocket className="w-5 h-5" />,
    color: "from-green-500 to-emerald-500"
  }
];

export function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [codeProgress, setCodeProgress] = useState(0);
  const [outputProgress, setOutputProgress] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCodeProgress(prev => {
          if (prev >= 100) {
            setOutputProgress(prevOutput => {
              if (prevOutput >= 100) {
                if (currentStep < demoSteps.length - 1) {
                  setCurrentStep(prev => prev + 1);
                  setCodeProgress(0);
                  setOutputProgress(0);
                  return 0;
                } else {
                  setIsPlaying(false);
                  return 100;
                }
              }
              return prevOutput + 2;
            });
            return 100;
          }
          return prev + 1;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentStep]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setCodeProgress(0);
    setOutputProgress(0);
  };

  const currentStepData = demoSteps[currentStep];
  const displayedCode = currentStepData.code.slice(0, Math.floor((currentStepData.code.length * codeProgress) / 100));
  const displayedOutput = currentStepData.output.slice(0, Math.floor((currentStepData.output.length * outputProgress) / 100));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <Button
          onClick={handlePlay}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isPlaying ? "Pause" : "Play"} Demo</span>
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </Button>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {demoSteps.map((step, index) => (
          <motion.div
            key={step.id}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-300",
              index === currentStep 
                ? "border-purple-500 bg-purple-500/10 text-purple-400" 
                : index < currentStep 
                  ? "border-green-500 bg-green-500/10 text-green-400"
                  : "border-neutral-700 bg-neutral-800/50 text-neutral-500"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!isPlaying) {
                setCurrentStep(index);
                setCodeProgress(0);
                setOutputProgress(0);
              }
            }}
            style={{ cursor: isPlaying ? "default" : "pointer" }}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              `bg-gradient-to-br ${step.color}`
            )}>
              {index < currentStep ? (
                <CheckCircle className="w-4 h-4 text-white" />
              ) : (
                <span className="text-white font-bold text-sm">{step.icon}</span>
              )}
            </div>
            <span className="font-medium text-sm">{step.title}</span>
          </motion.div>
        ))}
      </div>

      {/* Demo Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Code Panel */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                  `bg-gradient-to-br ${currentStepData.color}`
                )}>
                  {currentStepData.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{currentStepData.title}</h3>
                  <p className="text-sm text-neutral-400">{currentStepData.description}</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="p-4 h-96 overflow-auto">
              <pre className="text-sm text-neutral-300 font-mono leading-relaxed">
                <code>{displayedCode}</code>
                {codeProgress < 100 && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="bg-purple-500 w-2 h-4 inline-block ml-1"
                  />
                )}
              </pre>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h3 className="font-semibold text-white">Output</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Live</span>
              </div>
            </div>
            <div className="p-4 h-96 overflow-auto">
              <pre className="text-sm text-green-400 font-mono leading-relaxed whitespace-pre-wrap">
                {displayedOutput}
                {outputProgress < 100 && codeProgress >= 100 && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="bg-green-500 w-2 h-4 inline-block ml-1"
                  />
                )}
              </pre>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
