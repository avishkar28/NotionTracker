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
      if (!data) {
        console.log('📂 No orders in storage yet');
        return [];
      }
      const orders = JSON.parse(data);
      console.log('✅ Orders loaded from local storage:', orders.length);
      return Array.isArray(orders) ? orders : [];
    } catch (error: any) {
      console.error('❌ Failed to load orders:', error.message || error);
      // Clear corrupted data
      try {
        await AsyncStorage.removeItem(STORAGE_KEYS.ORDERS);
      } catch (e) {
        console.error('Failed to clear corrupted orders:', e);
      }
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
      if (!data) {
        console.log('📂 No tasks in storage yet');
        return [];
      }
      const tasks = JSON.parse(data);
      console.log('✅ Tasks loaded from local storage:', tasks.length);
      return Array.isArray(tasks) ? tasks : [];
    } catch (error: any) {
      console.error('❌ Failed to load tasks:', error.message || error);
      // Clear corrupted data
      try {
        await AsyncStorage.removeItem(STORAGE_KEYS.TASKS);
      } catch (e) {
        console.error('Failed to clear corrupted tasks:', e);
      }
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
    try {
      const tasks = await this.getTasks();
      if (!Array.isArray(tasks)) {
        throw new Error('Tasks data is corrupted');
      }
      tasks.push(task);
      await this.saveTasks(tasks);
      console.log('✅ Task added:', task.id);
    } catch (error: any) {
      console.error('❌ Failed to add task:', error.message || error);
      throw error;
    }
  },

  // Update a single task
  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    try {
      const tasks = await this.getTasks();
      if (!Array.isArray(tasks)) {
        throw new Error('Tasks data is corrupted');
      }
      const index = tasks.findIndex((t) => t.id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
        await this.saveTasks(tasks);
        console.log('✅ Task updated:', id);
      } else {
        console.warn('⚠️ Task not found for update:', id);
      }
    } catch (error: any) {
      console.error('❌ Failed to update task:', error.message || error);
      throw error;
    }
  },

  // Delete a task
  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    await this.saveTasks(filtered);
  },
};
