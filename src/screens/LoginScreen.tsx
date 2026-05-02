import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import {
  responsiveFontSize,
  responsiveSpacing,
  scale,
  getResponsiveBorderRadius,
  responsiveDimensions,
} from '../utils/responsive';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { state, login } = useAuth();
  const isLoading = state.isLoading;

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    // Call the login function from context
    await login(email, password);
  };

  const handleDemoLogin = async () => {
    // Quick demo login with test credentials
    await login('demo@notiontracker.com', 'demo123');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Notion Tracker</Text>
        <Text style={styles.subtitle}>Manage your freelance tasks</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
            keyboardType="email-address"
            placeholderTextColor={COLORS.textTertiary}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
            placeholderTextColor={COLORS.textTertiary}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoButton, isLoading && styles.buttonDisabled]}
            onPress={handleDemoLogin}
            disabled={isLoading}
          >
            <Text style={styles.demoButtonText}>Demo Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    paddingHorizontal: responsiveSpacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: responsiveFontSize.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: responsiveSpacing.sm,
  },
  subtitle: {
    fontSize: responsiveFontSize.body,
    color: COLORS.textSecondary,
    marginBottom: responsiveSpacing.xxl,
  },
  form: {
    width: '100%',
    maxWidth: scale(350),
    gap: responsiveSpacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: getResponsiveBorderRadius(),
    paddingHorizontal: responsiveSpacing.lg,
    paddingVertical: responsiveSpacing.md,
    fontSize: responsiveFontSize.body,
    color: COLORS.textPrimary,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: getResponsiveBorderRadius(),
    paddingVertical: responsiveSpacing.md,
    alignItems: 'center',
    marginTop: responsiveSpacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: responsiveFontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  demoButton: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: getResponsiveBorderRadius(),
    paddingVertical: responsiveSpacing.md,
    alignItems: 'center',
  },
  demoButtonText: {
    color: COLORS.accent,
    fontSize: responsiveFontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
});

export default LoginScreen;
