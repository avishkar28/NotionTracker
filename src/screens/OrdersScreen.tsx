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
import { useOrders } from '../context/OrdersContext';
import {
  responsiveFontSize,
  responsiveSpacing,
  scale,
  getResponsiveBorderRadius,
} from '../utils/responsive';

const OrdersScreen: React.FC = () => {
  const { state: ordersState, fetchOrders } = useOrders();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>

      <FlatList
        data={ordersState.orders}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.vendorName}>{item.vendorName}</Text>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              >
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
            </View>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.orderFooter}>
              <Text style={styles.deadline}>
                Due: {new Date(item.deadline).toLocaleDateString()}
              </Text>
              <Text style={styles.taskCount}>{item.taskCount} tasks</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No orders yet. Create one!</Text>
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
    paddingHorizontal: responsiveSpacing.lg,
    paddingTop: responsiveSpacing.lg,
    paddingBottom: responsiveSpacing.md,
  },
  title: {
    fontSize: responsiveFontSize.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingHorizontal: responsiveSpacing.lg,
    paddingVertical: responsiveSpacing.md,
  },
  orderCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: getResponsiveBorderRadius(),
    padding: responsiveSpacing.lg,
    marginBottom: responsiveSpacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing.md,
  },
  vendorName: {
    fontSize: responsiveFontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: responsiveSpacing.md,
    paddingVertical: responsiveSpacing.xs,
    borderRadius: getResponsiveBorderRadius(),
    marginLeft: responsiveSpacing.md,
  },
  priorityText: {
    fontSize: responsiveFontSize.small,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  description: {
    fontSize: responsiveFontSize.small,
    color: COLORS.textSecondary,
    marginBottom: responsiveSpacing.md,
    lineHeight: scale(18),
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadline: {
    fontSize: responsiveFontSize.small,
    color: COLORS.textTertiary,
  },
  taskCount: {
    fontSize: responsiveFontSize.small,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: responsiveSpacing.xxl,
  },
  emptyText: {
    fontSize: responsiveFontSize.body,
    color: COLORS.textTertiary,
  },
});

export default OrdersScreen;
