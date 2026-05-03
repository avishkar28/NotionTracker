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
import { Order } from '../types';

interface CreateOrderModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateOrder: (orderData: {
    vendorName: string;
    description: string;
    deadline: string;
    priority: 'low' | 'medium' | 'high';
  }) => Promise<Order>;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  visible,
  onClose,
  onCreateOrder,
}) => {
  const [vendorName, setVendorName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!vendorName.trim()) {
      newErrors.vendorName = 'Vendor name is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Validate deadline is today
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const deadlineStart = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());

    if (deadlineStart.getTime() !== todayStart.getTime()) {
      newErrors.deadline = '❌ Order deadline must be today only';
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
      const orderData = {
        vendorName: vendorName.trim(),
        description: description.trim(),
        deadline: deadline.toISOString().split('T')[0],
        priority,
      };

      await onCreateOrder(orderData);
      // Reset form
      setVendorName('');
      setDescription('');
      setDeadline(new Date());
      setPriority('medium');
      setErrors({});
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (value: string) => {
    switch (value) {
      case 'high':
        return COLORS.danger;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  const formattedDate = deadline.toLocaleDateString('en-US', {
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
          <Text style={styles.headerTitle}>Create New Order</Text>
          <View style={{ width: scale(30) }} />
        </View>

        {/* Form */}
        <ScrollView style={styles.form} scrollEnabled={!showDatePicker}>
          {/* Vendor Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Vendor Name *</Text>
            <TextInput
              style={[styles.input, errors.vendorName && styles.inputError]}
              placeholder="Enter vendor name"
              placeholderTextColor={COLORS.textTertiary}
              value={vendorName}
              onChangeText={setVendorName}
              editable={!loading}
            />
            {errors.vendorName && (
              <Text style={styles.errorText}>{errors.vendorName}</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.description && styles.inputError,
              ]}
              placeholder="Enter order description"
              placeholderTextColor={COLORS.textTertiary}
              value={description}
              onChangeText={setDescription}
              editable={!loading}
              multiline
              numberOfLines={4}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>

          {/* Deadline */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Deadline *</Text>
            <TouchableOpacity
              style={[styles.dateButton, errors.deadline && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
              disabled={loading}
            >
              <Text style={styles.dateButtonText}>{formattedDate}</Text>
            </TouchableOpacity>
            {errors.deadline && (
              <Text style={styles.errorText}>{errors.deadline}</Text>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={deadline}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* Priority */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {(['low', 'medium', 'high'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    priority === p && styles.priorityButtonActive,
                    {
                      borderColor:
                        priority === p ? getPriorityColor(p) : COLORS.border,
                    },
                  ]}
                  onPress={() => setPriority(p)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      {
                        color:
                          priority === p
                            ? getPriorityColor(p)
                            : COLORS.textSecondary,
                      },
                    ]}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
              <Text style={styles.createButtonText}>Create Order</Text>
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
  textArea: {
    minHeight: scale(100),
    paddingTop: scale(10),
    paddingBottom: scale(10),
    textAlignVertical: 'top',
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
  priorityContainer: {
    flexDirection: 'row',
    gap: scale(10),
  },
  priorityButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: scale(8),
    paddingVertical: scale(10),
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: '#f0f7f3',
  },
  priorityButtonText: {
    fontSize: scale(13),
    fontWeight: '600',
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

export default CreateOrderModal;
