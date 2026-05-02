import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
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

const DashboardScreen: React.FC = () => {
  const { state: tasksState, fetchTasksToday } = useTasks();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchTasksToday();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTasksToday();
    } finally {
      setRefreshing(false);
    }
  };

  const tasksToday = tasksState.tasks.filter(
    (task) => task.status !== 'completed'
  );
  const completedToday = tasksState.tasks.filter(
    (task) => task.status === 'completed'
  ).length;

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
          <View style={styles.taskCard}>
            <Text style={styles.taskName}>{item.name}</Text>
            <Text style={styles.taskOrder}>{item.orderName}</Text>
          </View>
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
          <Text style={styles.statValue}>{completedToday}</Text>
          <Text style={styles.statLabel}>Completed Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{tasksToday.length}</Text>
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
    fontWeight: TYPOGRAPHY.fontWeight.bold,
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
  taskCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: getResponsiveBorderRadius(),
    padding: responsiveSpacing.lg,
    marginBottom: responsiveSpacing.md,
    borderLeftWidth: scale(4),
    borderLeftColor: COLORS.accent,
  },
  taskName: {
    fontSize: responsiveFontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
  },
  taskOrder: {
    fontSize: responsiveFontSize.small,
    color: COLORS.textSecondary,
    marginTop: responsiveSpacing.xs,
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
    flex: responsiveDimensions.isSmallScreen ? 1 : 0,
    minWidth: responsiveDimensions.isSmallScreen ? 0 : responsiveDimensions.screenWidth / 2 - responsiveSpacing.lg - responsiveSpacing.md / 2,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: getResponsiveBorderRadius(),
    padding: responsiveSpacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: responsiveFontSize.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
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
