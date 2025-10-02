import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { X, Save, ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMoodStore } from '@/hooks/mood-store';

interface JournalTemplate {
  id: string;
  title: string;
  icon: React.ReactNode;
  prompts: string[];
  description: string;
}

interface JournalEntryProps {
  template: JournalTemplate;
  onBack: () => void;
  onSave: (entry: JournalEntryData) => void;
}

interface JournalEntryData {
  templateId: string;
  responses: string[];
  createdAt: string;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ template, onBack, onSave }) => {
  const [responses, setResponses] = useState<string[]>(Array(template.prompts.length).fill(''));
  const { addMoodEntry } = useMoodStore();

  const handleResponseChange = (index: number, text: string) => {
    const newResponses = [...responses];
    newResponses[index] = text;
    setResponses(newResponses);
  };

  const handleSave = async () => {
    // Check if any response is empty
    const hasEmptyResponse = responses.some(response => response.trim() === '');
    
    if (hasEmptyResponse) {
      Alert.alert('Incomplete Entry', 'Please answer all questions before saving.');
      return;
    }

    const entryData: JournalEntryData = {
      templateId: template.id,
      responses,
      createdAt: new Date().toISOString(),
    };

    try {
      // Save the journal entry
      onSave(entryData);
      
      // Provide haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert('Success', 'Journal entry saved successfully!', [
        { text: 'OK', onPress: onBack }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save journal entry. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>{template.title}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Save color={COLORS.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>{template.description}</Text>
        
        {template.prompts.map((prompt, index) => (
          <View key={index} style={styles.promptContainer}>
            <Text style={styles.promptText}>{prompt}</Text>
            <TextInput
              style={styles.responseInput}
              multiline
              numberOfLines={4}
              placeholder="Write your response here..."
              placeholderTextColor={COLORS.textTertiary}
              value={responses[index]}
              onChangeText={(text) => handleResponseChange(index, text)}
            />
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.saveBottomButton} onPress={handleSave}>
        <Text style={styles.saveBottomButtonText}>Save Entry</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: '600',
  },
  saveButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  promptContainer: {
    marginBottom: SPACING.xl,
  },
  promptText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  responseInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    minHeight: 100,
    textAlignVertical: 'top',
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  saveBottomButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    alignItems: 'center',
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
  },
  saveBottomButtonText: {
    ...TYPOGRAPHY.body,
    color: 'white',
    fontWeight: '600',
  },
});

export default JournalEntry;