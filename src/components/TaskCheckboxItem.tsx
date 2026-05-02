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

  const getUrgencyBadgeStyle = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return {
          backgroundColor: '#fef0f0',
          borderColor: '#fbc8cb',
          textColor: COLORS.danger,
        };
      case 'urgent':
        return {
          backgroundColor: '#fef5eb',
          borderColor: '#f5d4a8',
          textColor: COLORS.warning,
        };
      case 'warning':
        return {
          backgroundColor: '#fef5eb',
          borderColor: '#f5d4a8',
          textColor: '#e9973f',
        };
      default:
        return {
          backgroundColor: '#f0f7f3',
          borderColor: '#c8e6d5',
          textColor: COLORS.success,
        };
    }
  };

  const badgeStyle = getUrgencyBadgeStyle(task.urgencyLevel);
  const urgencyLabel = task.urgencyLevel.toUpperCase();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(task.id)}
      activeOpacity={0.8}
    >
      <Animated.View 
        style={[
          styles.checkbox, 
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.checkboxInner,
            task.status === 'completed' && styles.checkboxCompleted,
          ]}
          onPress={handleCheckboxPress}
          disabled={isCompleting}
        >
          <Text style={styles.checkboxText}>
            {task.status === 'completed' ? '✓' : ''}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.taskName,
            task.status === 'completed' && styles.taskNameCompleted,
          ]}
          numberOfLines={1}
        >
          {task.name}
        </Text>

        <Text 
          style={[
            styles.description,
            task.status === 'completed' && styles.descriptionCompleted,
          ]}
          numberOfLines={1}
        >
          {task.orderName}
        </Text>

        <View style={styles.badgeContainer}>
          <View 
            style={[
              styles.urgencyBadge,
              { 
                backgroundColor: badgeStyle.backgroundColor,
                borderColor: badgeStyle.borderColor,
              }
            ]}
          >
            <Text 
              style={[
                styles.urgencyText,
                { color: badgeStyle.textColor }
              ]}
            >
              {urgencyLabel}
            </Text>
          </View>
          <Text 
            style={[
              styles.timeRemaining,
              { color: task.urgencyColor }
            ]}
          >
            {task.timeRemaining}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: scale(10),
    marginBottom: responsiveSpacing.sm,
    gap: scale(10),
  },
  checkbox: {
    justifyContent: 'center',
  },
  checkboxInner: {
    width: scale(16),
    height: scale(16),
    borderWidth: 1.5,
    borderRadius: scale(3),
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
  contentContainer: {
    flex: 1,
  },
  taskName: {
    fontSize: scale(13),
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: scale(2),
    fontFamily: 'Georgia',
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: scale(11),
    color: COLORS.textSecondary,
    marginBottom: scale(6),
    fontFamily: 'monospace',
  },
  descriptionCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textTertiary,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  urgencyBadge: {
    paddingHorizontal: scale(7),
    paddingVertical: scale(2),
    borderRadius: scale(4),
    borderWidth: 1,
  },
  urgencyText: {
    fontSize: scale(9),
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  timeRemaining: {
    fontSize: scale(9),
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});

export default TaskCheckboxItem;
