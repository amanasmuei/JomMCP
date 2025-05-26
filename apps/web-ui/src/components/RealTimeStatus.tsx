'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

interface StatusUpdate {
  type: string;
  server_id?: string;
  deployment_id?: string;
  status: string;
  message?: string;
  timestamp: string;
}

interface RealTimeStatusProps {
  serverId?: string;
  deploymentId?: string;
  className?: string;
}

export function RealTimeStatus({ serverId, deploymentId, className = '' }: RealTimeStatusProps) {
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('unknown');

  // Determine WebSocket endpoint based on what we're monitoring
  const wsEndpoint = serverId 
    ? `/generation/${serverId}` 
    : deploymentId 
    ? `/deployments/${deploymentId}`
    : '/status';

  const { isConnected, connectionState, sendMessage } = useWebSocket(wsEndpoint, {
    onMessage: (message) => {
      if (message.type === 'status_update') {
        const update: StatusUpdate = {
          type: message.type,
          server_id: message.data.server_id,
          deployment_id: message.data.deployment_id,
          status: message.data.status,
          message: message.data.message,
          timestamp: message.timestamp || new Date().toISOString(),
        };
        
        setUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10 updates
        setCurrentStatus(update.status);
      }
    },
    onConnect: () => {
      // Send ping to keep connection alive
      const interval = setInterval(() => {
        sendMessage('ping');
      }, 30000);
      
      return () => clearInterval(interval);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready':
      case 'running':
      case 'completed':
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
      case 'generating':
      case 'building':
      case 'deploying':
      case 'scaling':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'failed':
      case 'error':
      case 'stopped':
      case 'unhealthy':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready':
      case 'running':
      case 'completed':
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
      case 'generating':
      case 'building':
      case 'deploying':
      case 'scaling':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
      case 'error':
      case 'stopped':
      case 'unhealthy':
        return 'text-red-600 dark:text-red-400';
      case 'degraded':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'text-green-600 dark:text-green-400';
      case 'connecting':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'disconnected':
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Real-time Status
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className={`text-xs font-medium ${getConnectionStatusColor()}`}>
              {connectionState}
            </span>
          </div>
        </div>

        {/* Current Status */}
        {currentStatus !== 'unknown' && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
            {getStatusIcon(currentStatus)}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Current Status
              </p>
              <p className={`text-sm ${getStatusColor(currentStatus)}`}>
                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
              </p>
            </div>
          </div>
        )}

        {/* Recent Updates */}
        {updates.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Recent Updates
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {updates.map((update, index) => (
                <div
                  key={`${update.timestamp}-${index}`}
                  className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  {getStatusIcon(update.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${getStatusColor(update.status)}`}>
                        {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {update.message && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        {update.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No updates message */}
        {updates.length === 0 && isConnected && (
          <div className="text-center py-4">
            <ClockIcon className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Waiting for status updates...
            </p>
          </div>
        )}

        {/* Connection error message */}
        {!isConnected && connectionState === 'error' && (
          <div className="text-center py-4">
            <XCircleIcon className="mx-auto h-8 w-8 text-red-400" />
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Connection failed. Retrying...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
