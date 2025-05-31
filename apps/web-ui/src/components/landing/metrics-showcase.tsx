"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Clock, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Server,
  CheckCircle,
  ArrowUp
} from "lucide-react";

interface Metric {
  id: string;
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  trend?: number;
}

const metrics: Metric[] = [
  {
    id: "setup-time",
    label: "Average Setup Time",
    value: 3,
    suffix: " min",
    icon: <Clock className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
    description: "From API registration to deployment",
    trend: -45
  },
  {
    id: "automation",
    label: "Process Automation",
    value: 100,
    suffix: "%",
    icon: <Zap className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500",
    description: "Fully automated code generation",
    trend: 0
  },
  {
    id: "uptime",
    label: "Platform Uptime",
    value: 99.9,
    suffix: "%",
    icon: <Shield className="w-6 h-6" />,
    color: "from-green-500 to-emerald-500",
    description: "Reliable infrastructure guarantee",
    trend: 2
  },
  {
    id: "performance",
    label: "Performance Boost",
    value: 300,
    suffix: "%",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "from-orange-500 to-red-500",
    description: "Faster than manual development",
    trend: 15
  },
  {
    id: "developers",
    label: "Active Developers",
    value: 1250,
    suffix: "+",
    icon: <Users className="w-6 h-6" />,
    color: "from-indigo-500 to-purple-500",
    description: "Growing developer community",
    trend: 25
  },
  {
    id: "servers",
    label: "MCP Servers Generated",
    value: 5600,
    suffix: "+",
    icon: <Server className="w-6 h-6" />,
    color: "from-teal-500 to-green-500",
    description: "Successfully deployed servers",
    trend: 40
  }
];

function AnimatedCounter({ 
  value, 
  suffix, 
  duration = 2000 
}: { 
  value: number; 
  suffix: string; 
  duration?: number; 
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(value * easeOutQuart));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setCount(value);
        }
      };

      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="font-bold">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function MetricsShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
            className="group relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
          >
            {/* Background Gradient */}
            <div className={cn(
              "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300",
              `bg-gradient-to-br ${metric.color}`
            )} />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon and Trend */}
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-white",
                  `bg-gradient-to-br ${metric.color}`
                )}>
                  {metric.icon}
                </div>
                {metric.trend !== undefined && metric.trend !== 0 && (
                  <div className="flex items-center space-x-1 text-green-400 text-sm">
                    <ArrowUp className="w-3 h-3" />
                    <span>+{metric.trend}%</span>
                  </div>
                )}
              </div>

              {/* Value */}
              <div className="mb-2">
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter 
                    value={metric.value} 
                    suffix={metric.suffix}
                    duration={2000 + index * 200}
                  />
                </div>
                <h3 className="text-lg font-semibold text-neutral-200 mt-1">
                  {metric.label}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-400 leading-relaxed">
                {metric.description}
              </p>

              {/* Progress Bar */}
              <div className="mt-4 h-1 bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: "100%" } : { width: 0 }}
                  transition={{ 
                    duration: 1.5, 
                    delay: index * 0.1 + 0.5,
                    ease: "easeOut"
                  }}
                  className={cn(
                    "h-full rounded-full",
                    `bg-gradient-to-r ${metric.color}`
                  )}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-full text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">All systems operational and performing above expectations</span>
        </div>
      </motion.div>
    </div>
  );
}
