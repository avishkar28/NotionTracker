import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList } from '../types';
import { COLORS } from '../constants/colors';
import DashboardScreen from '../screens/DashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';
import TasksScreen from '../screens/TasksScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const OrdersStack = createNativeStackNavigator();
const TasksStack = createNativeStackNavigator();
const DashboardStack = createNativeStackNavigator();

const OrdersNavigator = () => (
  <OrdersStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <OrdersStack.Screen name="Orders" component={OrdersScreen} />
  </OrdersStack.Navigator>
);

const TasksNavigator = () => (
  <TasksStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <TasksStack.Screen name="Tasks" component={TasksScreen} />
  </TasksStack.Navigator>
);

const DashboardNavigator = () => (
  <DashboardStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <DashboardStack.Screen name="Today" component={DashboardScreen} />
  </DashboardStack.Navigator>
);

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 5,
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={DashboardNavigator}
        options={{
          tabBarLabel: 'Today',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersNavigator}
        options={{
          tabBarLabel: 'Orders',
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksNavigator}
        options={{
          tabBarLabel: 'Tasks',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Me',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
