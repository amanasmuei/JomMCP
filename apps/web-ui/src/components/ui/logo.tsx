'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'compact' | 'large';
  showText?: boolean;
  href?: string;
  className?: string;
  animated?: boolean;
}

const LogoIcon = ({ size, animated = false }: { size: number; animated?: boolean }) => {
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 shadow-lg",
        animated && "group-hover:shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-300"
      )}
      style={{ width: size, height: size }}
    >
      {/* Animated background glow */}
      {animated && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
      )}
      
      {/* Main logo design - futuristic geometric pattern */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          className={cn(
            "text-white",
            animated && "group-hover:scale-110 transition-transform duration-300"
          )}
        >
          {/* Outer hexagon */}
          <path
            d="M12 2L21 7V17L12 22L3 17V7L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className={animated ? "animate-pulse" : ""}
          />
          
          {/* Inner geometric pattern */}
          <path
            d="M12 6L17 9V15L12 18L7 15V9L12 6Z"
            fill="currentColor"
            fillOpacity="0.3"
          />
          
          {/* Central diamond */}
          <path
            d="M12 8L15 10V14L12 16L9 14V10L12 8Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
          
          {/* Core dot */}
          <circle
            cx="12"
            cy="12"
            r="2"
            fill="currentColor"
            className={animated ? "animate-ping" : ""}
          />
          
          {/* Connection lines */}
          <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="1" opacity="0.7" />
          <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1" opacity="0.7" />
          <line x1="3" y1="7" x2="7" y2="9" stroke="currentColor" strokeWidth="1" opacity="0.7" />
          <line x1="17" y1="9" x2="21" y2="7" stroke="currentColor" strokeWidth="1" opacity="0.7" />
          <line x1="3" y1="17" x2="7" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.7" />
          <line x1="17" y1="15" x2="21" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        </svg>
      </div>
      
      {/* Corner accent dots */}
      <div className="absolute top-1 right-1 w-1 h-1 bg-white/60 rounded-full" />
      <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/60 rounded-full" />
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  showText = true,
  href = '/',
  className,
  animated = false,
}) => {
  const sizes = {
    compact: { icon: 32, text: 'text-lg' },
    default: { icon: 48, text: 'text-2xl' },
    large: { icon: 64, text: 'text-4xl' },
  };

  const { icon: iconSize, text: textSize } = sizes[variant];

  const LogoContent = () => (
    <div className={cn(
      "flex items-center space-x-3",
      animated && "group",
      className
    )}>
      <LogoIcon size={iconSize} animated={animated} />
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent",
            textSize,
            animated && "group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-indigo-500 transition-all duration-300"
          )}>
            JomMCP
          </span>
          {variant === 'large' && (
            <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
              API to MCP Platform
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={animated ? "group" : ""}>
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
};

export default Logo;
