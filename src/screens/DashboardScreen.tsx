import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import { useTasks } from '../context/TasksContext';
import { useOrders } from '../context/OrdersContext';
import { scale } from '../utils/responsive';
import {
  sortTasksByUrgency,
  enrichTaskWithUrgency,
} from '../utils/taskUrgency';
import TaskCheckboxItem from '../components/TaskCheckboxItem';
import SkeletonLoader from '../components/SkeletonLoader';
import CreateOrderModal from '../components/CreateOrderModal';
import { Task } from '../types';

type DashboardScreenProps = NativeStackScreenProps<any, 'Dashboard'>;

interface TaskStats {
  orders: number;
  pending: number;
  completedToday: number;
  overdue: number;
}

interface CategorizedTasks {
  today: Task[];
  upcoming: Map<string, Task[]>;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { state: tasksState, updateTaskStatus } = useTasks();
  const { state: ordersState, createOrder } = useOrders();

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data state
  const [stats, setStats] = useState<TaskStats>({
    orders: 0,
    pending: 0,
    completedToday: 0,
    overdue: 0,
  });
  const [categorizedTasks, setCategorizedTasks] = useState<CategorizedTasks>({
    today: [],
    upcoming: new Map(),
  });

  // UI state
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [upcomingExpanded, setUpcomingExpanded] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Helper function to categorize and process tasks
  const processTaskData = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayTasks: Task[] = [];
    const upcomingMap = new Map<string, Task[]>();

    tasksState.tasks.forEach((task) => {
      const taskDueDate = new Date(task.dueDate);
      const taskDueDateOnly = new Date(
        taskDueDate.getFullYear(),
        taskDueDate.getMonth(),
        taskDueDate.getDate()
      );

      // Today's tasks (including overdue)
      if (taskDueDateOnly <= today && task.status !== 'completed') {
        todayTasks.push(task);
      } else if (taskDueDateOnly > today && task.status !== 'completed') {
        // Upcoming tasks
        const dateKey = taskDueDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        if (!upcomingMap.has(dateKey)) {
          upcomingMap.set(dateKey, []);
        }
        upcomingMap.get(dateKey)!.push(task);
      }
    });

    // Sort today's tasks by urgency
    const sortedTodayTasks = sortTasksByUrgency(todayTasks).map(
      enrichTaskWithUrgency
    );

    // Calculate stats
    const overdueTasks = todayTasks.filter(
      (t) => new Date(t.dueDate) < today && t.status !== 'completed'
    );
    const pendingTasks = tasksState.tasks.filter(
      (t) => t.status === 'pending'
    );
    const completedToday = tasksState.tasks.filter(
      (t) =>
        t.status === 'completed' &&
        t.completedAt &&
        new Date(t.completedAt).toDateString() === today.toDateString()
    );

    setStats({
      orders: ordersState.orders.length,
      pending: pendingTasks.length,
      completedToday: completedToday.length,
      overdue: overdueTasks.length,
    });

