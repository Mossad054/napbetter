import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Mood } from '@/types/mood';
import { COLORS, SPACING } from '@/constants/theme';

interface MoodButtonProps {
  mood: Mood;
  selected: boolean;
  onPress: () => void;
  size?: number;
}

export default function MoodButton({ mood, selected, onPress, size = 80 }: MoodButtonProps) {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: selected ? 1.1 : 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity onPress={handlePress} style={styles.container}>
        <Animated.View
          style={[
            styles.button,
            { 
              width: size, 
              height: size, 
              borderRadius: size / 2,
              backgroundColor: mood.color,
            },
            selected && styles.selected,
          ]}
        >
          <Text style={[styles.emoji, { fontSize: size * 0.4 }]}>
            {mood.emoji}
          </Text>
        </Animated.View>
        <Text style={[styles.label, { fontSize: size * 0.15 }]}>{mood.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  selected: {
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    transform: [{ scale: 1.1 }],
  },
  emoji: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  label: {
    marginTop: SPACING.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});