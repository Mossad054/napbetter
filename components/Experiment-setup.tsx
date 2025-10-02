import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  Activity, 
  Heart, 
  Moon, 
  Brain, 
  Calendar,
  Bell,
  Check
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';

const PRESET_ACTIVITIES = [
  { id: 'exercise', name: 'Exercise', emoji: '🏋️' },
  { id: 'meditation', name: 'Meditation', emoji: '🧘' },
  { id: 'cold-shower', name: 'Cold Shower', emoji: '🚿' },
  { id: 'no-screens', name: 'No Screen Time', emoji: '📵' },
];

const OUTCOMES = [
  { id: 'mood', name: 'Mood', icon: Heart, description: 'How you feel emotionally after the activity' },
  { id: 'sleep', name: 'Sleep Quality', icon: Moon, description: 'How well you sleep on days you do this activity' },
  { id: 'clarity', name: 'Mental Clarity', icon: Brain, description: 'How clear your thinking is after the activity' },
  { id: 'stress', name: 'Stress/Anxiety', icon: Activity, description: 'How this activity affects your stress levels' },
];

const DURATIONS = [
  { id: '3', name: '3 days' },
  { id: '7', name: '7 days' },
  { id: '14', name: '14 days' },
];

const TIMES_OF_DAY = [
  { id: 'morning', name: 'Morning' },
  { id: 'evening', name: 'Evening' },
  { id: 'anytime', name: 'Anytime' },
];

