import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { useTasks } from '../context/TasksContext';
import {
  responsiveFontSize,
  responsiveSpacing,
  scale,
  getResponsiveBorderRadius,
} from '../utils/responsive';
import {
  sortTasksByUrgency,
  enrichTaskWithUrgency,
  TaskWithUrgency,
} from '../utils/taskUrgency';
import TaskCheckboxItem from '../components/TaskCheckboxItem';

const DashboardScreen: React.FC = () => {
  const { state: tasksState, fetchTasksToday } = useTasks();
  const [refreshing, setRefreshing] = useState(false);
  const [completingTaskIds, setCompletingTaskIds] = useState<Set<string>>(
    new Set()
  );
  const [localTasks, setLocalTasks] = useState(tasksState.tasks);
  const [localStats, setLocalStats] = useState({
    completedToday: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchTasksToday();
  }, []);

  // Sync local state with global state
  useEffect(() => {
    setLocalTasks(tasksState.tasks);
    const completedCount = tasksState.tasks.filter(
      (t) => t.status === 'completed'
    ).length;
    const pendingCount = tasksState.tasks.filter(
      (t) => t.status !== 'completed'
    ).length;
    setLocalStats({
      completedToday: completedCount,
      pending: pendingCount,
    });
  }, [tasksState.tasks]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTasksToday();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCheckboxPress = async (taskId: string) => {
    // Find the task
    const task = localTasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistic update - immediately remove from list
    setCompletingTaskIds((prev) => new Set(prev).add(taskId));
    setLocalTasks((prev) => prev.filter((t) => t.id !== taskId));
    setLocalStats((prev) => ({
      completedToday: prev.completedToday + 1,
      pending: Math.max(0, prev.pending - 1),
    }));

    // API call in background
    try {
      // Simulate API call - in production, this would be a real API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Success - task stays removed
      setCompletingTaskIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    } catch (error) {
      // Revert on error
      setLocalTasks((prev) => [...prev, task]);
      setLocalStats((prev) => ({
        completedToday: Math.max(0, prev.completedToday - 1),
        pending: prev.pending + 1,
      }));
      setCompletingTaskIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleTaskPress = (taskId: string) => {
    // Navigate to task detail (placeholder)
    console.log('Task pressed:', taskId);
  };

  const tasksToday = sortTasksByUrgency(
    localTasks.filter((task) => task.status !== 'completed')
  ).map(enrichTaskWithUrgency);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>

      <FlatList
        data={tasksToday}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
          />
        }
        renderItem={({ item }) => (
          <TaskCheckboxItem
            task={item}
            onPress={handleTaskPress}
            onCheckboxPress={handleCheckboxPress}
            isCompleting={completingTaskIds.has(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Great! No tasks today</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{localStats.completedToday}</Text>
          <Text style={styles.statLabel}>Completed Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{localStats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: responsiveSpacing.lg,
    paddingTop: responsiveSpacing.lg,
    paddingBottom: responsiveSpacing.md,
  },
  title: {
    fontSize: responsiveFontSize.h1,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  date: {
    fontSize: responsiveFontSize.small,
    color: COLORS.textSecondary,
    marginTop: responsiveSpacing.xs,
  },
  listContent: {
    paddingHorizontal: responsiveSpacing.lg,
    paddingVertical: responsiveSpacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: responsiveSpacing.xxl,
  },
  emptyText: {
    fontSize: responsiveFontSize.body,
    color: COLORS.textTertiary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: responsiveSpacing.lg,
    paddingBottom: responsiveSpacing.lg,
    gap: responsiveSpacing.md,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: scale(150),
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: getResponsiveBorderRadius(),
    padding: responsiveSpacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: responsiveFontSize.h2,
    fontWeight: '700',
    color: COLORS.accent,
  },
  statLabel: {
    fontSize: responsiveFontSize.small,
    color: COLORS.textSecondary,
    marginTop: responsiveSpacing.xs,
    textAlign: 'center',
  },
});

export default DashboardScreen;
