import React, { useState } from 'react';
import { View, Text, Switch, TextInput, StyleSheet } from 'react-native';
import { getColors } from '@/constants/theme';
import { Clock, Zap, Target } from 'lucide-react-native';

interface NotificationSettingsProps {
  isDarkMode: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isDarkMode }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifyTime, setNotifyTime] = useState("08:00 PM");
  const [dailyReminder, setDailyReminder] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [experimentReminders, setExperimentReminders] = useState(true);
  const COLORS = getColors(isDarkMode);

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

  return (
    <View>
      <View style={styles.settingRow}>
        <Text style={[styles.settingLabel, { color: COLORS.text }]}>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor="white"
        />
      </View>
      <View style={styles.settingRow}>
        <Text style={[styles.settingLabel, { color: COLORS.text }]}>Notification Time</Text>
        <TextInput
          style={[styles.input, { 
            borderColor: COLORS.border, 
            color: COLORS.text,
            backgroundColor: COLORS.surfaceLight
          }]}
          value={notifyTime}
          onChangeText={setNotifyTime}
          placeholder="08:00 PM"
        />
      </View>

      <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Notification Types</Text>
      {renderToggleItem(
        'Daily Reminders',
        'Get reminded to log your daily entries',
        dailyReminder,
        setDailyReminder,
        Clock,
        '#10B981'
      )}
      {renderToggleItem(
        'Streak Alerts',
        'Celebrate your habit streaks and milestones',
        streakAlerts,
        setStreakAlerts,
        Zap,
        '#F59E0B'
      )}
      {renderToggleItem(
        'Experiment Reminders',
        'Get notified about ongoing experiments',
        experimentReminders,
        setExperimentReminders,
        Target,
        '#8B5CF6'
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingLabel: { 
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    minWidth: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
});

export default NotificationSettings;