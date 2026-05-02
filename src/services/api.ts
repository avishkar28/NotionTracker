import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../constants/endpoints';
import { Order, Task, User } from '../types';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Session expired - handle logout
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  setToken(token: string) {
    this.token = token;
  }

  logout() {
    this.token = null;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const response = await this.api.get('/orders');
    return response.data;
  }

  async getOrder(id: string): Promise<Order> {
    const response = await this.api.get(`/orders/${id}`);
    return response.data;
  }

  async createOrder(data: {
    vendorName: string;
    description: string;
    deadline: string;
    priority: 'low' | 'medium' | 'high';
  }): Promise<Order> {
    const response = await this.api.post('/orders', data);
    return response.data;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    const response = await this.api.put(`/orders/${id}`, data);
    return response.data;
  }

  async deleteOrder(id: string): Promise<void> {
    await this.api.delete(`/orders/${id}`);
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const response = await this.api.get('/tasks');
    return response.data;
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.api.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(data: {
    name: string;
    orderId: string;
    assignedDate: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }): Promise<Task> {
    const response = await this.api.post('/tasks', data);
    return response.data;
  }

  async updateTaskStatus(
    id: string,
    status: 'pending' | 'in-progress' | 'completed'
  ): Promise<Task> {
    const response = await this.api.put(`/tasks/${id}/status`, { status });
    return response.data;
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const response = await this.api.put(`/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: string): Promise<void> {
    await this.api.delete(`/tasks/${id}`);
  }

  async getTasksToday(): Promise<Task[]> {
    const response = await this.api.get('/tasks/today');
    return response.data;
  }

  async getTasksLogs(): Promise<Task[]> {
    const response = await this.api.get('/tasks/logs');
    return response.data;
  }
}

export const apiService = new ApiService();
