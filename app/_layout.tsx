import React, { useEffect } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { SplashScreen, Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AuthScreen from '@/components/AuthScreen';
import { MoodProvider } from '@/hooks/mood-store';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/theme';
import { tokenCache, CLERK_PUBLISHABLE_KEY } from '@/lib/clerk';

const queryClient = new QueryClient();

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create a component that uses the theme context for the loading screen
const LoadingScreen = () => {
  const { isDarkMode } = useTheme();
  const COLORS = getColors(isDarkMode);

  return (
    <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={[styles.loadingText, { color: COLORS.textSecondary }]}>Loading authentication...</Text>
    </View>
  );
};

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
}

function AuthenticatedApp() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <ThemeProvider>
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  if (!isSignedIn) {
    return <AuthScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MoodProvider>
          <GestureHandlerRootView style={styles.container}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </MoodProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <ClerkProvider 
        publishableKey={CLERK_PUBLISHABLE_KEY}
        tokenCache={tokenCache}
      >
        <AuthenticatedApp />
      </ClerkProvider>
    </ErrorBoundary>
  );
}