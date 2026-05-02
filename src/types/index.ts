// Order types
export interface Order {
  id: string;
  vendorName: string;
  description: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  completedTaskCount?: number;
}

// Task types
export interface Task {
  id: string;
  name: string;
  orderId: string;
  orderName?: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedDate: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// User/Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  MainApp: undefined;
  OrderDetails: { orderId: string };
  TaskDetails: { taskId: string };
};

export type MainTabParamList = {
  Today: undefined;
  Orders: undefined;
  Tasks: undefined;
  Settings: undefined;
};
