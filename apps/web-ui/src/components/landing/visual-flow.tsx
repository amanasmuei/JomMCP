"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { 
  Upload, 
  Settings, 
  Play, 
  Monitor, 
  ArrowRight, 
  FileText,
  Code2,
  Cloud,
  BarChart3
} from "lucide-react";

interface FlowStep {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  details: string[];
}

const flowSteps: FlowStep[] = [
  {
    id: 1,
    title: "API Input",
    subtitle: "Upload & Analyze",
    icon: <Upload className="w-8 h-8" />,
    color: "from-blue-500 to-cyan-500",
    details: ["OpenAPI Spec", "REST Endpoints", "Authentication", "Validation"]
  },
  {
    id: 2,
    title: "AI Processing",
    subtitle: "Generate & Optimize",
    icon: <Settings className="w-8 h-8" />,
    color: "from-purple-500 to-pink-500",
    details: ["Code Generation", "Error Handling", "Documentation", "Testing"]
  },
  {
    id: 3,
    title: "Deployment",
    subtitle: "Deploy & Scale",
    icon: <Play className="w-8 h-8" />,
    color: "from-green-500 to-emerald-500",
    details: ["Containerization", "Load Balancing", "SSL Setup", "Auto-scaling"]
  },
  {
    id: 4,
    title: "Monitoring",
    subtitle: "Track & Maintain",
    icon: <Monitor className="w-8 h-8" />,
    color: "from-orange-500 to-red-500",
    details: ["Performance", "Analytics", "Alerts", "Health Checks"]
  }
];

const connectionPaths = [
  "M 150 50 Q 200 25 250 50",
  "M 350 50 Q 400 25 450 50",
  "M 550 50 Q 600 25 650 50"
];

export function VisualFlow() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="relative max-w-7xl mx-auto">
      {/* Flow Container */}
      <div className="relative">
        {/* Connection Lines */}
        <div className="absolute inset-0 hidden lg:block">
          <svg className="w-full h-full" viewBox="0 0 800 100">
            {connectionPaths.map((path, index) => (
              <motion.path
                key={index}
                d={path}
                stroke="url(#flowGradient)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 0.6 } : { pathLength: 0, opacity: 0 }}
                transition={{ 
                  duration: 1.5, 
                  delay: index * 0.3 + 0.5,
                  ease: "easeInOut"
                }}
              />
            ))}
            <defs>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="33%" stopColor="#8B5CF6" stopOpacity="0.8" />
                <stop offset="66%" stopColor="#10B981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Flow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {flowSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.8 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.2,
                ease: "easeOut"
              }}
              className="relative group"
            >
              {/* Main Card */}
              <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-neutral-800 border-2 border-neutral-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  {step.id}
                </div>

                {/* Icon */}
                <div className="mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: index * 0.2 + 0.3,
                      type: "spring",
                      stiffness: 200
                    }}
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto",
                      `bg-gradient-to-br ${step.color}`,
                      "shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                    )}
                  >
                    {step.icon}
                  </motion.div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-neutral-400 text-sm mb-4">{step.subtitle}</p>
                  
                  {/* Details */}
                  <div className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <motion.div
                        key={detailIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.2 + 0.6 + detailIndex * 0.1
                        }}
                        className="flex items-center justify-center space-x-2 text-xs text-neutral-300"
                      >
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          `bg-gradient-to-r ${step.color}`
                        )} />
                        <span>{detail}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-6 h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: "100%" } : { width: 0 }}
                    transition={{ 
                      duration: 1, 
                      delay: index * 0.2 + 0.8,
                      ease: "easeOut"
                    }}
                    className={cn(
                      "h-full rounded-full",
                      `bg-gradient-to-r ${step.color}`
                    )}
                  />
                </div>
              </div>

              {/* Arrow for mobile */}
              {index < flowSteps.length - 1 && (
                <div className="flex justify-center mt-4 lg:hidden">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.2 + 1
                    }}
                    className="text-neutral-600"
                  >
                    <ArrowRight className="w-6 h-6 rotate-90" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Summary */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="mt-16 text-center"
      >
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border border-neutral-800 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">
            Complete Automation in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Under 3 Minutes</span>
          </h3>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            From API registration to production deployment, our platform handles everything automatically 
            while you focus on building amazing applications.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
