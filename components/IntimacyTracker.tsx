import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { MOODS } from '@/constants/moods';

interface IntimacyEntry {
  type: 'solo' | 'couple';
  orgasmed: boolean;
  place: string;
  toys: boolean;
  timeToSleep: number;
  moodBefore: number;
  moodAfter: number;
}

interface IntimacyTrackerProps {
  onEntryChange?: (entry: Partial<IntimacyEntry>) => void;
  initialEntry?: Partial<IntimacyEntry>;
}

export default function IntimacyTracker({ 
  onEntryChange, 
  initialEntry = {} 
}: IntimacyTrackerProps) {
  const [type, setType] = useState<'solo' | 'couple'>(initialEntry.type || 'solo');
  const [orgasmed, setOrgasmed] = useState<boolean>(initialEntry.orgasmed ?? false);
  const [place, setPlace] = useState<string>(initialEntry.place || '');
  const [toys, setToys] = useState<boolean>(initialEntry.toys ?? false);
  const [timeToSleep, setTimeToSleep] = useState<number>(initialEntry.timeToSleep || 0);
  const [moodBefore, setMoodBefore] = useState<number>(initialEntry.moodBefore || 3);
  const [moodAfter, setMoodAfter] = useState<number>(initialEntry.moodAfter || 3);

  // Update parent when any value changes - but only when values actually change
  const notifyParent = (changes: Partial<IntimacyEntry>) => {
    if (onEntryChange && typeof onEntryChange === 'function') {
      onEntryChange(changes);
    }
  };

  const handleTypeChange = (newType: 'solo' | 'couple') => {
    if (newType !== type) {
      setType(newType);
      notifyParent({ type: newType });
    }
  };

  const handleOrgasmedChange = (value: boolean) => {
    if (value !== orgasmed) {
      setOrgasmed(value);
      notifyParent({ orgasmed: value });
    }
  };

  const handlePlaceChange = (value: string) => {
    if (value !== place) {
      setPlace(value);
      notifyParent({ place: value });
    }
  };

  const handleToysChange = (value: boolean) => {
    if (value !== toys) {
      setToys(value);
      notifyParent({ toys: value });
    }
  };

  const handleTimeToSleepChange = (value: number) => {
    if (value !== timeToSleep) {
      setTimeToSleep(value);
      notifyParent({ timeToSleep: value });
    }
  };

  const handleMoodBeforeChange = (value: number) => {
    if (value !== moodBefore) {
      setMoodBefore(value);
      notifyParent({ moodBefore: value });
    }
  };

  const handleMoodAfterChange = (value: number) => {
    if (value !== moodAfter) {
      setMoodAfter(value);
      notifyParent({ moodAfter: value });
    }
  };

  // Create a simple slider using TouchableOpacity components
  const renderTimeToSleepSlider = () => {
    const options = [0, 15, 30, 45, 60, 75, 90, 105, 120];
    
    return (
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Time to fall asleep after intimacy:</Text>
        <View style={styles.sliderOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.sliderOption,
                timeToSleep === option && styles.sliderOptionSelected
              ]}
              onPress={() => handleTimeToSleepChange(option)}
            >
              <Text style={[
                styles.sliderOptionText,
                timeToSleep === option && styles.sliderOptionTextSelected
              ]}>
                {option === 0 ? 'None' : `${option}m`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Intimacy Tracker</Text>
      
      {/* Solo or Couple Toggle */}
      <View style={styles.toggleSection}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              type === 'solo' && styles.toggleButtonActive
            ]}
            onPress={() => handleTypeChange('solo')}
          >
            <Text style={[
              styles.toggleText,
              type === 'solo' && styles.toggleTextActive
            ]}>
              Solo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              type === 'couple' && styles.toggleButtonActive
            ]}
            onPress={() => handleTypeChange('couple')}
          >
            <Text style={[
              styles.toggleText,
              type === 'couple' && styles.toggleTextActive
            ]}>
              Couple
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Orgasmed Toggle */}
      <View style={styles.switchSection}>
        <Text style={styles.label}>Orgasmed</Text>
        <Switch
          value={orgasmed}
          onValueChange={handleOrgasmedChange}
          trackColor={{ false: COLORS.backgroundSecondary, true: COLORS.primary }}
          thumbColor={orgasmed ? 'white' : COLORS.textTertiary}
        />
      </View>

      {/* Place */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Place</Text>
        <TextInput
          style={styles.textInput}
          value={place}
          onChangeText={handlePlaceChange}
          placeholder="Where did it happen?"
          placeholderTextColor={COLORS.textTertiary}
        />
      </View>

      {/* Toys Toggle */}
      <View style={styles.switchSection}>
        <Text style={styles.label}>Toys Used</Text>
        <Switch
          value={toys}
          onValueChange={handleToysChange}
          trackColor={{ false: COLORS.backgroundSecondary, true: COLORS.primary }}
          thumbColor={toys ? 'white' : COLORS.textTertiary}
        />
      </View>

      {/* Time to Sleep */}
      <View style={styles.sliderSection}>
        {renderTimeToSleepSlider()}
        {timeToSleep > 0 && (
          <Text style={styles.sliderValue}>
            Selected: {timeToSleep} minutes
          </Text>
        )}
      </View>

      {/* Mood Before */}
      <View style={styles.moodSection}>
        <Text style={styles.label}>Mood Before</Text>
        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodOption,
                moodBefore === mood.id && styles.moodOptionSelected
              ]}
              onPress={() => handleMoodBeforeChange(mood.id)}
            >
              <View style={[
                styles.moodCircle,
                { backgroundColor: mood.color },
                moodBefore === mood.id && styles.moodCircleSelected
              ]}>
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Mood After */}
      <View style={styles.moodSection}>
        <Text style={styles.label}>Mood After</Text>
        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodOption,
                moodAfter === mood.id && styles.moodOptionSelected
              ]}
              onPress={() => handleMoodAfterChange(mood.id)}
            >
              <View style={[
                styles.moodCircle,
                { backgroundColor: mood.color },
                moodAfter === mood.id && styles.moodCircleSelected
              ]}>
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  toggleSection: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: 'white',
  },
  switchSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  textInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    ...TYPOGRAPHY.body,
  },
  sliderSection: {
    marginBottom: SPACING.lg,
  },
  sliderContainer: {
    marginBottom: SPACING.sm,
  },
  sliderLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  sliderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  sliderOption: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  sliderOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  sliderOptionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  sliderOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  sliderValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  moodSection: {
    marginBottom: SPACING.lg,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    alignItems: 'center',
  },
  moodOptionSelected: {
    transform: [{ scale: 1.1 }],
  },
  moodCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodCircleSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  moodEmoji: {
    fontSize: 20,
  },
});