    setCategorizedTasks({
      today: sortedTodayTasks,
      upcoming: upcomingMap,
    });
  };

  // Initial load with parallel fetching simulation
  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        // Simulate parallel API requests:
        // GET /orders, GET /tasks/today, GET /tasks
        await Promise.all([
          new Promise((resolve) => setTimeout(resolve, 800)), // GET /orders
          new Promise((resolve) => setTimeout(resolve, 600)), // GET /tasks/today
          new Promise((resolve) => setTimeout(resolve, 700)), // GET /tasks
        ]);

        processTaskData();
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Sync with task/order changes
  useEffect(() => {
    if (!isLoading) {
      processTaskData();
    }
  }, [tasksState.tasks, ordersState.orders]);

  const handleCreateOrder = async (orderData: any) => {
    try {
      const newOrder = await createOrder(orderData);
      setShowCreateOrderModal(false);

      Alert.alert(
        '✓ Order Created!',
        `${orderData.vendorName} has been added.`,
        [
          {
            text: 'View Order',
            onPress: () => {
              navigation.navigate('OrderDetails', { orderId: newOrder.id });
            },
          },
          {
            text: 'Done',
            onPress: () => {},
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create order. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      processTaskData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleTaskCheckboxPress = async (task: Task) => {
    try {
      setUpdatingTaskId(task.id);

      // Cycle through statuses
      let nextStatus: 'pending' | 'in-progress' | 'completed';
      switch (task.status) {
        case 'pending':
          nextStatus = 'in-progress';
          break;
        case 'in-progress':
          nextStatus = 'completed';
          break;
        case 'completed':
          nextStatus = 'pending';
          break;
        default:
          nextStatus = 'pending';
      }

      await updateTaskStatus(task.id, nextStatus);
    } catch (error) {
      Alert.alert('Error', 'Failed to update task. Please try again.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = `${dayName}, ${today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })}`;

  // Get upcoming dates
  const upcomingDates = Array.from(categorizedTasks.upcoming.keys()).sort();

  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Today</Text>
            <SkeletonLoader count={1} height={scale(12)} width={scale(120)} />
          </View>
          <View style={styles.headerIcons}>
            <View style={styles.iconButton} />
            <View style={styles.avatar} />
          </View>
        </View>

        {/* Stats Skeleton */}
        <View style={styles.statsSection}>
          <SkeletonLoader count={1} height={scale(60)} width="48%" />
          <SkeletonLoader count={1} height={scale(60)} width="48%" />
        </View>

        {/* Content Skeleton */}
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <SkeletonLoader count={4} height={scale(50)} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Today</Text>
            <Text style={styles.date}>{dateStr}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>🔍</Text>
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>A</Text>
            </View>
          </View>
        </View>

        {/* Stats Section - Fixed at top */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, styles.statCardCompleted]}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              ✅
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statCount}>{stats.completedToday}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardPending]}>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>
              ☐
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statCount}>{stats.pending}</Text>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.accent}
            />
          }
        >
          {/* Today's Tasks Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Tasks</Text>
              <Text style={styles.taskCount}>{categorizedTasks.today.length}</Text>
            </View>

            {categorizedTasks.today.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📋</Text>
                <Text style={styles.emptyStateText}>No tasks today</Text>
                <Text style={styles.emptyStateSubtext}>
                  Great work! You're all caught up
                </Text>
              </View>
            ) : (
              <View style={styles.tasksList}>
                {categorizedTasks.today.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskItem}
                    onPress={() => handleTaskCheckboxPress(task)}
                    disabled={updatingTaskId === task.id}
                    activeOpacity={0.7}
                  >
                    <TaskCheckboxItem
                      task={task}
                      onPress={() => {}}
                      onCheckboxPress={() => handleTaskCheckboxPress(task)}
                      isCompleting={updatingTaskId === task.id}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Upcoming Tasks Section */}
          {upcomingDates.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => setUpcomingExpanded(!upcomingExpanded)}
              >
                <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
                <Text
                  style={[
                    styles.collapseIcon,
                    upcomingExpanded && styles.collapseIconOpen,
                  ]}
                >
                  ▶
                </Text>
              </TouchableOpacity>

              {upcomingExpanded && (
                <View style={styles.upcomingContent}>
                  {upcomingDates.map((dateKey) => {
                    const tasksForDate = categorizedTasks.upcoming.get(dateKey) || [];
                    return (
                      <View key={dateKey} style={styles.upcomingDateGroup}>
                        <Text style={styles.upcomingDateLabel}>
                          📅 {dateKey}: {tasksForDate.length} tasks
                        </Text>
                        <View style={styles.upcomingTasksList}>
                          {tasksForDate.map((task) => (
                            <TouchableOpacity
                              key={task.id}
                              style={styles.upcomingTaskItem}
                            >
                              <Text style={styles.upcomingTaskName}>
                                {task.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* New Order Button */}
          <TouchableOpacity
            style={styles.newOrderButton}
            onPress={() => setShowCreateOrderModal(true)}
          >
            <Text style={styles.newOrderButtonText}>+ New Order</Text>
          </TouchableOpacity>

          <View style={{ height: scale(20) }} />
        </ScrollView>
      </View>

      {/* Create Order Modal */}
      <CreateOrderModal
        visible={showCreateOrderModal}
        onClose={() => setShowCreateOrderModal(false)}
        onCreateOrder={handleCreateOrder}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.backgroundSecondary,
  },
  title: {
    fontSize: scale(28),
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Georgia',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: scale(10),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    marginTop: scale(3),
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: scale(8),
    alignItems: 'center',
  },
  iconButton: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(6),
    backgroundColor: '#eeece9',
    borderWidth: 1,
    borderColor: '#ddd9d3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: scale(14),
  },
  avatar: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: scale(12),
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'monospace',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    gap: scale(10),
    backgroundColor: COLORS.backgroundSecondary,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: scale(12),
    paddingHorizontal: scale(10),
    alignItems: 'center',
  },
  statCardCompleted: {
    backgroundColor: '#f0f7f3',
    borderColor: '#c8e6d5',
  },
  statCardPending: {
    backgroundColor: '#fef5eb',
    borderColor: '#f5d4a8',
  },
  statValue: {
    fontSize: scale(18),
    marginBottom: scale(4),
  },
  statLabel: {
    fontSize: scale(9),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    marginBottom: scale(4),
    textTransform: 'uppercase',
  },
  statCount: {
    fontSize: scale(18),
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Georgia',
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(16),
  },
  section: {
    marginTop: scale(16),
    marginBottom: scale(16),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(10),
  },
  sectionTitle: {
    fontSize: scale(13),
    fontFamily: 'Georgia',
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  taskCount: {
    fontSize: scale(13),
    fontWeight: '700',
    color: COLORS.accent,
    fontFamily: 'Georgia',
  },
  collapseIcon: {
    fontSize: scale(12),
    color: COLORS.textSecondary,
  },
  collapseIconOpen: {
    transform: [{ rotate: '90deg' }],
  },
  taskItem: {
    marginBottom: scale(8),
  },
  tasksList: {
    gap: scale(0),
  },
  upcomingContent: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: scale(8),
    padding: scale(12),
    gap: scale(12),
  },
  upcomingDateGroup: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: scale(10),
  },
  upcomingDateLabel: {
    fontSize: scale(11),
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Georgia',
    marginBottom: scale(8),
  },
  upcomingTasksList: {
    gap: scale(6),
  },
  upcomingTaskItem: {
    backgroundColor: COLORS.white,
    borderRadius: scale(6),
    paddingVertical: scale(8),
    paddingHorizontal: scale(10),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  upcomingTaskName: {
    fontSize: scale(11),
    color: COLORS.textPrimary,
    fontFamily: 'Georgia',
  },
  emptyState: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    paddingVertical: scale(24),
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: scale(32),
    marginBottom: scale(8),
  },
  emptyStateText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Georgia',
    marginBottom: scale(4),
  },
  emptyStateSubtext: {
    fontSize: scale(12),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  newOrderButton: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: scale(8),
    paddingVertical: scale(12),
    alignItems: 'center',
    marginTop: scale(16),
    marginBottom: scale(16),
  },
  newOrderButtonText: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'monospace',
  },
});

export default DashboardScreen;
