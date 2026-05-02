import React, { createContext, useReducer, ReactNode } from 'react';
import { Task } from '../types';
import { apiService } from '../services/api';

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

const mockTasks: Task[] = [
  {
    id: 'task_1',
    name: 'Design mockup',
    orderId: '1',
    orderName: 'John Designs',
    status: 'pending',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task_2',
    name: 'Review with client',
    orderId: '1',
    orderName: 'John Designs',
    status: 'in-progress',
    assignedDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialState: TasksState = {
  tasks: mockTasks,
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

  const fetchTasks = async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const tasks = await apiService.getTasks();
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
      const tasks = await apiService.getTasksToday();
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
        name: data.name,
        orderId: data.orderId,
        status: 'pending',
        assignedDate: data.assignedDate,
        dueDate: data.dueDate,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      dispatch({ type: 'ADD_TASK', payload: newTask });
      return newTask;
    } catch (error: any) {
      dispatch({
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
      const task = await apiService.updateTaskStatus(id, status);
      dispatch({ type: 'UPDATE_TASK', payload: task });
      return task;
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
