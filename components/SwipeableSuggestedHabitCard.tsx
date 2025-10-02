import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { MicroHabitRecommendation } from '@/types/mood';
import { CheckCircle, Target, Sparkles, Heart, Activity, Brain, Plus, X } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import Confetti from '@/components/Confetti';

interface SwipeableSuggestedHabitCardProps {
  habit: MicroHabitRecommendation;
  onSwipeRight: (habit: MicroHabitRecommendation) => void;
  onSwipeLeft: (habit: MicroHabitRecommendation) => void;
  onAddHabit: (habit: MicroHabitRecommendation) => void;
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

const getMotivationQuote = (category: string): string => {
  const quotes: Record<string, string> = {
    sleep: "🌙 A well-rested mind is a powerful mind.",
    mood: "😊 Your mood is a choice, and you have the power to choose happiness.",
    health: "💪 Your body is your most priceless possession. Take care of it.",
    intimacy: "❤️ Connection is the heartbeat of a meaningful life.",
    anxiety: "😌 Breathe deeply, trust yourself, and take it one step at a time.",
    mentalClarity: "🧠 Clarity comes from action, not overthinking.",
    mindfulness: "🧘‍♀️ Be present in the moment, for it is all we truly have.",
    default: "🌟 Consistency is the key to lasting change."
  };
  
  return quotes[category] || quotes.default;
};

// Motivational messages for the button
const motivationalMessages = [
  "🎉 Added!",
  "💪 Habit Unlocked!",
  "🔥 You're On a Roll!",
  "✅ Great Choice!"
];

// Motivational quotes for the bottom of the card
const bottomMotivationalQuotes = [
  "🌙 Your future self will thank you.",
  "🧠 A clearer, calmer mind starts here.",
  "💤 Better nights = better days.",
  "❤️ Progress, not perfection."
];

const SwipeableSuggestedHabitCard: React.FC<SwipeableSuggestedHabitCardProps> = ({ 
  habit, 
  onSwipeRight,
  onSwipeLeft,
  onAddHabit
}) => {
  const translateX = useSharedValue(0);
  const motivationQuote = habit.motivationNudge || getMotivationQuote(habit.category);
  const [buttonText, setButtonText] = useState("Add to My Habits ✅");
  const [showConfetti, setShowConfetti] = useState(false);
  
  const handleConfettiComplete = () => {
    // Confetti animation complete
  };
  
  // Get a random motivational quote for the bottom of the card
  const [bottomMotivationQuote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * bottomMotivationalQuotes.length);
    return bottomMotivationalQuotes[randomIndex];
  });

  const handleSwipeRight = () => {
    onSwipeRight(habit);
  };

  const handleSwipeLeft = () => {
    onSwipeLeft(habit);
  };

  const handleAddHabitPress = () => {
    // Change button text to motivational message
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    setButtonText(motivationalMessages[randomIndex]);
    
    // Show confetti effect
    setShowConfetti(true);
    
    // Call the onAddHabit callback
    onAddHabit(habit);
    
    // Restore button text after 1.5 seconds
    setTimeout(() => {
      setButtonText("Add to My Habits ✅");
      setShowConfetti(false);
    }, 1500);
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
          <Plus color="white" size={20} />
          <Text style={styles.actionText}>Add</Text>
        </View>
      </Animated.View>

      {/* Left Actions (Dismiss) */}
      <Animated.View style={[styles.leftActions, leftActionsStyle]}>
        <View style={[styles.actionButton, styles.dismissAction]}>
          <X color="white" size={20} />
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
            <View style={styles.suggestedBadge}>
              <Text style={styles.suggestedBadgeText}>✨ Suggested</Text>
            </View>
          </View>
          
          <Text style={styles.habitTitle}>{habit.title}</Text>
          <Text style={styles.habitDescription}>{habit.description}</Text>
          
          <Text style={styles.motivationText}>"{motivationQuote}"</Text>
          
          {/* Add Habit Button inside the card */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddHabitPress}
          >
            <Text style={styles.addButtonText}>{buttonText}</Text>
          </TouchableOpacity>
          
          {/* Motivational quote at the bottom */}
          <Text style={styles.bottomMotivationText}>{bottomMotivationQuote}</Text>
          
          {/* Confetti effect */}
          <Confetti visible={showConfetti} onComplete={handleConfettiComplete} />
        </Animated.View>
      </PanGestureHandler>
      
      {/* Instruction Text */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>⬅ Swipe left to skip or ➡ swipe right to add.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
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
    position: 'relative',
    zIndex: 2,
    overflow: 'hidden', // To contain confetti effect
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
  suggestedBadge: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  suggestedBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
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
  motivationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS.sm,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignSelf: 'flex-end',
    marginTop: SPACING.sm,
  },
  addButtonText: {
    ...TYPOGRAPHY.caption,
    color: 'white',
    fontWeight: '600',
  },
  bottomMotivationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  instructionContainer: {
    alignItems: 'center',
    marginTop: SPACING.sm,
    zIndex: 0,
  },
  instructionText: {
    ...TYPOGRAPHY.small,
    color: COLORS.warning,
    fontStyle: 'italic',
  },
});

export default SwipeableSuggestedHabitCard;