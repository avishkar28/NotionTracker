import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { useUI } from '../context/UIContext';
import {
  responsiveFontSize,
  responsiveSpacing,
  getResponsiveBorderRadius,
} from '../utils/responsive';

const SettingsScreen: React.FC = () => {
  const { state: uiState, setNotifications, setAutoSync } = useUI();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingName}>Notifications</Text>
            <Text style={styles.settingDesc}>Get alerts for due tasks</Text>
          </View>
          <Switch
            value={uiState.notificationsEnabled}
            onValueChange={setNotifications}
            trackColor={{ false: COLORS.border, true: COLORS.accent }}
            thumbColor={COLORS.white}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingName}>Auto Sync</Text>
            <Text style={styles.settingDesc}>Sync when connected</Text>
          </View>
          <Switch
            value={uiState.autoSync}
            onValueChange={setAutoSync}
            trackColor={{ false: COLORS.border, true: COLORS.accent }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionItem, styles.borderTop]}>
          <Text style={styles.actionText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={[styles.infoItem, styles.borderTop]}>
          <Text style={styles.infoLabel}>Build</Text>
          <Text style={styles.infoValue}>1</Text>
        </View>
      </View>
    </ScrollView>
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
  section: {
    paddingHorizontal: responsiveSpacing.lg,
    paddingVertical: responsiveSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: responsiveFontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
    marginBottom: responsiveSpacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabel: {
    flex: 1,
  },
  settingName: {
    fontSize: responsiveFontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textPrimary,
  },
  settingDesc: {
    fontSize: responsiveFontSize.small,
    color: COLORS.textSecondary,
    marginTop: responsiveSpacing.xs,
  },
  actionItem: {
    paddingVertical: responsiveSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  borderTop: {
    borderBottomWidth: 0,
  },
  actionText: {
    fontSize: responsiveFontSize.body,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: responsiveSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: responsiveFontSize.body,
    color: COLORS.textPrimary,
  },
  infoValue: {
    fontSize: responsiveFontSize.body,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
});

export default SettingsScreen;
