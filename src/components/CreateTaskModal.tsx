import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../constants/colors';
import { scale } from '../utils/responsive';
import { Order, Task } from '../types';

interface CreateTaskModalProps {
  visible: boolean;
  orderId: string;
  orderName: string;
  onClose: () => void;
  onCreateTask: (taskData: {
    orderId: string;
    name: string;
    assignedDate: string;
    dueDate: string;
  }) => Promise<Task>;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  visible,
  orderId,
  orderName,
  onClose,
  onCreateTask,
}) => {
  const [taskName, setTaskName] = useState('');
  const [assignedDate, setAssignedDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  );
  const [showAssignedDatePicker, setShowAssignedDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDateChange = (
    event: any,
    selectedDate: Date | undefined,
    dateType: 'assigned' | 'due'
  ) => {
    if (Platform.OS === 'android') {
      if (dateType === 'assigned') {
        setShowAssignedDatePicker(false);
      } else {
        setShowDueDatePicker(false);
      }
    }
    if (selectedDate) {
      if (dateType === 'assigned') {
        setAssignedDate(selectedDate);
      } else {
        setDueDate(selectedDate);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!taskName.trim()) {
      newErrors.taskName = 'Task name is required';
    }
    if (dueDate < assignedDate) {
      newErrors.dueDate = 'Due date must be on or after assigned date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        orderId,
        name: taskName.trim(),
        assignedDate: assignedDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
      };

      await onCreateTask(taskData);

      // Reset form
      setTaskName('');
      setAssignedDate(new Date());
      setDueDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
      setErrors({});
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formattedAssignedDate = assignedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedDueDate = dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} disabled={loading}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Task</Text>
          <View style={{ width: scale(30) }} />
        </View>

        {/* Form */}
        <ScrollView style={styles.form} scrollEnabled={!showAssignedDatePicker && !showDueDatePicker}>
          {/* Order Info */}
          <View style={styles.orderCard}>
            <Text style={styles.orderLabel}>Order</Text>
            <Text style={styles.orderName}>{orderName}</Text>
          </View>

          {/* Task Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Task Name *</Text>
            <TextInput
              style={[styles.input, errors.taskName && styles.inputError]}
              placeholder="e.g., Create logo mockup"
              placeholderTextColor={COLORS.textTertiary}
              value={taskName}
              onChangeText={setTaskName}
              editable={!loading}
            />
            {errors.taskName && (
              <Text style={styles.errorText}>{errors.taskName}</Text>
            )}
          </View>

          {/* Assigned Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Assigned Date *</Text>
            <TouchableOpacity
              style={[styles.dateButton, errors.assignedDate && styles.inputError]}
              onPress={() => setShowAssignedDatePicker(true)}
              disabled={loading}
            >
              <Text style={styles.dateButtonText}>{formattedAssignedDate}</Text>
            </TouchableOpacity>

            {showAssignedDatePicker && (
              <DateTimePicker
                value={assignedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => handleDateChange(event, date, 'assigned')}
              />
            )}
          </View>

          {/* Due Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Due Date *</Text>
            <TouchableOpacity
              style={[styles.dateButton, errors.dueDate && styles.inputError]}
              onPress={() => setShowDueDatePicker(true)}
              disabled={loading}
            >
              <Text style={styles.dateButtonText}>{formattedDueDate}</Text>
            </TouchableOpacity>
            {errors.dueDate && (
              <Text style={styles.errorText}>{errors.dueDate}</Text>
            )}

            {showDueDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => handleDateChange(event, date, 'due')}
                minimumDate={assignedDate}
              />
            )}
          </View>

          <View style={{ height: scale(20) }} />
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.createButton]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.createButtonText}>Create Task</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.backgroundSecondary,
  },
  closeButton: {
    fontSize: scale(24),
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Georgia',
  },
  form: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingVertical: scale(16),
  },
  orderCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: scale(12),
    marginBottom: scale(20),
  },
  orderLabel: {
    fontSize: scale(10),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: scale(4),
  },
  orderName: {
    fontSize: scale(14),
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Georgia',
  },
  formGroup: {
    marginBottom: scale(20),
  },
  label: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: scale(8),
    fontFamily: 'Georgia',
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    fontSize: scale(14),
    color: COLORS.textPrimary,
    fontFamily: 'System',
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    fontSize: scale(12),
    color: COLORS.danger,
    marginTop: scale(4),
    fontFamily: 'System',
  },
  dateButton: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: scale(14),
    color: COLORS.textPrimary,
    fontFamily: 'System',
  },
  footer: {
    flexDirection: 'row',
    gap: scale(10),
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.backgroundSecondary,
  },
  button: {
    flex: 1,
    borderRadius: scale(8),
    paddingVertical: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundTertiary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
  },
  createButton: {
    backgroundColor: COLORS.textPrimary,
  },
  createButtonText: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'monospace',
  },
});

export default CreateTaskModal;
