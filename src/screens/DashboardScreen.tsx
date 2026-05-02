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
import {
  responsiveSpacing,
  scale,
} from '../utils/responsive';
import {
  sortTasksByUrgency,
  enrichTaskWithUrgency,
} from '../utils/taskUrgency';
import TaskCheckboxItem from '../components/TaskCheckboxItem';
import CreateOrderModal from '../components/CreateOrderModal';
import { Order } from '../types';

type DashboardScreenProps = NativeStackScreenProps<any, 'Dashboard'>;

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { state: tasksState, fetchTasksToday } = useTasks();
  const { state: ordersState, createOrder } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [completingTaskIds, setCompletingTaskIds] = useState<Set<string>>(
    new Set()
  );
  const [localTasks, setLocalTasks] = useState(tasksState.tasks);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [localStats, setLocalStats] = useState({
    orders: 0,
    pending: 0,
    done: 0,
  });

  useEffect(() => {
    fetchTasksToday();
  }, []);

  // Sync local state with global state
  useEffect(() => {
    setLocalTasks(tasksState.tasks);
    const doneCount = tasksState.tasks.filter(
      (t) => t.status === 'completed'
    ).length;
    const pendingCount = tasksState.tasks.filter(
      (t) => t.status !== 'completed'
    ).length;
    setLocalStats((prev) => ({
      ...prev,
      pending: pendingCount,
      done: doneCount,
      orders: ordersState.orders.length,
    }));
  }, [tasksState.tasks, ordersState.orders]);

  const handleCreateOrderPress = () => {
    setShowCreateOrderModal(true);
  };

  const handleCreateOrder = async (orderData: any) => {
    setCreatingOrder(true);
    try {
      const newOrder = await createOrder(orderData);
      setShowCreateOrderModal(false);
      
      // Show success message
      Alert.alert('✓ Order Created!', `${orderData.vendorName} has been added.`, [
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
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTasksToday();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCheckboxPress = async (taskId: string) => {
    const task = localTasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistic update
    setCompletingTaskIds((prev) => new Set(prev).add(taskId));
    setLocalTasks((prev) => prev.filter((t) => t.id !== taskId));
    setLocalStats((prev) => ({
      ...prev,
      pending: Math.max(0, prev.pending - 1),
      done: prev.done + 1,
    }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCompletingTaskIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    } catch (error) {
      setLocalTasks((prev) => [...prev, task]);
      setLocalStats((prev) => ({
        ...prev,
        pending: prev.pending + 1,
        done: Math.max(0, prev.done - 1),
      }));
      setCompletingTaskIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleTaskPress = (taskId: string) => {
    console.log('Task pressed:', taskId);
  };

  const tasksToday = sortTasksByUrgency(
    localTasks.filter((task) => task.status !== 'completed')
  ).map(enrichTaskWithUrgency);

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = `${dayName}, ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;

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

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardOrders]}>
            <Text style={styles.statValue}>{localStats.orders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={[styles.statCard, styles.statCardPending]}>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>
              {localStats.pending}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, styles.statCardDone]}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              {localStats.done}
            </Text>
            <Text style={styles.statLabel}>Done</Text>
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
              <Text style={styles.taskCount}>{tasksToday.length} tasks</Text>
            </View>

            {tasksToday.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tasks today</Text>
              </View>
            ) : (
              <View style={styles.tasksList}>
                {tasksToday.map((task) => (
                  <TaskCheckboxItem
                    key={task.id}
                    task={task}
                    onPress={handleTaskPress}
                    onCheckboxPress={handleCheckboxPress}
                    isCompleting={completingTaskIds.has(task.id)}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Upcoming Tasks Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
              <Text style={styles.collapseIcon}>▾</Text>
            </View>
            <View style={styles.upcomingEmpty}>
              <Text style={styles.upcomingEmptyText}>No upcoming tasks</Text>
            </View>
          </View>

          {/* New Order Button */}
          <TouchableOpacity
            style={styles.newOrderButton}
            onPress={handleCreateOrderPress}
          >
            <Text style={styles.newOrderButtonText}>+ New Order</Text>
          </TouchableOpacity>
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
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
    gap: scale(8),
    backgroundColor: COLORS.backgroundSecondary,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 3,
    paddingVertical: scale(10),
    paddingHorizontal: scale(8),
    alignItems: 'center',
  },
  statCardOrders: {
    borderTopColor: COLORS.accent,
  },
  statCardPending: {
    borderTopColor: COLORS.warning,
  },
  statCardDone: {
    borderTopColor: COLORS.success,
  },
  statValue: {
    fontSize: scale(22),
    fontWeight: '700',
    color: COLORS.accent,
    fontFamily: 'Georgia',
  },
  statLabel: {
    fontSize: scale(9),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    letterSpacing: 0.8,
    marginTop: scale(2),
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(16),
  },
  section: {
    marginTop: scale(14),
    marginBottom: scale(14),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  sectionTitle: {
    fontSize: scale(10),
    fontFamily: 'monospace',
    letterSpacing: 1.2,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  taskCount: {
    fontSize: scale(10),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  collapseIcon: {
    fontSize: scale(10),
    color: COLORS.textSecondary,
  },
  tasksList: {
    gap: scale(6),
  },
  emptyContainer: {
    paddingVertical: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: scale(11),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  upcomingEmpty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ddd9d3',
    borderRadius: scale(8),
    paddingVertical: scale(18),
    backgroundColor: COLORS.backgroundTertiary,
    alignItems: 'center',
  },
  upcomingEmptyText: {
    fontSize: scale(11),
    color: COLORS.textTertiary,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  newOrderButton: {
    width: '100%',
    backgroundColor: COLORS.textPrimary,
    borderRadius: scale(8),
    paddingVertical: scale(13),
    marginBottom: scale(20),
    alignItems: 'center',
  },
  newOrderButtonText: {
    color: COLORS.white,
    fontSize: scale(11),
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default DashboardScreen;
