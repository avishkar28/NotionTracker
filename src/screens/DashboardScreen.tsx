import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Animated,
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
  responsiveDimensions,
} from '../utils/responsive';
import {
  sortTasksByUrgency,
  enrichTaskWithUrgency,
  TaskWithUrgency,
} from '../utils/taskUrgency';
import TaskCheckboxItem from '../components/TaskCheckboxItem';
import UpcomingTasksPanel from '../components/UpcomingTasksPanel';

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
      setLocalTasks((prev) => [...prev, task].sort((a, b) => {
        const urgencyA = enrichTaskWithUrgency(a);
        const urgencyB = enrichTaskWithUrgency(b);
        return urgencyA.urgencyLevel.localeCompare(urgencyB.urgencyLevel);
      }));
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

  const todaysPendingTasks = sortTasksByUrgency(
    localTasks
      .filter((task) => task.status !== 'completed')
      .map(enrichTaskWithUrgency)
  );

  const upcomingTasks = localTasks.filter(
    (task) =>
      task.status !== 'completed' &&
      new Date(task.dueDate).getTime() > new Date().getTime()
  );

  return (
    <View style={styles.container}>
      {/* Stats Section - Fixed Top */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>✅</Text>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{localStats.completedToday}</Text>
            <Text style={styles.statLabel}>Completed Today</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statIcon}>☐</Text>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{localStats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Main Content - Scrollable */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Tasks Panel - Half Screen */}
        <View style={styles.todaysTasksPanel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>📝 Today's Tasks</Text>
            <Text style={styles.taskCount}>{todaysPendingTasks.length}</Text>
          </View>

          {todaysPendingTasks.length > 0 ? (
            <View style={styles.tasksList}>
              {todaysPendingTasks.map((task) => (
                <TaskCheckboxItem
                  key={task.id}
                  task={task}
                  onPress={handleTaskPress}
                  onCheckboxPress={handleCheckboxPress}
                  isCompleting={completingTaskIds.has(task.id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyText}>Great! No tasks for today</Text>
              <TouchableOpacity style={styles.createButton}>
                <Text style={styles.createButtonText}>+ Create New Task</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Upcoming Tasks Panel */}
        <UpcomingTasksPanel
          tasks={upcomingTasks}
          onTaskPress={handleTaskPress}
        />
      </ScrollView>
    </View>
  );
};

const windowHeight = require('react-native').Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Stats Section - Fixed at top
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#fbfbfa',
    paddingHorizontal: responsiveSpacing.lg,
    paddingVertical: responsiveSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: scale(80),
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: scale(24),
    marginRight: responsiveSpacing.md,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: responsiveFontSize.h2,
    fontWeight: '700',
    color: COLORS.accent,
  },
  statLabel: {
    fontSize: responsiveFontSize.small,
    color: COLORS.textSecondary,
    marginTop: scale(2),
  },
  statDivider: {
    width: 1,
    height: scale(50),
    backgroundColor: COLORS.border,
    marginHorizontal: responsiveSpacing.md,
  },
  // Main scrollable content
  content: {
    flex: 1,
  },
  // Today's Tasks Panel
  todaysTasksPanel: {
    backgroundColor: COLORS.white,
    minHeight: windowHeight * 0.5,
    maxHeight: windowHeight * 0.6,
    paddingHorizontal: responsiveSpacing.lg,
    paddingVertical: responsiveSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing.md,
  },
  panelTitle: {
    fontSize: responsiveFontSize.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  taskCount: {
    fontSize: responsiveFontSize.small,
    backgroundColor: COLORS.accent,
    color: COLORS.white,
    paddingHorizontal: responsiveSpacing.sm,
    paddingVertical: scale(2),
    borderRadius: scale(12),
    fontWeight: '600',
  },
  tasksList: {
    gap: responsiveSpacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveSpacing.xxl,
  },
  emptyEmoji: {
    fontSize: scale(48),
    marginBottom: responsiveSpacing.md,
  },
  emptyText: {
    fontSize: responsiveFontSize.body,
    color: COLORS.textSecondary,
    marginBottom: responsiveSpacing.lg,
  },
  createButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: responsiveSpacing.lg,
    paddingVertical: responsiveSpacing.md,
    borderRadius: getResponsiveBorderRadius(),
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: responsiveFontSize.small,
    fontWeight: '600',
  },
});

export default DashboardScreen;
