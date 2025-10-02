import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Star, Heart, AlertTriangle } from 'lucide-react-native';

interface JournalTemplate {
  id: string;
  title: string;
  icon: React.ReactNode;
  prompts: string[];
  description: string;
}

interface JournalingTemplatesProps {
  onTemplateSelect: (template: JournalTemplate) => void;
}

const JournalingTemplates: React.FC<JournalingTemplatesProps> = ({ onTemplateSelect }) => {
  const templates: JournalTemplate[] = [
    {
      id: 'gratitude',
      title: 'Gratitude Journal',
      icon: <Heart color={COLORS.primary} size={24} />,
      description: 'Focus on what you\'re thankful for',
      prompts: [
        'What are three things you are grateful for today?',
        'Who made a positive impact on your day?',
        'What simple pleasure brought you joy today?'
      ]
    },
    {
      id: 'stress',
      title: 'Stress Log',
      icon: <AlertTriangle color={COLORS.warning} size={24} />,
      description: 'Identify and process stressors',
      prompts: [
        'What situations caused you stress today?',
        'How did you feel physically and emotionally?',
        'What coping strategies did you use?'
      ]
    },
    {
      id: 'reflection',
      title: 'Reflection Log',
      icon: <Star color={COLORS.success} size={24} />,
      description: 'Reflect on your day and growth',
      prompts: [
        'What did you learn about yourself today?',
        'What would you do differently?',
        'What are you proud of accomplishing?'
      ]
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guided Journaling</Text>
      <Text style={styles.subtitle}>Choose a template to get started</Text>
      
      <ScrollView style={styles.templatesContainer}>
        {templates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateCard}
            onPress={() => onTemplateSelect(template)}
          >
            <View style={styles.templateHeader}>
              {template.icon}
              <Text style={styles.templateTitle}>{template.title}</Text>
            </View>
            <Text style={styles.templateDescription}>{template.description}</Text>
            <View style={styles.promptsPreview}>
              {template.prompts.slice(0, 2).map((prompt, index) => (
                <Text key={index} style={styles.promptPreviewText}>• {prompt}</Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  templatesContainer: {
    flex: 1,
  },
  templateCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  templateTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  templateDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  promptsPreview: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
  },
  promptPreviewText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
});

export default JournalingTemplates;