export default function ExperimentSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [customActivity, setCustomActivity] = useState('');
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>(['mood', 'sleep', 'clarity']);
  const [duration, setDuration] = useState('7');
  const [timeOfDay, setTimeOfDay] = useState('anytime');
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId);
    if (activityId !== 'custom') {
      setCustomActivity('');
    }
  };

  const toggleOutcome = (outcomeId: string) => {
    if (selectedOutcomes.includes(outcomeId)) {
      setSelectedOutcomes(selectedOutcomes.filter(id => id !== outcomeId));
    } else {
      setSelectedOutcomes([...selectedOutcomes, outcomeId]);
    }
  };

  const getSelectedActivityName = () => {
    if (selectedActivity === 'custom') {
      return customActivity || 'Custom Activity';
    }
    const activity = PRESET_ACTIVITIES.find(a => a.id === selectedActivity);
    return activity ? `${activity.emoji} ${activity.name}` : 'Activity';
  };

  const handleStartExperiment = () => {
    if (!selectedActivity) {
      Alert.alert('Select Activity', 'Please select an activity to track');
      return;
    }
    
    if (selectedActivity === 'custom' && !customActivity.trim()) {
      Alert.alert('Enter Activity', 'Please enter a name for your custom activity');
      return;
    }
    
    if (selectedOutcomes.length === 0) {
      Alert.alert('Select Outcomes', 'Please select at least one outcome to track');
      return;
    }

    // In a real app, this would save the experiment and navigate to the dashboard
    Alert.alert(
      'Experiment Started!',
      `Your experiment "${getSelectedActivityName()}" is now active. You'll receive daily reminders to track your progress.`,
      [
        {
          text: 'View Dashboard',
          onPress: () => router.push('/(tabs)/home'), // In a real app, this would go to the experiment dashboard
        },
      ]
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 1: Choose Activity</Text>
      <Text style={styles.stepSubtitle}>Select an activity to track or create your own</Text>
      
      <View style={styles.optionsContainer}>
        {PRESET_ACTIVITIES.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={[
              styles.optionCard,
              selectedActivity === activity.id && styles.selectedOptionCard,
            ]}
            onPress={() => handleActivitySelect(activity.id)}
          >
            <Text style={styles.optionEmoji}>{activity.emoji}</Text>
            <Text style={styles.optionText}>{activity.name}</Text>
            {selectedActivity === activity.id && (
              <Check color={COLORS.primary} size={20} style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedActivity === 'custom' && styles.selectedOptionCard,
          ]}
          onPress={() => handleActivitySelect('custom')}
        >
          <Text style={styles.optionEmoji}>✏️</Text>
          <Text style={styles.optionText}>Custom Activity</Text>
          {selectedActivity === 'custom' && (
            <Check color={COLORS.primary} size={20} style={styles.checkIcon} />
          )}
        </TouchableOpacity>
        
        {selectedActivity === 'custom' && (
          <TextInput
            style={styles.customInput}
            placeholder="Enter custom activity name"
            value={customActivity}
            onChangeText={setCustomActivity}
          />
        )}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 2: Choose Outcomes</Text>
      <Text style={styles.stepSubtitle}>Select which metrics you want to measure</Text>
      
      <View style={styles.optionsContainer}>
        {OUTCOMES.map((outcome) => {
          const IconComponent = outcome.icon;
          return (
            <TouchableOpacity
              key={outcome.id}
              style={[
                styles.outcomeCard,
                selectedOutcomes.includes(outcome.id) && styles.selectedOutcomeCard,
              ]}
              onPress={() => toggleOutcome(outcome.id)}
            >
              <View style={styles.outcomeHeader}>
                <IconComponent 
                  color={selectedOutcomes.includes(outcome.id) ? COLORS.primary : COLORS.textSecondary} 
                  size={20} 
                />
                <Text style={[
                  styles.outcomeTitle,
                  selectedOutcomes.includes(outcome.id) && styles.selectedOutcomeTitle,
                ]}>
                  {outcome.name}
                </Text>
              </View>
              <Text style={styles.outcomeDescription}>{outcome.description}</Text>
              <View style={[
                styles.checkbox,
                selectedOutcomes.includes(outcome.id) && styles.checkedCheckbox,
              ]}>
                {selectedOutcomes.includes(outcome.id) && (
                  <Check color="white" size={16} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 3: Duration & Frequency</Text>
      <Text style={styles.stepSubtitle}>How long do you want to run this experiment?</Text>
      
      <View style={styles.optionsContainer}>
        <Text style={styles.sectionLabel}>Duration</Text>
        <View style={styles.inlineOptions}>
          {DURATIONS.map((dur) => (
            <TouchableOpacity
              key={dur.id}
              style={[
                styles.inlineOption,
                duration === dur.id && styles.selectedInlineOption,
              ]}
              onPress={() => setDuration(dur.id)}
            >
              <Text style={[
                styles.inlineOptionText,
                duration === dur.id && styles.selectedInlineOptionText,
              ]}>
                {dur.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.sectionLabel}>Time of Day</Text>
        <View style={styles.inlineOptions}>
          {TIMES_OF_DAY.map((time) => (
            <TouchableOpacity
              key={time.id}
              style={[
                styles.inlineOption,
                timeOfDay === time.id && styles.selectedInlineOption,
              ]}
              onPress={() => setTimeOfDay(time.id)}
            >
              <Text style={[
                styles.inlineOptionText,
                timeOfDay === time.id && styles.selectedInlineOptionText,
              ]}>
                {time.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 4: Logging Preferences</Text>
      <Text style={styles.stepSubtitle}>Set up how you'll track your progress</Text>
      
      <View style={styles.optionsContainer}>
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceTitle}>Daily Reminders</Text>
            <Text style={styles.preferenceDescription}>
              Receive notifications to log your daily results
            </Text>
          </View>
          <Switch
            trackColor={{ false: COLORS.backgroundSecondary, true: COLORS.primary }}
            thumbColor={remindersEnabled ? 'white' : COLORS.textSecondary}
            onValueChange={setRemindersEnabled}
            value={remindersEnabled}
          />
        </View>
        
        <View style={styles.infoBox}>
          <Bell color={COLORS.primary} size={20} />
          <Text style={styles.infoText}>
            You'll receive a one-tap logging prompt each day to track your {getSelectedActivityName()}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 5: Confirm Experiment</Text>
      <Text style={styles.stepSubtitle}>Review your experiment details</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Experiment Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Activity:</Text>
          <Text style={styles.summaryValue}>{getSelectedActivityName()}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tracking:</Text>
          <View style={styles.summaryTags}>
            {selectedOutcomes.map((outcomeId) => {
              const outcome = OUTCOMES.find(o => o.id === outcomeId);
              return outcome ? (
                <View key={outcomeId} style={styles.summaryTag}>
                  <Text style={styles.summaryTagText}>{outcome.name}</Text>
                </View>
              ) : null;
            })}
          </View>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration:</Text>
          <Text style={styles.summaryValue}>
            {DURATIONS.find(d => d.id === duration)?.name || `${duration} days`}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Time:</Text>
          <Text style={styles.summaryValue}>
            {TIMES_OF_DAY.find(t => t.id === timeOfDay)?.name || timeOfDay}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Reminders:</Text>
          <Text style={styles.summaryValue}>
            {remindersEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.startButton}
        onPress={handleStartExperiment}
      >
        <Text style={styles.startButtonText}>Start Experiment</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Experiment Setup</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.navButton, step === 1 && styles.disabledButton]}
          onPress={() => step > 1 && setStep(step - 1)}
          disabled={step === 1}
        >
          <Text style={[styles.navButtonText, step === 1 && styles.disabledButtonText]}>
            Back
          </Text>
        </TouchableOpacity>
        
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4, 5].map((stepNum) => (
            <View 
              key={stepNum}
              style={[
                styles.stepDot,
                step === stepNum && styles.activeStepDot,
              ]}
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => {
            if (step < 5) {
              setStep(step + 1);
            } else {
              handleStartExperiment();
            }
          }}
        >
          <Text style={styles.navButtonText}>
            {step === 5 ? 'Start' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    fontWeight: '600',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedOptionCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  optionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  checkIcon: {
    marginLeft: SPACING.sm,
  },
  customInput: {
    ...TYPOGRAPHY.body,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  outcomeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedOutcomeCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  outcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  outcomeTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  selectedOutcomeTitle: {
    color: COLORS.primary,
  },
  outcomeDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  checkedCheckbox: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sectionLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  inlineOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  inlineOption: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedInlineOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  inlineOptionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
  },
  selectedInlineOptionText: {
    color: 'white',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  preferenceText: {
    flex: 1,
    marginRight: SPACING.md,
  },
  preferenceTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  preferenceDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'flex-start',
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  summaryLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: '600',
    width: 100,
  },
  summaryValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  summaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: SPACING.xs,
  },
  summaryTag: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  summaryTagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  startButtonText: {
    ...TYPOGRAPHY.body,
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: COLORS.textSecondary,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
    marginHorizontal: SPACING.xs,
  },
  activeStepDot: {
    backgroundColor: COLORS.primary,
  },
});