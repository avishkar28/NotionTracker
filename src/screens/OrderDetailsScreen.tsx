import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import { scale } from '../utils/responsive';
import { useOrders } from '../context/OrdersContext';
import { useTasks } from '../context/TasksContext';
import { Order, Task } from '../types';
import CreateTaskModal from '../components/CreateTaskModal';

type OrderDetailsScreenProps = NativeStackScreenProps<
  any,
  'OrderDetails'
>;

const OrderDetailsScreen: React.FC<OrderDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { orderId } = route.params || {};
  const { state: ordersState } = useOrders();
  const { state: tasksState, createTask } = useTasks();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [orderTasks, setOrderTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (orderId) {
      // Find order from context
      const foundOrder = ordersState.orders.find((o) => o.id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
    setLoading(false);
  }, [orderId, ordersState.orders]);

  // Filter tasks for this order
  useEffect(() => {
    const tasksForOrder = tasksState.tasks.filter((t) => t.orderId === orderId);
    setOrderTasks(tasksForOrder);
  }, [tasksState.tasks, orderId]);

  useEffect(() => {
    if (order) {
      navigation.setOptions({
        title: order.vendorName,
      });
    }
  }, [order, navigation]);

  const handleCreateTask = async (taskData: any) => {
    try {
      await createTask(taskData);
      setShowCreateTaskModal(false);
      
      Alert.alert(
        '✓ Task Created!',
        `"${taskData.name}" has been added to this order.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return COLORS.danger;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          backgroundColor: '#fef0f0',
          borderColor: '#fbc8cb',
        };
      case 'medium':
        return {
          backgroundColor: '#fef5eb',
          borderColor: '#f5d4a8',
        };
      case 'low':
        return {
          backgroundColor: '#f0f7f3',
          borderColor: '#c8e6d5',
        };
      default:
        return {
          backgroundColor: COLORS.backgroundTertiary,
          borderColor: COLORS.border,
        };
    }
  };

  const deadlineDate = new Date(order.deadline);
  const today = new Date();
  const daysUntil = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const deadlineText =
    daysUntil < 0
      ? `${Math.abs(daysUntil)} days overdue`
      : daysUntil === 0
      ? 'Due today'
      : `${daysUntil} days left`;

  const priorityBadgeStyle = getPriorityBadgeStyle(order.priority);
  const completedCount = orderTasks.filter((t) => t.status === 'completed').length;
  const totalCount = orderTasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <>
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          {/* Order Header */}
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View style={styles.headerInfo}>
                <Text style={styles.vendorName}>{order.vendorName}</Text>
                <Text style={styles.description}>{order.description}</Text>
              </View>
            </View>

            {/* Deadline & Priority Row */}
            <View style={styles.detailsRow}>
              <View style={styles.deadlineBox}>
                <Text style={styles.detailLabel}>Deadline</Text>
                <Text style={styles.detailValue}>
                  {deadlineDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={styles.deadlineStatus}>{deadlineText}</Text>
              </View>

              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor: priorityBadgeStyle.backgroundColor,
                    borderColor: priorityBadgeStyle.borderColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    { color: getPriorityColor(order.priority) },
                  ]}
                >
                  {order.priority.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressValue}>
                  {completedCount}/{totalCount}
                </Text>
                <Text style={styles.progressLabel}>Tasks Completed</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercentage}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Tasks Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tasks</Text>
              <TouchableOpacity
                style={styles.addTaskButton}
                onPress={() => setShowCreateTaskModal(true)}
              >
                <Text style={styles.addTaskButtonText}>+ Add Task</Text>
              </TouchableOpacity>
            </View>

            {totalCount === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📋</Text>
                <Text style={styles.emptyStateText}>No tasks yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create tasks to track work for this order
                </Text>
              </View>
            ) : (
              <View style={styles.taskList}>
                {orderTasks.map((task) => (
                  <View key={task.id} style={styles.taskItem}>
                    <View style={styles.taskCheckbox}>
                      <View
                        style={[
                          styles.checkbox,
                          task.status === 'completed' && styles.checkboxCompleted,
                        ]}
                      >
                        {task.status === 'completed' && (
                          <Text style={styles.checkboxText}>✓</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.taskContent}>
                      <Text
                        style={[
                          styles.taskName,
                          task.status === 'completed' && styles.taskNameCompleted,
                        ]}
                      >
                        {task.name}
                      </Text>
                      <Text style={styles.taskDate}>
                        Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.taskStatus,
                        {
                          backgroundColor:
                            task.status === 'completed'
                              ? '#f0f7f3'
                              : task.status === 'in-progress'
                              ? '#fef5eb'
                              : '#ffffff',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.taskStatusText,
                          {
                            color:
                              task.status === 'completed'
                                ? COLORS.success
                                : task.status === 'in-progress'
                                ? COLORS.warning
                                : COLORS.textSecondary,
                          },
                        ]}
                      >
                        {task.status === 'completed'
                          ? '✓ Done'
                          : task.status === 'in-progress'
                          ? '⟳ In Progress'
                          : '○ Pending'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                'Delete Order',
                'Are you sure you want to delete this order?',
                [
                  { text: 'Cancel', onPress: () => {} },
                  {
                    text: 'Delete',
                    onPress: () => {
                      navigation.goBack();
                    },
                    style: 'destructive',
                  },
                ]
              );
            }}
          >
            <Text style={styles.deleteButtonText}>Delete Order</Text>
          </TouchableOpacity>

          <View style={{ height: scale(20) }} />
        </ScrollView>
      </View>

      {/* Create Task Modal */}
      <CreateTaskModal
        visible={showCreateTaskModal}
        orderId={orderId}
        orderName={order.vendorName}
        onClose={() => setShowCreateTaskModal(false)}
        onCreateTask={handleCreateTask}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingVertical: scale(16),
  },
  headerCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: scale(16),
    marginBottom: scale(16),
  },
  headerTop: {
    marginBottom: scale(12),
  },
  headerInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: scale(20),
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Georgia',
    marginBottom: scale(4),
  },
  description: {
    fontSize: scale(13),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: scale(12),
    alignItems: 'flex-start',
  },
  deadlineBox: {
    flex: 1,
    backgroundColor: '#f9f8f7',
    borderRadius: scale(6),
    padding: scale(10),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailLabel: {
    fontSize: scale(10),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: scale(2),
  },
  detailValue: {
    fontSize: scale(14),
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Georgia',
    marginBottom: scale(2),
  },
  deadlineStatus: {
    fontSize: scale(11),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  priorityBadge: {
    borderRadius: scale(6),
    borderWidth: 1,
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: scale(80),
  },
  priorityText: {
    fontSize: scale(12),
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: scale(16),
  },
  sectionTitle: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Georgia',
    marginBottom: scale(10),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  progressCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: scale(12),
  },
  progressInfo: {
    marginBottom: scale(10),
  },
  progressValue: {
    fontSize: scale(18),
    fontWeight: '700',
    color: COLORS.accent,
    fontFamily: 'Georgia',
  },
  progressLabel: {
    fontSize: scale(11),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    marginTop: scale(2),
  },
  progressBar: {
    height: scale(8),
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: scale(4),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: scale(4),
  },
  addTaskButton: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: scale(6),
    paddingHorizontal: scale(10),
    paddingVertical: scale(8),
  },
  addTaskButtonText: {
    fontSize: scale(11),
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'monospace',
  },
  taskList: {
    gap: scale(8),
  },
  taskItem: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(12),
    gap: scale(10),
  },
  taskCheckbox: {
    justifyContent: 'center',
  },
  checkbox: {
    width: scale(18),
    height: scale(18),
    borderRadius: scale(3),
    borderWidth: 1.5,
    borderColor: '#ddd9d3',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkboxText: {
    fontSize: scale(11),
    color: COLORS.white,
    fontWeight: '700',
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: scale(2),
    fontFamily: 'Georgia',
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  taskDate: {
    fontSize: scale(11),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  taskStatus: {
    borderRadius: scale(4),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskStatusText: {
    fontSize: scale(10),
    fontWeight: '600',
    fontFamily: 'monospace',
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
  deleteButton: {
    backgroundColor: '#fef0f0',
    borderRadius: scale(8),
    borderWidth: 1.5,
    borderColor: '#fbc8cb',
    paddingVertical: scale(12),
    alignItems: 'center',
    marginTop: scale(20),
  },
  deleteButtonText: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.danger,
    fontFamily: 'monospace',
  },
  errorText: {
    fontSize: scale(16),
    color: COLORS.textPrimary,
    marginBottom: scale(16),
  },
  backButton: {
    backgroundColor: COLORS.accent,
    borderRadius: scale(8),
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
  },
  backButtonText: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'monospace',
  },
});

export default OrderDetailsScreen;
