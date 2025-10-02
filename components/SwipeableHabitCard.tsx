import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { MicroHabitRecommendation } from '@/types/mood';
import { CheckCircle, Target, Flame, Sparkles, Heart, Activity, Brain, Plus, X } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';

interface SwipeableHabitCardProps {
  habit: MicroHabitRecommendation;
  onSwipeRight: (habit: MicroHabitRecommendation) => void;
  onSwipeLeft: (habit: MicroHabitRecommendation) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'sleep':
      return <Target color={COLORS.primary} size={16} />;
    case 'mindfulness':
      return <Sparkles color={COLORS.success} size={16} />;
    case 'intimacy':
      return <Heart color="#FF69B4" size={16} />;
    case 'mood':
      return <Heart color={COLORS.error} size={16} />;
    case 'health':
      return <Activity color={COLORS.warning} size={16} />;
    case 'anxiety':
      return <Activity color={COLORS.warning} size={16} />;
    case 'mentalClarity':
      return <Brain color={COLORS.success} size={16} />;
    default:
      return <CheckCircle color={COLORS.textSecondary} size={16} />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'sleep':
      return COLORS.primary;
    case 'mindfulness':
      return COLORS.success;
    case 'intimacy':
      return '#FF69B4';
    case 'mood':
      return COLORS.error;
    case 'health':
      return COLORS.warning;
    case 'anxiety':
      return COLORS.warning;
    case 'mentalClarity':
      return COLORS.success;
    default:
      return COLORS.textSecondary;
  }
};

const SwipeableHabitCard: React.FC<SwipeableHabitCardProps> = ({ 
  habit, 
  onSwipeRight,
  onSwipeLeft
}) => {
  const translateX = useSharedValue(0);

  const handleSwipeRight = () => {
    onSwipeRight(habit);
  };

  const handleSwipeLeft = () => {
    onSwipeLeft(habit);
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number }>({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      if (event.translationX > 100) {
        // Swipe right - Add habit
        translateX.value = withSpring(500, {}, () => {
          runOnJS(handleSwipeRight)();
        });
      } else if (event.translationX < -100) {
        // Swipe left - Dismiss
        translateX.value = withSpring(-500, {}, () => {
          runOnJS(handleSwipeLeft)();
        });
      } else {
        // Return to original position
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const rightActionsStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value > 0 ? translateX.value / 100 : 0,
    };
  });

  const leftActionsStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value < 0 ? -translateX.value / 100 : 0,
    };
  });

  return (
    <View style={styles.container}>
      {/* Right Actions (Add) */}
      <Animated.View style={[styles.rightActions, rightActionsStyle]}>
        <View style={[styles.actionButton, styles.addAction]}>
          <Plus color="white" size={24} />
          <Text style={styles.actionText}>Add</Text>
        </View>
      </Animated.View>

      {/* Left Actions (Dismiss) */}
      <Animated.View style={[styles.leftActions, leftActionsStyle]}>
        <View style={[styles.actionButton, styles.dismissAction]}>
          <X color="white" size={24} />
          <Text style={styles.actionText}>Dismiss</Text>
        </View>
      </Animated.View>

      {/* Habit Card */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.habitCard, animatedStyle]}>
          <View style={styles.habitHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(habit.category) + '20' }]}>
              {getCategoryIcon(habit.category)}
              <Text style={[styles.categoryText, { color: getCategoryColor(habit.category) }]}>
                {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.habitTitle}>{habit.title}</Text>
          <Text style={styles.habitDescription}>{habit.description}</Text>
          
          <View style={styles.streakContainer}>
            <Flame color={COLORS.warning} size={16} />
            <Text style={styles.streakText}>New habit suggestion</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 180,
    position: 'relative',
  },
  habitCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: 280,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'absolute',
    zIndex: 2,
  },
  rightActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  leftActions: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginVertical: SPACING.xs,
  },
  addAction: {
    backgroundColor: COLORS.success,
  },
  dismissAction: {
    backgroundColor: COLORS.error,
  },
  actionText: {
    ...TYPOGRAPHY.caption,
    color: 'white',
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  habitTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  habitDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  streakText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
    fontWeight: '600',
  },
});

export default SwipeableHabitCard;