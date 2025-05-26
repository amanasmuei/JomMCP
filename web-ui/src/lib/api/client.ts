import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { logger } from '../logger';
import { handleApiError, getUserFriendlyMessage } from '../error-handling';

// Extend the Axios config interface to include metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  constructor() {
    // Use API Gateway as single entry point
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token and logging
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log API request
        const startTime = Date.now();
        config.metadata = { startTime };

        logger.logApiRequest(
          config.method?.toUpperCase() || 'UNKNOWN',
          `${config.baseURL}${config.url}`,
          undefined,
          undefined,
          {
            service: 'api-gateway',
            requestData: config.data ? 'present' : 'none'
          }
        );

        return config;
      },
      (error) => {
        logger.error('API request setup failed', { error: error.message }, 'api');
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor to handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => {
        // Log successful response
        const duration = response.config.metadata?.startTime
          ? Date.now() - response.config.metadata.startTime
          : undefined;

        logger.logApiRequest(
          response.config.method?.toUpperCase() || 'UNKNOWN',
          `${response.config.baseURL}${response.config.url}`,
          response.status,
          duration,
          {
            service: 'api-gateway',
            responseSize: JSON.stringify(response.data).length
          }
        );

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            }).catch((err) => {
              return Promise.reject(this.handleError(err));
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = Cookies.get('refresh_token');
            if (refreshToken) {
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`,
                { refresh_token: refreshToken }
              );

              const { access_token } = response.data;
              Cookies.set('access_token', access_token, { expires: 1 });

              // Process failed queue
              this.processQueue(null, access_token);

              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.processQueue(refreshError, null);
            this.clearAuthTokens();

            // Only redirect if we're in the browser
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }

            return Promise.reject(this.handleError(refreshError));
          } finally {
            this.isRefreshing = false;
          }
        }

        // Enhanced error handling with logging
        const duration = error.config?.metadata?.startTime
          ? Date.now() - error.config.metadata.startTime
          : undefined;

        // Log the error
        logger.logApiRequest(
          error.config?.method?.toUpperCase() || 'UNKNOWN',
          `${error.config?.baseURL}${error.config?.url}`,
          error.response?.status,
          duration,
          {
            service: 'api-gateway',
            errorMessage: error.message,
            errorData: error.response?.data
          }
        );

        // Handle the error with our error handler
        const apiError = handleApiError(error, {
          service: 'api-gateway',
          url: error.config?.url,
          method: error.config?.method
        });

        // Show user-friendly message
        const userMessage = getUserFriendlyMessage(apiError);
        if (error.response?.status !== 401) { // Don't show toast for auth errors (handled by redirect)
          toast.error(userMessage);
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private clearAuthTokens() {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  }

  private handleError(error: any): ApiError {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: 500,
    };

    if (error.response) {
      // Server responded with error status
      apiError.status = error.response.status;
      apiError.message = error.response.data?.detail ||
                        error.response.data?.message ||
                        error.response.statusText ||
                        'Server error';
      apiError.details = error.response.data;
    } else if (error.request) {
      // Request was made but no response received
      apiError.message = 'Network error - please check your connection';
      apiError.status = 0;
    } else {
      // Something else happened
      apiError.message = error.message || 'Request failed';
    }

    return apiError;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  // Health check methods
  async healthCheck(): Promise<{ status: string; services?: any }> {
    return this.get('/health/all');
  }

  async getServiceHealth(service: string): Promise<{ status: string }> {
    return this.get(`/health/${service}`);
  }
}

export const apiClient = new ApiClient();
