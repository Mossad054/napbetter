import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Clerk publishable key
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_your-key-here';

// Token cache for Clerk with web compatibility
const tokenCache = {
  async getToken(key: string) {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        return localStorage.getItem(key);
      } else {
        // Use SecureStore for native
        return await SecureStore.getItemAsync(key);
      }
    } catch (err) {
      console.error('Error getting token:', err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        localStorage.setItem(key, value);
      } else {
        // Use SecureStore for native
        await SecureStore.setItemAsync(key, value);
      }
    } catch (err) {
      console.error('Error saving token:', err);
    }
  },
};

export { ClerkProvider, tokenCache, CLERK_PUBLISHABLE_KEY };