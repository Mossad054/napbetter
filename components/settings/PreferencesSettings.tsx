import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Calendar, ChevronRight } from 'lucide-react-native';
import { getColors } from '@/constants/theme';

interface PreferencesSettingsProps {
  isDarkMode: boolean;
}

const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({ isDarkMode }) => {
  const [language, setLanguage] = useState("English");
  const COLORS = getColors(isDarkMode);

  return (
    <View>
      <View style={[styles.settingItem, { 
        paddingVertical: 12, 
        borderBottomColor: COLORS.border 
      }]}>
        <View style={styles.settingIconContainer}>
          <View style={[styles.settingIcon, { backgroundColor: COLORS.surfaceLight }]}>
            <Calendar color={COLORS.success} size={20} />
          </View>
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: COLORS.text }]}>Start of the Week</Text>
          <Text style={[styles.settingSubtitle, { color: COLORS.textSecondary }]}>Monday</Text>
        </View>
        <View style={styles.settingRight}>
          <ChevronRight color={COLORS.textTertiary} size={20} />
        </View>
      </View>
      <View style={styles.settingRow}>
        <Text style={[styles.settingLabel, { color: COLORS.text }]}>Language</Text>
        <TextInput
          style={[styles.input, { 
            borderColor: COLORS.border, 
            color: COLORS.text,
            backgroundColor: COLORS.surfaceLight
          }]}
          value={language}
          onChangeText={setLanguage}
          placeholder="English"
        />
      </View>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default PreferencesSettings;