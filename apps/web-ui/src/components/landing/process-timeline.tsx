"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload, Settings, Play, Monitor, ArrowRight, CheckCircle } from "lucide-react";

interface TimelineStep {
  id: number;
  title: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
  color: string;
  duration: string;
  status: "completed" | "active" | "upcoming";
}

const timelineSteps: TimelineStep[] = [
  {
    id: 1,
    title: "Register Your API",
    description: "Upload OpenAPI spec or provide endpoint URL for automatic analysis",
    details: [
      "Drag & drop OpenAPI/Swagger files",
      "Automatic API structure validation",
      "Real-time endpoint discovery",
      "Security configuration detection"
    ],
    icon: <Upload className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
    duration: "30 seconds",
    status: "completed"
  },
  {
    id: 2,
    title: "AI-Powered Generation",
    description: "Our intelligent system creates optimized MCP server code",
    details: [
      "Smart code generation with best practices",
      "Automatic error handling implementation",
      "Built-in authentication & security",
      "Comprehensive documentation generation"
    ],
    icon: <Settings className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500",
    duration: "2 minutes",
    status: "active"
  },
  {
    id: 3,
    title: "One-Click Deployment",
    description: "Deploy to our cloud infrastructure with automatic scaling",
    details: [
      "Containerized deployment",
      "Auto-scaling configuration",
      "Load balancer setup",
      "SSL certificate provisioning"
    ],
    icon: <Play className="w-6 h-6" />,
    color: "from-green-500 to-emerald-500",
    duration: "30 seconds",
    status: "upcoming"
  },
  {
    id: 4,
    title: "Monitor & Manage",
    description: "Real-time monitoring with comprehensive analytics dashboard",
    details: [
      "Performance metrics tracking",
      "Error monitoring & alerting",
      "Usage analytics & insights",
      "Automated health checks"
    ],
    icon: <Monitor className="w-6 h-6" />,
    color: "from-orange-500 to-red-500",
    duration: "Ongoing",
    status: "upcoming"
  }
];

export function ProcessTimeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="relative max-w-6xl mx-auto">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500 opacity-30" />
      
      {/* Steps */}
      <div className="space-y-12">
        {timelineSteps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.2,
              ease: "easeOut"
            }}
            className="relative flex items-start group"
          >
            {/* Timeline Node */}
            <div className="relative z-10 flex-shrink-0">
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.2 + 0.3,
                  type: "spring",
                  stiffness: 200
                }}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg",
                  `bg-gradient-to-br ${step.color}`,
                  step.status === "active" && "ring-4 ring-purple-500/30 animate-pulse"
                )}
              >
                {step.icon}
              </motion.div>
              
              {/* Step Number */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center text-xs font-bold border-2 border-neutral-200 dark:border-neutral-700">
                {step.status === "completed" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  step.id
                )}
              </div>
            </div>

            {/* Content */}
            <div className="ml-8 flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.2 + 0.4
                }}
                className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 group-hover:border-neutral-700 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
                    <p className="text-neutral-400">{step.description}</p>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      step.status === "completed" && "bg-green-500/20 text-green-400",
                      step.status === "active" && "bg-purple-500/20 text-purple-400",
                      step.status === "upcoming" && "bg-neutral-500/20 text-neutral-400"
                    )}>
                      {step.duration}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {step.details.map((detail, detailIndex) => (
                    <motion.div
                      key={detailIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.2 + 0.6 + detailIndex * 0.1
                      }}
                      className="flex items-center space-x-2 text-sm text-neutral-300"
                    >
                      <ArrowRight className="w-3 h-3 text-neutral-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
