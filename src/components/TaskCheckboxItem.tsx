import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Animated,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { responsiveFontSize, responsiveSpacing, scale } from '../utils/responsive';
import { TaskWithUrgency } from '../utils/taskUrgency';

interface TaskCheckboxItemProps {
  task: TaskWithUrgency;
  onPress: (taskId: string) => void;
  onCheckboxPress: (taskId: string) => void;
  isCompleting?: boolean;
}

const TaskCheckboxItem: React.FC<TaskCheckboxItemProps> = ({
  task,
  onPress,
  onCheckboxPress,
  isCompleting = false,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleCheckboxPress = () => {
    // Haptic feedback
    Vibration.vibrate(50);

    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onCheckboxPress(task.id);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(task.id)}
      activeOpacity={0.7}
    >
      <View style={styles.checkboxContainer}>
        <Animated.View style={[styles.checkbox, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            style={[
              styles.checkboxInner,
              {
                borderColor: task.urgencyColor,
              },
            ]}
            onPress={handleCheckboxPress}
            disabled={isCompleting}
          >
            <Text style={styles.checkboxText}>
              {task.status === 'completed' ? '✓' : ''}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.taskName,
            task.status === 'completed' && styles.taskNameCompleted,
          ]}
          numberOfLines={2}
        >
          {task.name}
        </Text>

        <View style={styles.metaContainer}>
          <Text style={styles.orderName} numberOfLines={1}>
            {task.orderName}
          </Text>
          <Text
            style={[
              styles.timeRemaining,
              { color: task.urgencyColor },
            ]}
          >
            {task.timeRemaining}
          </Text>
        </View>
      </View>

      {isCompleting && (
        <View style={styles.loadingIndicator}>
          <Text style={styles.loadingText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: scale(8),
    padding: responsiveSpacing.md,
    marginBottom: responsiveSpacing.md,
    borderLeftWidth: scale(4),
    borderLeftColor: COLORS.accent,
    minHeight: scale(70),
  },
  checkboxContainer: {
    marginRight: responsiveSpacing.md,
    justifyContent: 'center',
  },
  checkbox: {
    width: scale(24),
    height: scale(24),
  },
  checkboxInner: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderRadius: scale(4),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxText: {
    fontSize: scale(16),
    color: COLORS.success,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  taskName: {
    fontSize: responsiveFontSize.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: responsiveSpacing.xs,
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textTertiary,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderName: {
    fontSize: responsiveFontSize.small,
    color: COLORS.textSecondary,
    flex: 1,
  },
  timeRemaining: {
    fontSize: responsiveFontSize.small,
    fontWeight: '600',
    marginLeft: responsiveSpacing.sm,
  },
  loadingIndicator: {
    marginLeft: responsiveSpacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: scale(18),
    color: COLORS.success,
  },
});

export default TaskCheckboxItem;
