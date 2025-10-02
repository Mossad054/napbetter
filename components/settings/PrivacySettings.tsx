import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Cloud, 
  Download, 
  Trash2,
  Database,
  FileText,
  Shield,
  ChevronRight
} from 'lucide-react-native';
import { getColors } from '@/constants/theme';

interface PrivacySettingsProps {
  isDarkMode: boolean;
  onExportData: () => void;
  onDeleteData: () => void;
  onBack: () => void;
}

export function PrivacySettings({ isDarkMode, onExportData, onDeleteData, onBack }: PrivacySettingsProps) {
  const insets = useSafeAreaInsets();
  const [dataSyncEnabled, setDataSyncEnabled] = useState<boolean>(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(false);
  const [crashReportsEnabled, setCrashReportsEnabled] = useState<boolean>(true);
  const COLORS = getColors(isDarkMode);

  const handleDataSync = (enabled: boolean) => {
    setDataSyncEnabled(enabled);
    console.log('Data sync toggled:', enabled);
    if (enabled) {
      Alert.alert('Data Sync Enabled', 'Your data will now sync across devices.');
    } else {
      Alert.alert('Data Sync Disabled', 'Your data will only be stored locally.');
    }
  };

  const handleExportData = (format: 'json' | 'csv') => {
    console.log(`Exporting data as ${format.toUpperCase()}`);
    Alert.alert(
      'Export Data',
      `Your data will be exported as ${format.toUpperCase()} format. This may take a few moments.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // Simulate export process
            setTimeout(() => {
              Alert.alert('Export Complete', `Your data has been exported as ${format.toUpperCase()}.`);
            }, 2000);
          }
        }
      ]
    );
  };

  const handleDeleteLocalData = () => {
    Alert.alert(
      'Delete Local Data',
      'This will permanently delete all data stored on this device. Cloud data (if sync is enabled) will remain intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Are you absolutely sure? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete All',
                  style: 'destructive',
                  onPress: () => {
                    console.log('Local data deleted');
                    Alert.alert('Data Deleted', 'All local data has been permanently deleted.');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const renderToggleItem = (
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: React.ComponentType<any>,
    color: string
  ) => {
    const IconComponent = icon;
    
    return (
      <View style={styles.settingItem}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <IconComponent size={20} color={color} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: COLORS.text }]}>{title}</Text>
          <Text style={[styles.settingSubtitle, { color: COLORS.textSecondary }]}>{subtitle}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: COLORS.border, true: color }}
          thumbColor="white"
        />
      </View>
    );
  };

  const renderActionItem = (
    title: string,
    subtitle: string,
    onPress: () => void,
    icon: React.ComponentType<any>,
    color: string,
    isDestructive = false
  ) => {
    const IconComponent = icon;
    
    return (
      <TouchableOpacity
        style={styles.actionItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <IconComponent size={20} color={color} />
        </View>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, { color: COLORS.text, ...(isDestructive ? { color: '#EF4444' } : {}) }]}>
            {title}
          </Text>
          <Text style={[styles.actionSubtitle, { color: COLORS.textSecondary }]}>{subtitle}</Text>
        </View>
        <ChevronRight size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>Privacy & Data</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Data Sync</Text>
        
        {renderToggleItem(
          'Cloud Sync',
          'Sync your data across devices',
          dataSyncEnabled,
          handleDataSync,
          Cloud,
          '#3B82F6'
        )}

        <View style={[styles.syncStatusCard, { backgroundColor: `${COLORS.primary}10` }]}>
          <Text style={[styles.syncStatusTitle, { color: COLORS.primary }]}>
            {dataSyncEnabled ? '☁️ Sync Enabled' : '📱 Local Only'}
          </Text>
          <Text style={[styles.syncStatusText, { color: COLORS.primary }]}>
            {dataSyncEnabled 
              ? 'Your data is automatically backed up and synced across all your devices.'
              : 'Your data is stored only on this device. Enable sync to backup and access from other devices.'
            }
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Data Export</Text>
        
        {renderActionItem(
          'Export as JSON',
          'Download your data in JSON format',
          () => handleExportData('json'),
          FileText,
          '#10B981'
        )}

        {renderActionItem(
          'Export as CSV',
          'Download your data in CSV format for spreadsheets',
          () => handleExportData('csv'),
          Database,
          '#10B981'
        )}

        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Privacy Controls</Text>

        {renderToggleItem(
          'Anonymous Analytics',
          'Help improve the app with anonymous usage data',
          analyticsEnabled,
          setAnalyticsEnabled,
          Shield,
          '#8B5CF6'
        )}

        {renderToggleItem(
          'Crash Reports',
          'Send crash reports to help fix bugs',
          crashReportsEnabled,
          setCrashReportsEnabled,
          Shield,
          '#F59E0B'
        )}

        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Data Management</Text>

        {renderActionItem(
          'Delete Local Data',
          'Permanently delete all data on this device',
          handleDeleteLocalData,
          Trash2,
          '#EF4444',
          true
        )}

        <View style={[styles.storageCard, { backgroundColor: COLORS.surface }]}>
          <Text style={[styles.storageTitle, { color: COLORS.text }]}>📊 Storage Usage</Text>
          <View style={styles.storageItem}>
            <Text style={[styles.storageLabel, { color: COLORS.textSecondary }]}>Mood entries:</Text>
            <Text style={[styles.storageValue, { color: COLORS.text }]}>2.3 MB</Text>
          </View>
          <View style={styles.storageItem}>
            <Text style={[styles.storageLabel, { color: COLORS.textSecondary }]}>Activity data:</Text>
            <Text style={[styles.storageValue, { color: COLORS.text }]}>1.8 MB</Text>
          </View>
          <View style={styles.storageItem}>
            <Text style={[styles.storageLabel, { color: COLORS.textSecondary }]}>Sleep records:</Text>
            <Text style={[styles.storageValue, { color: COLORS.text }]}>0.9 MB</Text>
          </View>
          <View style={[styles.storageItem, styles.totalStorage]}>
            <Text style={[styles.storageTotalLabel, { color: COLORS.text }]}>Total:</Text>
            <Text style={[styles.storageTotalValue, { color: COLORS.primary }]}>5.0 MB</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: `${COLORS.primary}15`, borderLeftColor: COLORS.primary }]}>
          <Text style={[styles.infoTitle, { color: COLORS.primary }]}>🔒 Your Privacy Matters</Text>
          <Text style={[styles.infoText, { color: COLORS.primary }]}>
            • We never sell or share your personal data{'\n'}
            • All data is encrypted in transit and at rest{'\n'}
            • You have full control over your data{'\n'}
            • Anonymous analytics help us improve the app without compromising your privacy{'\n'}
            • Data exports include all your tracked information
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  actionContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  actionSubtitle: {
    fontSize: 14,
  },
  syncStatusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  syncStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  syncStatusText: {
    fontSize: 14,
    lineHeight: 20,
  },
  storageCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  storageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  storageLabel: {
    fontSize: 14,
  },
  storageValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalStorage: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 12,
  },
  storageTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  storageTotalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
    borderLeftWidth: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});