import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Bell, 
  User,
  Shield,
  Palette,
  Lock,
  Heart,
  Globe,
  HelpCircle,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import { getColors, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useMoodStore } from '@/hooks/mood-store';
import { useTheme } from '@/contexts/ThemeContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import NotificationSettings from '@/components/settings/NotificationSettings';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import FeaturesSettings from '@/components/settings/FeaturesSettings';
import HelpSettings from '@/components/settings/HelpSettings';
import PreferencesSettings from '@/components/settings/PreferencesSettings';

// Collapsible Section Component
const CollapsibleCard = ({ title, icon, children, isDarkMode }: any) => {
  const [expanded, setExpanded] = useState(false);
  const COLORS = getColors(isDarkMode);

  return (
    <View style={[styles.card, { backgroundColor: COLORS.surface }]}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.cardTitleContainer}>
          {icon}
          <Text style={[styles.cardTitle, { color: COLORS.text }]}>{title}</Text>
        </View>
        {expanded ? (
          <ChevronUp size={20} color={COLORS.textSecondary} />
        ) : (
          <ChevronDown size={20} color={COLORS.textSecondary} />
        )}
      </TouchableOpacity>

      {expanded && <View style={styles.cardContent}>{children}</View>}
    </View>
  );
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const { exportAllUserData, deleteAllUserData } = useMoodStore();
  const [isExporting, setIsExporting] = useState(false);
  
  const COLORS = getColors(isDarkMode);

  const handleHelpPress = () => {
    // Navigate to help center
    // router.push('/(tabs)/help'); // Uncomment when help screen is implemented
  };

  const handleSupabaseTest = () => {
    router.push('/supabase-test');
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      // Get all user data
      const userData = await exportAllUserData();
      
      // Create a JSON string
      const dataString = JSON.stringify(userData, null, 2);
      
      // Create file name with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `napbetter-data-export-${timestamp}.json`;
      
      // For web, create a download link
      if (Platform.OS === 'web') {
        const blob = new Blob([dataString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // For mobile, save to file system and share
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, dataString);
        
        // Share the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Success', `Data exported to: ${fileUri}`);
        }
      }
      
      Alert.alert('Success', 'Your data has been exported successfully.');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your mood entries, intimacy data, sleep records, and other information. This action cannot be undone.\n\nAre you sure you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllUserData();
              Alert.alert(
                'Success', 
                'All your data has been permanently deleted.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete data. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "Are you sure you want to delete your account?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => console.log("Account deleted") },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => console.log("User logged out") },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: COLORS.background }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.border }]}>
        <View style={styles.headerContent}>
          <Settings color={COLORS.text} size={24} />
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>Settings</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Notification Preferences */}
        <CollapsibleCard
          title="Notification Preferences"
          icon={<Bell size={20} color={COLORS.primary} />}
          isDarkMode={isDarkMode}
        >
          <NotificationSettings isDarkMode={isDarkMode} />
        </CollapsibleCard>

        {/* Account Management */}
        <CollapsibleCard 
          title="Account Management" 
          icon={<User size={20} color={COLORS.success} />}
          isDarkMode={isDarkMode}
        >
          <AccountSettings 
            onBack={() => {}} // Empty function as we're not navigating away
          />
        </CollapsibleCard>

        {/* Privacy & Data */}
        <CollapsibleCard 
          title="Privacy & Data" 
          icon={<Shield size={20} color={COLORS.warning} />}
          isDarkMode={isDarkMode}
        >
          <PrivacySettings 
            isDarkMode={isDarkMode}
            onExportData={handleExportData}
            onDeleteData={handleDeleteAllData}
            onBack={() => {}} // Empty function as we're not navigating away
          />
        </CollapsibleCard>

        {/* Theme Customization */}
        <CollapsibleCard 
          title="Theme Customization" 
          icon={<Palette size={20} color={COLORS.accent} />}
          isDarkMode={isDarkMode}
        >
          <ThemeSettings 
            onBack={() => {}} // Empty function as we're not navigating away
          />
        </CollapsibleCard>

        {/* Security */}
        <CollapsibleCard 
          title="Security" 
          icon={<Lock size={20} color={COLORS.primary} />}
          isDarkMode={isDarkMode}
        >
          <SecuritySettings 
            onBack={() => {}} // Empty function as we're not navigating away
          />
        </CollapsibleCard>

        {/* Features */}
        <CollapsibleCard 
          title="Features" 
          icon={<Heart size={20} color={COLORS.accent} />}
          isDarkMode={isDarkMode}
        >
          <FeaturesSettings isDarkMode={isDarkMode} />
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: COLORS.surfaceLight }]}
            onPress={handleSupabaseTest}
          >
            <Text style={[styles.buttonText, { color: COLORS.primary }]}>
              Supabase Integration Test
            </Text>
          </TouchableOpacity>
        </CollapsibleCard>

        {/* Preferences */}
        <CollapsibleCard 
          title="Preferences" 
          icon={<Globe size={20} color={COLORS.primary} />}
          isDarkMode={isDarkMode}
        >
          <PreferencesSettings isDarkMode={isDarkMode} />
        </CollapsibleCard>

        {/* Support */}
        <CollapsibleCard 
          title="Support" 
          icon={<HelpCircle size={20} color={COLORS.textSecondary} />}
          isDarkMode={isDarkMode}
        >
          <HelpSettings 
            isDarkMode={isDarkMode}
            onHelpPress={handleHelpPress}
          />
        </CollapsibleCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  cardTitleContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8 
  },
  cardTitle: { 
    ...TYPOGRAPHY.h4,
    fontWeight: "600" 
  },
  cardContent: { 
    paddingHorizontal: 16, 
    paddingBottom: 16, 
    gap: 12 
  },
  button: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  buttonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600' as const,
  },
});