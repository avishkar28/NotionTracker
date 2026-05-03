import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList } from '../types';
import { COLORS } from '../constants/colors';
import { scale } from '../utils/responsive';
import DashboardScreen from '../screens/DashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';
import TasksScreen from '../screens/TasksScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';

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
      headerShown: true,
      headerStyle: {
        backgroundColor: COLORS.backgroundSecondary,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      },
      headerTitleStyle: {
        color: COLORS.textPrimary,
        fontFamily: 'Georgia',
        fontSize: scale(18),
        fontWeight: '700',
      },
      headerTintColor: COLORS.accent,
    }}
  >
    <TasksStack.Screen
      name="Tasks"
      component={TasksScreen}
      options={{
        headerShown: false,
      }}
    />
    <TasksStack.Screen
      name="TaskDetails"
      component={TaskDetailsScreen}
      options={({ route }: any) => ({
        title: route.params?.taskId || 'Task Details',
      })}
    />
  </TasksStack.Navigator>
);

const DashboardNavigator = () => (
  <DashboardStack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: COLORS.backgroundSecondary,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      },
      headerTitleStyle: {
        color: COLORS.textPrimary,
        fontFamily: 'Georgia',
        fontSize: scale(18),
        fontWeight: '700',
      },
      headerTintColor: COLORS.accent,
    }}
  >
    <DashboardStack.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{
        headerShown: false,
      }}
    />
    <DashboardStack.Screen
      name="OrderDetails"
      component={OrderDetailsScreen}
      options={({ route }: any) => ({
        title: route.params?.vendorName || 'Order Details',
      })}
    />
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
