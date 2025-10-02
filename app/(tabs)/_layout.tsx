import { Tabs } from "expo-router";
import { Home, BarChart3, Plus, Calendar, Settings } from "lucide-react-native";
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { getColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

// Custom tab bar button for the Entry button
function EntryTabBarButton({ onPress }: { onPress: () => void }) {
  const { isDarkMode } = useTheme();
  const COLORS = getColors(isDarkMode);
  
  return (
    <TouchableOpacity
      style={styles.entryButton}
      onPress={onPress}
    >
      <View style={[styles.entryButtonInner, { backgroundColor: COLORS.primary }]}>
        <Plus color="white" size={28} strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const COLORS = getColors(isDarkMode);

  const handleEntryPress = () => {
    router.push('/add-entry');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          borderColor: COLORS.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: "Stats",
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Entry",
          tabBarIcon: () => null, // No icon since we're using a custom button
          tabBarButton: () => <EntryTabBarButton onPress={handleEntryPress} />,
        }}
      />
      <Tabs.Screen
        name="intimacy"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size - 2} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  entryButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});