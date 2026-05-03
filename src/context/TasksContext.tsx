import React, { createContext, useReducer, ReactNode, useEffect } from 'react';
import { Task } from '../types';
import { storageService } from '../services/storage';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

interface TasksAction {
  type:
    | 'SET_LOADING'
    | 'SET_ERROR'
    | 'SET_TASKS'
    | 'ADD_TASK'
    | 'UPDATE_TASK'
    | 'DELETE_TASK';
  payload?: any;
}

interface TasksContextType {
  state: TasksState;
  fetchTasks: () => Promise<void>;
  fetchTasksToday: () => Promise<void>;
  createTask: (data: any) => Promise<Task>;
  updateTask: (id: string, data: any) => Promise<Task>;
  updateTaskStatus: (
    id: string,
    status: 'pending' | 'in-progress' | 'completed'
  ) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

const tasksReducer = (state: TasksState, action: TasksAction): TasksState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      };
    default:
      return state;
  }
};

export const TasksContext = createContext<TasksContextType | undefined>(
  undefined
);

export const TasksProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(tasksReducer, initialState);

  // Load tasks from storage on mount
  useEffect(() => {
    loadTasksFromStorage();
  }, []);

  const loadTasksFromStorage = async () => {
    try {
      console.log('📂 Loading tasks from local storage...');
      const tasks = await storageService.getTasks();
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const fetchTasks = async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 600));
      const tasks = await storageService.getTasks();
      console.log('🔄 Tasks refreshed from storage:', tasks.length);
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to fetch tasks',
      });
    }
  };

  const fetchTasksToday = async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 400));
      const tasks = await storageService.getTasks();
      const today = new Date().toISOString().split('T')[0];
      const todayTasks = tasks.filter(
        (t) => t.assignedDate?.split('T')[0] === today
      );
      console.log('🔄 Today tasks refreshed:', todayTasks.length);
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to fetch today tasks',
      });
    }
  };

  const createTask = async (data: any): Promise<Task> => {
    try {
      const newTask: Task = {
        id: `task_${Date.now()}`,
        name: data.taskName,
        orderId: data.orderId,
        orderName: data.orderName,
        status: 'pending',
        assignedDate: new Date().toISOString(),
        dueDate: data.dueDate?.toISOString?.() || data.dueDate,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Save to storage
      await storageService.addTask(newTask);
      console.log('✅ Task created and saved:', newTask.id);

      dispatch({ type: 'ADD_TASK', payload: newTask });
      return newTask;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to create task';
      console.error('❌ Create task error:', errorMsg);
      dispatch({
        type: 'SET_ERROR',
        payload: errorMsg,
      });
      throw error;
    }
  };

  const updateTask = async (id: string, data: any): Promise<Task> => {
    try {
      const tasks = await storageService.getTasks();
      const task = tasks.find((t) => t.id === id);

      if (!task) {
        throw new Error('Task not found');
      }

      const updatedTask: Task = {
        ...task,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await storageService.updateTask(id, data);
      console.log('✅ Task updated:', id);

      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      return updatedTask;
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to update task',
      });
      throw error;
    }
  };

  const updateTaskStatus = async (
    id: string,
    status: 'pending' | 'in-progress' | 'completed'
  ): Promise<Task> => {
    try {
      const tasks = await storageService.getTasks();
      const task = tasks.find((t) => t.id === id);

      if (!task) {
        throw new Error('Task not found');
      }

      const completedAt =
        status === 'completed' ? new Date().toISOString() : undefined;

      const updatedTask: Task = {
        ...task,
        status,
        completedAt,
        updatedAt: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Save to storage
      await storageService.updateTask(id, {
        status,
        completedAt,
      });
      console.log('✅ Task status updated:', id, '→', status);

      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      return updatedTask;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to update task status';
      console.error('❌ Update task status error:', errorMsg);
      dispatch({
        type: 'SET_ERROR',
        payload: errorMsg,
      });
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await storageService.deleteTask(id);
      console.log('✅ Task deleted:', id);
      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to delete task';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMsg,
      });
      throw error;
    }
  };

  const value: TasksContextType = {
    state,
    fetchTasks,
    fetchTasksToday,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
};

export const useTasks = (): TasksContextType => {
  const context = React.useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within TasksProvider');
  }
  return context;
};
        type: 'SET_ERROR',
        payload: error.message || 'Failed to create task',
      });
      throw error;
    }
  };

  const updateTask = async (id: string, data: any): Promise<Task> => {
    try {
      const task = await apiService.updateTask(id, data);
      dispatch({ type: 'UPDATE_TASK', payload: task });
      return task;
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to update task',
      });
      throw error;
    }
  };

  const updateTaskStatus = async (
    id: string,
    status: 'pending' | 'in-progress' | 'completed'
  ): Promise<Task> => {
    try {
      // Find the task in state
      const taskToUpdate = state.tasks.find((t) => t.id === id);
      if (!taskToUpdate) {
        throw new Error('Task not found');
      }

      // Create updated task with new status
      const updatedTask: Task = {
        ...taskToUpdate,
        status,
        updatedAt: new Date().toISOString(),
        completedAt:
          status === 'completed' ? new Date().toISOString() : undefined,
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 400));

      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      return updatedTask;
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to update task status',
      });
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await apiService.deleteTask(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to delete task',
      });
      throw error;
    }
  };

  const value: TasksContextType = {
    state,
    fetchTasks,
    fetchTasksToday,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = React.useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};
