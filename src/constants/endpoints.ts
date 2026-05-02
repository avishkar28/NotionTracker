// API endpoints configuration
export const API_BASE_URL = 'http://192.168.x.x:5000'; // Change to your local IP

export const ENDPOINTS = {
  // Orders
  orders: '/orders',
  orderDetail: (id: string) => `/orders/${id}`,
  
  // Tasks
  tasks: '/tasks',
  taskDetail: (id: string) => `/tasks/${id}`,
  taskStatus: (id: string) => `/tasks/${id}/status`,
  tasksToday: '/tasks/today',
  tasksLogs: '/tasks/logs',
};
