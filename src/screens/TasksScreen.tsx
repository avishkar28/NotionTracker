import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { useTasks } from '../context/TasksContext';
import { Task } from '../types';

const TasksScreen: React.FC = () => {
  const { state: tasksState, fetchTasks } = useTasks();
  const [refreshing, setRefreshing] = React.useState(false);
  const [filter, setFilter] = React.useState<
    'all' | 'pending' | 'completed' | 'overdue'
  >('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTasks();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTasks = tasksState.tasks.filter((task) => {
    switch (filter) {
      case 'pending':
        return task.status === 'pending';
      case 'completed':
        return task.status === 'completed';
      case 'overdue':
        return task.dueDate < new Date().toISOString();
      default:
        return true;
    }
  });

  const getStatusEmoji = (task: Task) => {
    switch (task.status) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '🔄';
      case 'pending':
        return '☐';
      default:
        return '⏰';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
      </View>

      <View style={styles.filterContainer}>
        {(['all', 'pending', 'completed', 'overdue'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              filter === f && styles.filterChipActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f && styles.filterChipTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Text style={styles.statusEmoji}>{getStatusEmoji(item)}</Text>
              <View style={styles.taskInfo}>
                <Text style={styles.taskName}>{item.name}</Text>
                <Text style={styles.orderName}>{item.orderName}</Text>
              </View>
            </View>
            <Text style={styles.dueDate}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tasks in this category</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  taskCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  statusEmoji: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
  },
  orderName: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  dueDate: {
    fontSize: TYPOGRAPHY.fontSize.small,
    color: COLORS.textTertiary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.textTertiary,
  },
});

export default TasksScreen;
