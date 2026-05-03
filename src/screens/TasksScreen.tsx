import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Vibration,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import { scale } from '../utils/responsive';
import { useTasks } from '../context/TasksContext';
import { Task } from '../types';
import SkeletonLoader from '../components/SkeletonLoader';

type TasksScreenProps = NativeStackScreenProps<any, 'Tasks'>;

interface TasksScreenStats {
  all: number;
  pending: number;
  completed: number;
  overdue: number;
}

const TasksScreen: React.FC<TasksScreenProps> = ({ navigation }) => {
  const { state: tasksState, fetchTasks } = useTasks();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [stats, setStats] = useState<TasksScreenStats>({
    all: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
  });

  // Calculate stats
  useEffect(() => {
    const now = new Date();
    const pending = tasksState.tasks.filter((t) => t.status === 'pending' || t.status === 'in-progress').length;
    const completed = tasksState.tasks.filter((t) => t.status === 'completed').length;
    const overdue = tasksState.tasks.filter((t) => new Date(t.dueDate) < now && t.status !== 'completed').length;

    setStats({
      all: tasksState.tasks.length,
      pending,
      completed,
      overdue,
    });
  }, [tasksState.tasks]);

  // Initial load
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        await fetchTasks();
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await fetchTasks();
    } finally {
      setRefreshing(false);
    }
  };

  const getFilteredAndSearchedTasks = () => {
    let filtered = tasksState.tasks;

    // Apply status filter
    switch (activeFilter) {
      case 'pending':
        filtered = filtered.filter((t) => t.status === 'pending' || t.status === 'in-progress');
        break;
      case 'completed':
        filtered = filtered.filter((t) => t.status === 'completed');
        break;
      case 'overdue':
        const now = new Date();
        filtered = filtered.filter((t) => new Date(t.dueDate) < now && t.status !== 'completed');
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          (t.orderName && t.orderName.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const getTaskCategory = (task: Task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate < today) return 'Overdue';
    if (taskDate.getTime() === today.getTime()) return 'Today';
    if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return 'Upcoming';
  };

  const getUrgencyColor = (task: Task) => {
    const now = new Date();
    if (new Date(task.dueDate) < now && task.status !== 'completed') return '#cb2431'; // Overdue - red
    if (task.dueDate) {
      const hoursLeft = (new Date(task.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursLeft < 2) return '#e9973f'; // Urgent - orange
    }
    return '#37a169'; // Normal - green
  };

  const filteredTasks = getFilteredAndSearchedTasks();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Tasks</Text>
            <SkeletonLoader count={1} height={scale(12)} width={scale(120)} />
          </View>
        </View>

        <View style={styles.searchContainer}>
          <SkeletonLoader count={1} height={scale(36)} width="100%" />
        </View>

        <View style={styles.filterContainer}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonLoader key={i} count={1} height={scale(28)} width={scale(70)} />
          ))}
        </View>

        <View style={styles.content}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonLoader key={i} count={1} height={scale(60)} width="100%" />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.subtitle}>
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
          />
        }
      >
        {/* Search Box */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Search tasks or orders..."
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          {(
            [
              { key: 'all', label: 'All', count: stats.all },
              { key: 'pending', label: 'Pending', count: stats.pending },
              { key: 'completed', label: 'Completed', count: stats.completed },
              { key: 'overdue', label: 'Overdue', count: stats.overdue },
            ] as const
          ).map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                activeFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No tasks found' : `No ${activeFilter} tasks`}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery
                ? 'Try a different search'
                : 'Create a task to get started'}
            </Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {filteredTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskItem}
                onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
                activeOpacity={0.7}
              >
                <View style={styles.taskItemContent}>
                  {/* Checkbox */}
                  <View
                    style={[
                      styles.checkbox,
                      task.status === 'in-progress' && styles.checkboxInProgress,
                      task.status === 'completed' && styles.checkboxCompleted,
                    ]}
                  >
                    {task.status === 'in-progress' && (
                      <Text style={styles.checkboxIcon}>⟳</Text>
                    )}
                    {task.status === 'completed' && (
                      <Text style={styles.checkboxIcon}>✓</Text>
                    )}
                  </View>

                  {/* Task Info */}
                  <View style={styles.taskInfo}>
                    <View style={styles.taskNameRow}>
                      <Text
                        style={[
                          styles.taskName,
                          task.status === 'completed' && styles.taskNameCompleted,
                        ]}
                      >
                        {task.name}
                      </Text>
                      <View
                        style={[
                          styles.urgencyBadge,
                          { backgroundColor: getUrgencyColor(task) },
                        ]}
                      >
                        <Text style={styles.urgencyBadgeText}>●</Text>
                      </View>
                    </View>

                    {/* Order Name */}
                    <Text style={styles.orderName}>{task.orderName || 'No Order'}</Text>

                    {/* Due Date & Category */}
                    <View style={styles.taskMeta}>
                      <Text style={styles.taskCategory}>{getTaskCategory(task)}</Text>
                      <Text style={styles.taskDueDate}>
                        Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
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
                        styles.statusBadgeText,
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
                        ? '✓'
                        : task.status === 'in-progress'
                        ? '⟳'
                        : '○'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
  header: {
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
    marginBottom: scale(4),
  },
  subtitle: {
    fontSize: scale(10),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(16),
  },
  searchContainer: {
    paddingVertical: scale(12),
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    fontSize: scale(13),
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: scale(8),
    paddingVertical: scale(10),
    marginBottom: scale(12),
  },
  filterChip: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: scale(6),
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
  },
  filterChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterChipText: {
    fontSize: scale(10),
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  tasksList: {
    gap: scale(8),
    paddingVertical: scale(8),
  },
  taskItem: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: scale(8),
    padding: scale(12),
    marginBottom: scale(4),
  },
  taskItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(10),
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
    marginTop: scale(1),
    flexShrink: 0,
  },
  checkboxInProgress: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkboxIcon: {
    fontSize: scale(11),
    color: COLORS.white,
    fontWeight: '700',
  },
  taskInfo: {
    flex: 1,
  },
  taskNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginBottom: scale(2),
  },
  taskName: {
    fontSize: scale(12),
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Georgia',
    flex: 1,
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  urgencyBadge: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    flexShrink: 0,
  },
  urgencyBadgeText: {
    fontSize: scale(6),
    color: 'transparent',
  },
  orderName: {
    fontSize: scale(10),
    color: COLORS.textTertiary,
    fontFamily: 'monospace',
    marginBottom: scale(4),
  },
  taskMeta: {
    flexDirection: 'row',
    gap: scale(8),
    alignItems: 'center',
  },
  taskCategory: {
    fontSize: scale(9),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  taskDueDate: {
    fontSize: scale(9),
    color: COLORS.textTertiary,
    fontFamily: 'monospace',
  },
  statusBadge: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(4),
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  statusBadgeText: {
    fontSize: scale(12),
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: scale(40),
  },
  emptyStateIcon: {
    fontSize: scale(48),
    marginBottom: scale(12),
  },
  emptyStateText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Georgia',
    marginBottom: scale(6),
  },
  emptyStateSubtext: {
    fontSize: scale(12),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
});

export default TasksScreen;
