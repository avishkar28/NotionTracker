import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { OrdersProvider } from './src/context/OrdersContext';
import { TasksProvider } from './src/context/TasksContext';
import { UIProvider } from './src/context/UIContext';
import RootNavigator from './src/navigation/RootNavigator';
import { COLORS } from './src/constants/colors';

function AppContent() {
  const { state: authState } = useAuth();

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />
      <RootNavigator isLoggedIn={authState.isLoggedIn} />
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OrdersProvider>
          <TasksProvider>
            <UIProvider>
              <AppContent />
            </UIProvider>
          </TasksProvider>
        </OrdersProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
