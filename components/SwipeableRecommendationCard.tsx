import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { Lightbulb, Plus, X } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import Toast from '@/components/Toast';
import Confetti from '@/components/Confetti';

interface DailyRecommendation {
  id: string;
  date: string;
  type: 'activity' | 'intimacy' | 'sleep' | 'mood';
  suggestion: string;
  reason: string;
  wasFollowed?: boolean;
  effectiveness?: number;
}

interface SwipeableRecommendationCardProps {
  recommendation: DailyRecommendation;
  onAddHabit: (recommendation: DailyRecommendation) => void;
  onDismiss: (id: string) => void;
}

const getRecommendationIcon = (type: DailyRecommendation['type']) => {
  switch (type) {
    case 'activity':
      return '🏋️';
    case 'intimacy':
      return '❤️';
    case 'sleep':
      return '🌙';
    case 'mood':
      return '😊';
    default:
      return '💡';
  }
};

const SwipeableRecommendationCard: React.FC<SwipeableRecommendationCardProps> = ({ 
  recommendation, 
  onAddHabit,
  onDismiss
}) => {
  const translateX = useSharedValue(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleAddHabit = () => {
    onAddHabit(recommendation);
    setShowConfetti(true);
    setToastMessage('Added to Active Habits ✅');
    setToastVisible(true);
  };

  const handleDismiss = () => {
    onDismiss(recommendation.id);
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
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
          runOnJS(handleAddHabit)();
        });
      } else if (event.translationX < -100) {
        // Swipe left - Dismiss
        translateX.value = withSpring(-500, {}, () => {
          runOnJS(handleDismiss)();
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

      {/* Recommendation Card */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.recommendationCard, animatedStyle]}>
          <View style={styles.recommendationHeader}>
            <Text style={styles.icon}>{getRecommendationIcon(recommendation.type)}</Text>
            <TouchableOpacity 
              style={styles.dismissButton}
              onPress={handleDismiss}
            >
              <X color={COLORS.textSecondary} size={20} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.recommendationText}>{recommendation.suggestion}</Text>
          <Text style={styles.recommendationReason}>{recommendation.reason}</Text>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddHabit}
          >
            <Text style={styles.addButtonText}>+ Add to My Habits</Text>
          </TouchableOpacity>
          
          {/* Confetti effect */}
          <Confetti visible={showConfetti} onComplete={handleConfettiComplete} />
        </Animated.View>
      </PanGestureHandler>
      
      {/* Instruction Text */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>⬅ Swipe left to skip or ➡ swipe right to add.</Text>
      </View>
      
      {/* Toast Notification */}
      <Toast 
        message={toastMessage} 
        visible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    position: 'relative',
  },
  recommendationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    width: 280,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    zIndex: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 24,
  },
  dismissButton: {
    padding: SPACING.xs,
  },
  recommendationText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  recommendationReason: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    ...TYPOGRAPHY.caption,
    color: 'white',
    fontWeight: '600',
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
  instructionContainer: {
    alignItems: 'center',
    marginTop: SPACING.sm,
    zIndex: 0,
  },
  instructionText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

export default SwipeableRecommendationCard;