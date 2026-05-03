import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Vibration,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import { scale } from '../utils/responsive';
import { useTasks } from '../context/TasksContext';
import { Task } from '../types';

type TaskDetailsScreenProps = NativeStackScreenProps<any, 'TaskDetails'>;

const TaskDetailsScreen: React.FC<TaskDetailsScreenProps> = ({ route, navigation }) => {
  const { taskId } = route.params || {};
  const { state: tasksState, updateTaskStatus } = useTasks();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (taskId) {
      const foundTask = tasksState.tasks.find((t) => t.id === taskId);
      if (foundTask) {
        // Simulate API loading
        setTimeout(() => {
          setTask(foundTask);
          setLoading(false);
        }, 400);
      }
    }
  }, [taskId, tasksState.tasks]);

  useEffect(() => {
    if (task) {
      navigation.setOptions({
        title: task.name,
      });
    }
  }, [task, navigation]);

  const getTaskTimeRemaining = () => {
    if (!task) return '';
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const diff = dueDate.getTime() - now.getTime();

    if (diff < 0) {
      const days = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((Math.abs(diff) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 0) return `${days}d ${hours}h overdue`;
      return `${hours}h overdue`;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Due today';
  };

  const getTimeRemainColor = () => {
    if (!task) return COLORS.textSecondary;
    const now = new Date();
    const dueDate = new Date(task.dueDate);

    if (dueDate < now) return '#cb2431'; // Overdue - red
    const hoursLeft = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursLeft < 2) return '#e9973f'; // Urgent - orange
    return '#37a169'; // Normal - green
  };

  const getStatusColor = () => {
    switch (task?.status) {
      case 'completed':
        return COLORS.success;
      case 'in-progress':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (task?.status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      default:
        return 'Pending';
    }
  };

  const handleStatusChange = async () => {
    if (!task) return;

    try {
      setUpdatingStatus(true);

      // Cycle to next status
      let nextStatus: 'pending' | 'in-progress' | 'completed';
      switch (task.status) {
        case 'pending':
          nextStatus = 'in-progress';
          break;
        case 'in-progress':
          nextStatus = 'completed';
          break;
        default:
          nextStatus = 'pending';
      }

      // Haptic feedback
      if (nextStatus === 'completed') {
        Vibration.vibrate(100);
      }

      await updateTaskStatus(task.id, nextStatus);

      if (nextStatus === 'completed') {
        Alert.alert('✓ Task completed!', 'Great work! Task marked as complete.', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Status updated', `Task is now ${nextStatus}.`, [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: () => {
          // Delete task
          navigation.goBack();
        },
        style: 'destructive',
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Task not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Header */}
        <View style={styles.headerCard}>
          <Text style={styles.taskName}>{task.name}</Text>
          <Text style={styles.orderName}>{task.orderName || 'No Order'}</Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text
              style={[
                styles.statusValue,
                { color: getStatusColor() },
              ]}
            >
              {getStatusLabel()}
            </Text>
          </View>

          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor() },
              ]}
            />
            <Text style={styles.statusMessage}>
              {task.status === 'completed'
                ? 'Task completed successfully'
                : task.status === 'in-progress'
                ? 'Work in progress'
                : 'Waiting to be started'}
            </Text>
          </View>
        </View>

        {/* Dates & Time Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Assigned Date</Text>
            <Text style={styles.detailValue}>
              {new Date(task.assignedDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time Remaining</Text>
            <Text
              style={[
                styles.detailValue,
                { color: getTimeRemainColor() },
              ]}
            >
              {getTaskTimeRemaining()}
            </Text>
          </View>
        </View>

        {/* Completion Date (if completed) */}
        {task.status === 'completed' && task.completedAt && (
          <View style={styles.completionCard}>
            <Text style={styles.completionLabel}>Completed</Text>
            <Text style={styles.completionDate}>
              {new Date(task.completedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {task.status !== 'completed' && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.completeButton,
                updatingStatus && styles.buttonDisabled,
              ]}
              onPress={handleStatusChange}
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.completeButtonText}>
                  {task.status === 'pending' ? '⟳ Start Task' : '✓ Complete Task'}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {task.status === 'completed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.revertButton]}
              onPress={handleStatusChange}
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <ActivityIndicator size="small" color={COLORS.warning} />
              ) : (
                <Text style={styles.revertButtonText}>↶ Mark as Pending</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>🗑 Delete Task</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: scale(20) }} />
      </ScrollView>
    </View>
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
  taskName: {
    fontSize: scale(20),
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Georgia',
    marginBottom: scale(4),
  },
  orderName: {
    fontSize: scale(13),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  statusCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: scale(16),
    marginBottom: scale(16),
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  statusLabel: {
    fontSize: scale(10),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusValue: {
    fontSize: scale(16),
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  statusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  statusMessage: {
    fontSize: scale(12),
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    flex: 1,
  },
  detailsCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: scale(16),
    marginBottom: scale(16),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(8),
  },
  detailLabel: {
    fontSize: scale(11),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: scale(13),
    color: COLORS.textPrimary,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: scale(8),
  },
  completionCard: {
    backgroundColor: '#f0f7f3',
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#c8e6d5',
    padding: scale(16),
    marginBottom: scale(16),
    alignItems: 'center',
  },
  completionLabel: {
    fontSize: scale(10),
    color: COLORS.success,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: scale(4),
  },
  completionDate: {
    fontSize: scale(13),
    color: COLORS.success,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  actionsContainer: {
    gap: scale(10),
    marginTop: scale(20),
  },
  actionButton: {
    borderRadius: scale(8),
    paddingVertical: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  completeButtonText: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'monospace',
  },
  revertButton: {
    backgroundColor: COLORS.warning,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  revertButtonText: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'monospace',
  },
  deleteButton: {
    backgroundColor: '#fef0f0',
    borderWidth: 1.5,
    borderColor: '#fbc8cb',
  },
  deleteButtonText: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.danger,
    fontFamily: 'monospace',
  },
  buttonDisabled: {
    opacity: 0.6,
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

export default TaskDetailsScreen;
