import { Task } from '../types';
import { COLORS } from '../constants/colors';

export interface TaskWithUrgency extends Task {
  urgencyLevel: 'overdue' | 'urgent' | 'warning' | 'normal';
  timeRemaining: string;
  urgencyColor: string;
}

export const calculateUrgency = (dueDate: string): TaskWithUrgency['urgencyLevel'] => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) return 'overdue';
  if (diffHours < 2) return 'urgent';
  if (diffHours < 8) return 'warning';
  return 'normal';
};

export const getUrgencyColor = (urgency: TaskWithUrgency['urgencyLevel']): string => {
  switch (urgency) {
    case 'overdue':
      return COLORS.danger;
    case 'urgent':
      return COLORS.warning;
    case 'warning':
      return '#f59e0b';
    case 'normal':
      return COLORS.success;
    default:
      return COLORS.textSecondary;
  }
};

export const getTimeRemaining = (dueDate: string): string => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();

  if (diffMs < 0) {
    const overdueMins = Math.abs(diffMs) / (1000 * 60);
    if (overdueMins < 60) return 'OVERDUE';
    if (overdueMins < 1440) return `${Math.floor(overdueMins / 60)}h overdue`;
    return `${Math.floor(overdueMins / 1440)}d overdue`;
  }

  const totalMins = diffMs / (1000 * 60);
  if (totalMins < 60) return `${Math.floor(totalMins)}m left`;
  if (totalMins < 1440) return `${Math.floor(totalMins / 60)}h left`;
  return `${Math.floor(totalMins / 1440)}d left`;
};

export const sortTasksByUrgency = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const urgencyA = calculateUrgency(a.dueDate);
    const urgencyB = calculateUrgency(b.dueDate);
    
    const urgencyOrder = { overdue: 0, urgent: 1, warning: 2, normal: 3 };
    return urgencyOrder[urgencyA] - urgencyOrder[urgencyB];
  });
};

export const enrichTaskWithUrgency = (task: Task): TaskWithUrgency => {
  const urgency = calculateUrgency(task.dueDate);
  return {
    ...task,
    urgencyLevel: urgency,
    timeRemaining: getTimeRemaining(task.dueDate),
    urgencyColor: getUrgencyColor(urgency),
  };
};
