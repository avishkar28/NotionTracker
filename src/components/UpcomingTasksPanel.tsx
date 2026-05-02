import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  Animated,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { responsiveFontSize, responsiveSpacing, scale } from '../utils/responsive';
import { Task } from '../types';

interface TaskGroup {
  title: string;
  data: Task[];
}

interface UpcomingTasksPanelProps {
  tasks: Task[];
  onTaskPress: (taskId: string) => void;
}

const UpcomingTasksPanel: React.FC<UpcomingTasksPanelProps> = ({ tasks, onTaskPress }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const animHeight = React.useRef(new Animated.Value(1)).current;

  const groupTasksByDate = (): TaskGroup[] => {
    const groups: { [key: string]: Task[] } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach((task) => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      let groupKey = '';
      if (diffDays === 1) groupKey = 'Tomorrow';
      else if (diffDays <= 7) groupKey = taskDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      else groupKey = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(task);
    });

    return Object.entries(groups).map(([title, data]) => ({
      title,
      data,
    }));
  };

  const toggleExpanded = () => {
    Animated.timing(animHeight, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const taskGroups = groupTasksByDate();

  if (taskGroups.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>📅 Upcoming Tasks</Text>
        <Text style={styles.chevron}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <SectionList
          sections={taskGroups}
          keyExtractor={(item, index) => item.id + index}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.taskItem}
              onPress={() => onTaskPress(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.taskArrow}>→</Text>
              <View style={styles.taskContent}>
                <Text style={styles.taskName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.taskMeta} numberOfLines={1}>
                  {item.orderName}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          scrollEnabled={false}
          nestedScrollEnabled={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing.lg,
    paddingVertical: responsiveSpacing.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: responsiveFontSize.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  chevron: {
    fontSize: responsiveFontSize.body,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    paddingHorizontal: responsiveSpacing.lg,
    paddingTop: responsiveSpacing.md,
    paddingBottom: responsiveSpacing.sm,
  },
  sectionTitle: {
    fontSize: responsiveFontSize.small,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing.lg,
    paddingVertical: responsiveSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  taskArrow: {
    fontSize: responsiveFontSize.body,
    marginRight: responsiveSpacing.md,
    color: COLORS.accent,
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    fontSize: responsiveFontSize.small,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: scale(2),
  },
  taskMeta: {
    fontSize: scale(11),
    color: COLORS.textTertiary,
  },
});

export default UpcomingTasksPanel;
