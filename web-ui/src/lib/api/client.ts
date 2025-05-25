import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

class ApiClient {
  private registrationClient: AxiosInstance;
  private generatorClient: AxiosInstance;
  private deploymentClient: AxiosInstance;

  constructor() {
    // Create separate clients for each service
    this.registrationClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_REGISTRATION_API_URL || 'http://localhost:8081',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.generatorClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_GENERATOR_API_URL || 'http://localhost:8082',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.deploymentClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_DEPLOYMENT_API_URL || 'http://localhost:8083',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    const clients = [this.registrationClient, this.generatorClient, this.deploymentClient];

    clients.forEach((client) => {
      // Request interceptor to add auth token
      client.interceptors.request.use(
        (config) => {
          const token = Cookies.get('access_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Response interceptor to handle errors and token refresh
      client.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;

          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
              const refreshToken = Cookies.get('refresh_token');
              if (refreshToken) {
                const response = await axios.post(
                  `${this.registrationClient.defaults.baseURL}/api/v1/auth/refresh`,
                  { refresh_token: refreshToken }
                );

                const { access_token, refresh_token: newRefreshToken } = response.data;

                Cookies.set('access_token', access_token, { expires: 1 });
                Cookies.set('refresh_token', newRefreshToken, { expires: 7 });

                // Retry the original request
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return client(originalRequest);
              }
            } catch (refreshError) {
              // Refresh failed, redirect to login
              Cookies.remove('access_token');
              Cookies.remove('refresh_token');
              window.location.href = '/login';
              return Promise.reject(refreshError);
            }
          }

          // Handle other errors
          if (error.response?.status >= 500) {
            toast.error('Server error. Please try again later.');
          } else if (error.response?.status === 403) {
            toast.error('You do not have permission to perform this action.');
          } else if (error.response?.data?.detail) {
            toast.error(error.response.data.detail);
          }

          return Promise.reject(error);
        }
      );
    });
  }

  private getClient(service: 'registration' | 'generator' | 'deployment'): AxiosInstance {
    switch (service) {
      case 'registration':
        return this.registrationClient;
      case 'generator':
        return this.generatorClient;
      case 'deployment':
        return this.deploymentClient;
      default:
        return this.registrationClient;
    }
  }

  async get<T = any>(url: string, service: 'registration' | 'generator' | 'deployment' = 'registration', config?: AxiosRequestConfig): Promise<T> {
    const client = this.getClient(service);
    const response: AxiosResponse<T> = await client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, service: 'registration' | 'generator' | 'deployment' = 'registration', config?: AxiosRequestConfig): Promise<T> {
    const client = this.getClient(service);
    const response: AxiosResponse<T> = await client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, service: 'registration' | 'generator' | 'deployment' = 'registration', config?: AxiosRequestConfig): Promise<T> {
    const client = this.getClient(service);
    const response: AxiosResponse<T> = await client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, service: 'registration' | 'generator' | 'deployment' = 'registration', config?: AxiosRequestConfig): Promise<T> {
    const client = this.getClient(service);
    const response: AxiosResponse<T> = await client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, service: 'registration' | 'generator' | 'deployment' = 'registration', config?: AxiosRequestConfig): Promise<T> {
    const client = this.getClient(service);
    const response: AxiosResponse<T> = await client.delete(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
