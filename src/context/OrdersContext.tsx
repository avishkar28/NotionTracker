import React, { createContext, useReducer, ReactNode } from 'react';
import { Order } from '../types';
import { apiService } from '../services/api';

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

  const fetchOrders = async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const orders = await apiService.getOrders();
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
      const order = await apiService.createOrder(data);
      dispatch({ type: 'ADD_ORDER', payload: order });
      return order;
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to create order',
      });
      throw error;
    }
  };

  const updateOrder = async (id: string, data: any): Promise<Order> => {
    try {
      const order = await apiService.updateOrder(id, data);
      dispatch({ type: 'UPDATE_ORDER', payload: order });
      return order;
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
      await apiService.deleteOrder(id);
      dispatch({ type: 'DELETE_ORDER', payload: id });
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to delete order',
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

export const useOrders = () => {
  const context = React.useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};
