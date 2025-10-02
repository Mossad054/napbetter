import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';

export default function AuthScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: 'oauth_apple' });

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { createdSessionId, setActive } = await googleAuth();
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (err: any) {
      console.error('OAuth error:', err);
      Alert.alert('Authentication Error', err.message || 'Failed to authenticate with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      const { createdSessionId, setActive } = await appleAuth();
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (err: any) {
      console.error('OAuth error:', err);
      Alert.alert('Authentication Error', err.message || 'Failed to authenticate with Apple');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to BetterNaps</Text>
        <Text style={styles.subtitle}>
          Track your mood, sleep, and daily activities to improve your wellbeing
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.googleButton, isLoading && styles.disabledButton]} 
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Loading...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.appleButton, isLoading && styles.disabledButton]} 
            onPress={handleAppleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Loading...' : 'Continue with Apple'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  googleButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appleButton: {
    backgroundColor: COLORS.text,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  disclaimer: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});