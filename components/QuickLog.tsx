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
import { X, Save, Mic } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { JournalService } from '@/services/journal-service';

interface EmotionTag {
  id: string;
  name: string;
  emoji: string;
}

interface TriggerTag {
  id: string;
  name: string;
}

interface QuickLogProps {
  onBack: () => void;
  onSave: (entry: QuickLogEntry) => Promise<number>;
  date?: string; // Add date prop
}

interface QuickLogEntry {
  text: string;
  emotions: string[];
  triggers: string[];
  createdAt: string;
}

interface AIInsight {
  sentiment: 'positive' | 'negative' | 'neutral';
  patterns: string[];
  intensity: number; // 1-10 scale
  suggestions: string[];
}

const QuickLog: React.FC<QuickLogProps> = ({ onBack, onSave, date }) => {
  const [text, setText] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Emotion tags
  const emotionTags: EmotionTag[] = [
    { id: 'angry', name: 'Angry', emoji: '😡' },
    { id: 'sad', name: 'Sad', emoji: '😢' },
    { id: 'happy', name: 'Happy', emoji: '😊' },
    { id: 'anxious', name: 'Anxious', emoji: '😰' },
    { id: 'calm', name: 'Calm', emoji: '😌' },
  ];

  // Trigger tags
  const triggerTags: TriggerTag[] = [
    { id: 'work', name: 'Work' },
    { id: 'social', name: 'Social' },
    { id: 'caffeine', name: 'Caffeine' },
    { id: 'conflict', name: 'Conflict' },
    { id: 'health', name: 'Health' },
    { id: 'relationship', name: 'Relationship' },
    { id: 'money', name: 'Money' },
    { id: 'other', name: 'Other' },
  ];

  // Quick emotion buttons
  const quickEmotions = [
    { id: 'stress', name: 'Stress', emoji: '😖' },
    { id: 'anxiety', name: 'Anxiety', emoji: '😰' },
    { id: 'excitement', name: 'Excitement', emoji: '🤩' },
    { id: 'burnout', name: 'Burnout', emoji: '🥱' },
  ];

  const toggleEmotion = (emotionId: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotionId)
        ? prev.filter(id => id !== emotionId)
        : [...prev, emotionId]
    );
  };

  const toggleTrigger = (triggerId: string) => {
    setSelectedTriggers(prev => 
      prev.includes(triggerId)
        ? prev.filter(id => id !== triggerId)
        : [...prev, triggerId]
    );
  };

  const addQuickEmotion = (emotion: { id: string; name: string; emoji: string }) => {
    // Add the emotion to the text
    setText(prev => prev + ` ${emotion.emoji} `);
    
    // Add to selected emotions if not already selected
    if (!selectedEmotions.includes(emotion.id)) {
      setSelectedEmotions(prev => [...prev, emotion.id]);
    }
  };

  // Simulate voice-to-text functionality
  const toggleVoiceToText = () => {
    if (isListening) {
      // Stop listening
      setIsListening(false);
      // In a real app, this would stop the speech recognition
      Alert.alert('Voice Recording', 'Voice recording stopped. In a real app, this would convert speech to text.');
    } else {
      // Start listening
      setIsListening(true);
      // In a real app, this would start the speech recognition
      Alert.alert('Voice Recording', 'Listening... In a real app, this would convert speech to text.');
      
      // Simulate voice input after 3 seconds
      setTimeout(() => {
        setText(prev => prev + ' This is a simulated voice input. ');
        setIsListening(false);
      }, 3000);
    }
  };

  // Simulate AI analysis of the journal entry
  const analyzeWithAI = (entryText: string): AIInsight => {
    // This is a simplified simulation - in a real app, this would call an AI service
    const lowerText = entryText.toLowerCase();
    
    // Determine sentiment based on keywords
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    const positiveWords = ['happy', 'good', 'great', 'excited', 'love', 'wonderful', 'amazing'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'worried', 'stressed', 'anxious', 'terrible'];
    
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
    }
    
    // Detect patterns (simplified)
    const patterns: string[] = [];
    if (lowerText.includes('meeting') && lowerText.includes('anxious')) {
      patterns.push('You often feel anxious after meetings.');
    }
    if (lowerText.includes('work') && lowerText.includes('stress')) {
      patterns.push('Work seems to be a major source of stress for you.');
    }
    if (lowerText.includes('wednesday') || lowerText.includes('mid-week')) {
      patterns.push('Your stress seems highest mid-week.');
    }
    
    // Determine intensity based on exclamation marks and emotional words
    const exclamationCount = (entryText.match(/!/g) || []).length;
    const intensity = Math.min(10, Math.max(1, 5 + exclamationCount));
    
    // Generate suggestions based on content
    const suggestions: string[] = [];
    if (sentiment === 'negative') {
      suggestions.push('Try this CBT exercise to reframe negative thoughts.');
    }
    if (patterns.some(p => p.includes('mid-week'))) {
      suggestions.push('Consider a short meditation break on Wednesdays.');
    }
    if (lowerText.includes('sleep') || lowerText.includes('tired')) {
      suggestions.push('Try a bedtime breathing exercise to improve sleep quality.');
    }
    if (suggestions.length === 0) {
      suggestions.push('Keep journaling regularly to track your emotional patterns.');
    }
    
    return {
      sentiment,
      patterns,
      intensity,
      suggestions
    };
  };

  const handleSave = async () => {
    if (!text.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    const entry: QuickLogEntry = {
      text,
      emotions: selectedEmotions,
      triggers: selectedTriggers,
      createdAt: date ? new Date(date).toISOString() : new Date().toISOString(), // Use provided date or current date
    };

    try {
      // Save the quick log entry and get the entry ID
      const entryId = await onSave(entry);
      
      // Analyze with AI
      const insights = analyzeWithAI(entry.text);
      setAiInsights(insights);
      
      // Save AI analysis to database
      await JournalService.saveAIAnalysis({
        journal_entry_id: entryId,
        sentiment: insights.sentiment,
        patterns: insights.patterns,
        intensity: insights.intensity,
        suggestions: insights.suggestions
      });
      
      // Provide haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error saving quick log:', error);
      Alert.alert('Error', 'Failed to save quick log. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <X color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Quick Log</Text>
        {date && (
          <Text style={styles.dateText}>
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        )}
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Save color={COLORS.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Text Box */}
        <View style={styles.textSection}>
          <View style={styles.textHeader}>
            <Text style={styles.label}>What's on your mind?</Text>
            <TouchableOpacity onPress={toggleVoiceToText} style={styles.voiceButton}>
              <Mic 
                color={isListening ? COLORS.error : COLORS.textSecondary} 
                size={20} 
                fill={isListening ? COLORS.error : 'none'} 
              />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={6}
            placeholder="Share your thoughts... (tap mic for voice input)"
            placeholderTextColor={COLORS.textTertiary}
            value={text}
            onChangeText={setText}
          />
        </View>

        {/* Quick Emotion Buttons */}
        <View style={styles.quickEmotionsSection}>
          <Text style={styles.label}>Quick Emotions</Text>
          <View style={styles.quickEmotionsContainer}>
            {quickEmotions.map(emotion => (
              <TouchableOpacity
                key={emotion.id}
                style={styles.quickEmotionButton}
                onPress={() => addQuickEmotion(emotion)}
              >
                <Text style={styles.quickEmotionEmoji}>{emotion.emoji}</Text>
                <Text style={styles.quickEmotionText}>{emotion.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emotion Tags */}
        <View style={styles.tagsSection}>
          <Text style={styles.label}>Emotions</Text>
          <View style={styles.tagsContainer}>
            {emotionTags.map(emotion => (
              <TouchableOpacity
                key={emotion.id}
                style={[
                  styles.tag,
                  selectedEmotions.includes(emotion.id) && styles.selectedTag
                ]}
                onPress={() => toggleEmotion(emotion.id)}
              >
                <Text style={styles.tagEmoji}>{emotion.emoji}</Text>
                <Text style={[
                  styles.tagText,
                  selectedEmotions.includes(emotion.id) && styles.selectedTagText
                ]}>
                  {emotion.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trigger Tags */}
        <View style={styles.tagsSection}>
          <Text style={styles.label}>Triggers</Text>
          <View style={styles.tagsContainer}>
            {triggerTags.map(trigger => (
              <TouchableOpacity
                key={trigger.id}
                style={[
                  styles.tag,
                  selectedTriggers.includes(trigger.id) && styles.selectedTag
                ]}
                onPress={() => toggleTrigger(trigger.id)}
              >
                <Text style={[
                  styles.tagText,
                  selectedTriggers.includes(trigger.id) && styles.selectedTagText
                ]}>
                  {trigger.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Insights Section */}
        {aiInsights && (
          <View style={styles.aiInsightsSection}>
            <Text style={styles.aiInsightsTitle}>AI Insights</Text>
            
            {/* Sentiment */}
            <View style={styles.insightCard}>
              <Text style={styles.insightLabel}>Sentiment</Text>
              <View style={styles.sentimentContainer}>
                <Text style={[
                  styles.sentimentText,
                  aiInsights.sentiment === 'positive' && styles.positiveSentiment,
                  aiInsights.sentiment === 'negative' && styles.negativeSentiment,
                  aiInsights.sentiment === 'neutral' && styles.neutralSentiment,
                ]}>
                  {aiInsights.sentiment.charAt(0).toUpperCase() + aiInsights.sentiment.slice(1)}
                </Text>
                <Text style={styles.intensityText}>Intensity: {aiInsights.intensity}/10</Text>
              </View>
            </View>
            
            {/* Patterns */}
            {aiInsights.patterns.length > 0 && (
              <View style={styles.insightCard}>
                <Text style={styles.insightLabel}>Patterns Detected</Text>
                {aiInsights.patterns.map((pattern, index) => (
                  <Text key={index} style={styles.patternText}>• {pattern}</Text>
                ))}
              </View>
            )}
            
            {/* Suggestions */}
            {aiInsights.suggestions.length > 0 && (
              <View style={styles.insightCard}>
                <Text style={styles.insightLabel}>Suggestions</Text>
                {aiInsights.suggestions.map((suggestion, index) => (
                  <View key={index} style={styles.suggestionContainer}>
                    <Text style={styles.suggestionText}>• {suggestion}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.closeInsightsButton}
              onPress={onBack}
            >
              <Text style={styles.closeInsightsButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {!aiInsights && (
        <TouchableOpacity style={styles.saveBottomButton} onPress={handleSave}>
          <Text style={styles.saveBottomButtonText}>Save Entry</Text>
        </TouchableOpacity>
      )}
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
  textSection: {
    marginBottom: SPACING.xl,
  },
  textHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  voiceButton: {
    padding: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    minHeight: 120,
    textAlignVertical: 'top',
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  quickEmotionsSection: {
    marginBottom: SPACING.xl,
  },
  quickEmotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickEmotionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  quickEmotionEmoji: {
    fontSize: 18,
  },
  quickEmotionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '500',
  },
  tagsSection: {
    marginBottom: SPACING.xl,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  selectedTag: {
    backgroundColor: COLORS.primary,
  },
  tagEmoji: {
    fontSize: 16,
  },
  tagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  selectedTagText: {
    color: 'white',
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
  // AI Insights Styles
  aiInsightsSection: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  aiInsightsTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  insightLabel: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  sentimentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentimentText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  positiveSentiment: {
    color: COLORS.success,
  },
  negativeSentiment: {
    color: COLORS.error,
  },
  neutralSentiment: {
    color: COLORS.textSecondary,
  },
  intensityText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
  patternText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  suggestionContainer: {
    marginBottom: SPACING.xs,
  },
  suggestionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    lineHeight: 20,
  },
  closeInsightsButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.xl,
    marginTop: SPACING.lg,
  },
  closeInsightsButtonText: {
    ...TYPOGRAPHY.body,
    color: 'white',
    fontWeight: '600',
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});

export default QuickLog;