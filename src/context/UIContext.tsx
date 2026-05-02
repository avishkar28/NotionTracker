import React, { createContext, useState, ReactNode } from 'react';

interface UIState {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  autoSync: boolean;
}

interface UIContextType {
  state: UIState;
  setTheme: (theme: 'light' | 'dark') => void;
  setNotifications: (enabled: boolean) => void;
  setAutoSync: (enabled: boolean) => void;
}

const initialState: UIState = {
  theme: 'light',
  notificationsEnabled: true,
  autoSync: true,
};

export const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UIState>(initialState);

  const setTheme = (theme: 'light' | 'dark') => {
    setState((prev) => ({ ...prev, theme }));
  };

  const setNotifications = (enabled: boolean) => {
    setState((prev) => ({ ...prev, notificationsEnabled: enabled }));
  };

  const setAutoSync = (enabled: boolean) => {
    setState((prev) => ({ ...prev, autoSync: enabled }));
  };

  const value: UIContextType = {
    state,
    setTheme,
    setNotifications,
    setAutoSync,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = React.useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
