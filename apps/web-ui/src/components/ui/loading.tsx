"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse" | "skeleton";
  className?: string;
  text?: string;
}

export function Loading({ 
  size = "md", 
  variant = "spinner", 
  className,
  text 
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  if (variant === "spinner") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
        <div
          className={cn(
            "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
            sizeClasses[size]
          )}
        />
        {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn(
                "rounded-full bg-blue-600",
                size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"
              )}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
        {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
        <motion.div
          className={cn(
            "rounded-full bg-gradient-to-r from-blue-500 to-purple-500",
            sizeClasses[size]
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
        {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton w-1/2" />
      </div>
    );
  }

  return null;
}

export function PageLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="w-16 h-16 mx-auto mb-4"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-full h-full border-4 border-gray-200 border-t-blue-500 rounded-full" />
        </motion.div>
        <motion.p
          className="text-white text-lg"
          animate={{
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          Loading JomMCP Platform...
        </motion.p>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-neutral-700 rounded-xl" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-neutral-700 rounded w-3/4" />
          <div className="h-3 bg-neutral-700 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-neutral-700 rounded" />
        <div className="h-3 bg-neutral-700 rounded w-5/6" />
        <div className="h-3 bg-neutral-700 rounded w-4/6" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 items-center">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded skeleton w-3/4" />
          </div>
          <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton" />
        </div>
      ))}
    </div>
  );
}