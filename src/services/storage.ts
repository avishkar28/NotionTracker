import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, Task } from '../types';

const STORAGE_KEYS = {
  ORDERS: '@notiontracker/orders',
  TASKS: '@notiontracker/tasks',
};

// Storage Service for local persistence
export const storageService = {
  // Orders
  async saveOrders(orders: Order[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      console.log('✅ Orders saved to local storage:', orders.length);
    } catch (error) {
      console.error('❌ Failed to save orders:', error);
      throw error;
    }
  },

  async getOrders(): Promise<Order[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!data) return [];
      const orders = JSON.parse(data);
      console.log('✅ Orders loaded from local storage:', orders.length);
      return orders;
    } catch (error) {
      console.error('❌ Failed to load orders:', error);
      return [];
    }
  },

  // Tasks
  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      console.log('✅ Tasks saved to local storage:', tasks.length);
    } catch (error) {
      console.error('❌ Failed to save tasks:', error);
      throw error;
    }
  },

  async getTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) return [];
      const tasks = JSON.parse(data);
      console.log('✅ Tasks loaded from local storage:', tasks.length);
      return tasks;
    } catch (error) {
      console.error('❌ Failed to load tasks:', error);
      return [];
    }
  },

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.ORDERS, STORAGE_KEYS.TASKS]);
      console.log('✅ All data cleared from local storage');
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
    }
  },

  // Add a single order
  async addOrder(order: Order): Promise<void> {
    const orders = await this.getOrders();
    orders.push(order);
    await this.saveOrders(orders);
  },

  // Update a single order
  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
      await this.saveOrders(orders);
    }
  },

  // Delete an order
  async deleteOrder(id: string): Promise<void> {
    const orders = await this.getOrders();
    const filtered = orders.filter((o) => o.id !== id);
    await this.saveOrders(filtered);
  },

  // Add a single task
  async addTask(task: Task): Promise<void> {
    const tasks = await this.getTasks();
    tasks.push(task);
    await this.saveTasks(tasks);
  },

  // Update a single task
  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const tasks = await this.getTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
      await this.saveTasks(tasks);
    }
  },

  // Delete a task
  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    await this.saveTasks(filtered);
  },
};
