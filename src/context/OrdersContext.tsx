import React, { createContext, useReducer, ReactNode, useEffect } from 'react';
import { Order } from '../types';
import { storageService } from '../services/storage';

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

interface OrdersAction {
  type:
    | 'SET_LOADING'
    | 'SET_ERROR'
    | 'SET_ORDERS'
    | 'ADD_ORDER'
    | 'UPDATE_ORDER'
    | 'DELETE_ORDER';
  payload?: any;
}

interface OrdersContextType {
  state: OrdersState;
  fetchOrders: () => Promise<void>;
  createOrder: (data: any) => Promise<Order>;
  updateOrder: (id: string, data: any) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
};

const ordersReducer = (state: OrdersState, action: OrdersAction): OrdersState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload, loading: false };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.id ? action.payload : o
        ),
      };
    case 'DELETE_ORDER':
      return {
        ...state,
        orders: state.orders.filter((o) => o.id !== action.payload),
      };
    default:
      return state;
  }
};

export const OrdersContext = createContext<OrdersContextType | undefined>(
  undefined
);

export const OrdersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(ordersReducer, initialState);

  // Load orders from storage on mount
  useEffect(() => {
    loadOrdersFromStorage();
  }, []);

  const loadOrdersFromStorage = async () => {
    try {
      console.log('📂 Loading orders from local storage...');
      const orders = await storageService.getOrders();
      dispatch({ type: 'SET_ORDERS', payload: orders });
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const fetchOrders = async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      const orders = await storageService.getOrders();
      console.log('🔄 Orders refreshed from storage:', orders.length);
      dispatch({ type: 'SET_ORDERS', payload: orders });
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to fetch orders',
      });
    }
  };

  const createOrder = async (data: any): Promise<Order> => {
    try {
      // Validate deadline is today
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const deadlineString = data.deadline.toISOString?.().split('T')[0] || data.deadline;
      
      if (deadlineString !== todayString) {
        throw new Error('❌ Order deadline must be today');
      }

      const newOrder: Order = {
        id: `order_${Date.now()}`,
        vendorName: data.vendorName,
        description: data.description,
        deadline: data.deadline,
        priority: data.priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        taskCount: 0,
        completedTaskCount: 0,
      };
      
      // Simulate API delay (600ms)
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      // Save to storage
      await storageService.addOrder(newOrder);
      console.log('✅ Order created and saved:', newOrder.id);
      
      dispatch({ type: 'ADD_ORDER', payload: newOrder });
      return newOrder;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to create order';
      console.error('❌ Create order error:', errorMsg);
      dispatch({
        type: 'SET_ERROR',
        payload: errorMsg,
      });
      throw error;
    }
  };

  const updateOrder = async (id: string, data: any): Promise<Order> => {
    try {
      const orders = await storageService.getOrders();
      const order = orders.find((o) => o.id === id);
      
      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder: Order = {
        ...order,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await storageService.updateOrder(id, data);
      console.log('✅ Order updated:', id);
      
      dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
      return updatedOrder;
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to update order',
      });
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await storageService.deleteOrder(id);
      console.log('✅ Order deleted:', id);
      dispatch({ type: 'DELETE_ORDER', payload: id });
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to delete order';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMsg,
      });
      throw error;
    }
  };

  const value: OrdersContextType = {
    state,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
  };

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
};

export const useOrders = (): OrdersContextType => {
  const context = React.useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within OrdersProvider');
  }
  return context;
};
