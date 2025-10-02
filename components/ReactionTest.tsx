import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';

/**
 * Gamified Mental Clarity Test — Reaction Time Tap Test
 *
 * How to use:
 * - Import and render <ReactionTimeTest /> in your screen/component.
 * - Optional props: rounds, minDelayMs, maxDelayMs
 *
 * Features:
 * - Start screen with brief instructions
 * - N rounds with random delays before "Tap!" appears
 * - Tracks reaction time, false starts, accuracy, and score
 * - Animated feedback (scale + color changes)
 * - Minimal, playful UI with large tappable area
 * - Results screen with total score, average reaction, and an encouraging message
 *
 * No additional configuration or libraries required.
 */

// Types for game phases
type Phase = 'intro' | 'waiting' | 'tap-now' | 'result';

// Props for configuring the game
type ReactionTimeTestProps = {
  rounds?: number; // total rounds
  minDelayMs?: number; // minimum delay before "Tap!" appears
  maxDelayMs?: number; // maximum delay before "Tap!" appears
};

// State managed by reducer
type State = {
  phase: Phase;
  currentRound: number; // 1-based
  roundsTotal: number;
  reactionTimes: number[]; // only successful taps
  falseStarts: number; // premature taps
  score: number; // cumulative score
  startTimestamp: number | null; // when "Tap!" appeared
};

type Action =
  | { type: 'START'; roundsTotal: number }
  | { type: 'SCHEDULE_TAP' } // waiting phase
  | { type: 'SHOW_TAP'; timestamp: number } // tap-now phase
  | { type: 'FALSE_START' } // tapped too early
  | { type: 'SUCCESS_TAP'; reactionMs: number; scoreDelta: number }
  | { type: 'NEXT_ROUND' }
  | { type: 'FINISH' }
  | { type: 'RESET' };

const initialState: State = {
  phase: 'intro',
  currentRound: 0,
  roundsTotal: 5,
  reactionTimes: [],
  falseStarts: 0,
  score: 0,
  startTimestamp: null,
};

// Reducer for predictable state transitions
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return {
        phase: 'waiting',
        currentRound: 1,
        roundsTotal: action.roundsTotal,
        reactionTimes: [],
        falseStarts: 0,
        score: 0,
        startTimestamp: null,
      };
    case 'SCHEDULE_TAP':
      return {
        ...state,
        phase: 'waiting',
        startTimestamp: null,
      };
    case 'SHOW_TAP':
      return {
        ...state,
        phase: 'tap-now',
        startTimestamp: action.timestamp,
      };
    case 'FALSE_START':
      return {
        ...state,
        falseStarts: state.falseStarts + 1,
        // Stay in waiting phase; will reschedule
      };
    case 'SUCCESS_TAP':
      return {
        ...state,
        reactionTimes: [...state.reactionTimes, action.reactionMs],
        score: state.score + action.scoreDelta,
        startTimestamp: null,
      };
    case 'NEXT_ROUND': {
      const isLast = state.currentRound >= state.roundsTotal;
      return {
        ...state,
        phase: isLast ? 'result' : 'waiting',
        currentRound: isLast ? state.currentRound : state.currentRound + 1,
      };
    }
    case 'FINISH':
      return { ...state, phase: 'result' };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Utility to clamp values
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/**
 * Scoring:
 * - Base score per successful tap: max(0, 1000 - reactionMs)
 * - We also give a small bonus for super-fast reactions
 * - False starts do not directly subtract points, but reduce accuracy
 */
function calculateScoreDelta(reactionMs: number): number {
  const base = Math.max(0, 1000 - reactionMs);
  const bonus = reactionMs < 200 ? 100 : reactionMs < 250 ? 50 : reactionMs < 300 ? 20 : 0;
  return base + bonus;
}

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(280, Math.floor(width * 0.75));

// Note: This component is kept for backward compatibility but the new ReactionTimeTest component
// in components/ReactionTimeTest.tsx should be used instead for the mental clarity tests
const ReactionTimeTest: React.FC<ReactionTimeTestProps> = ({
  rounds = 5,
  minDelayMs = 800,
  maxDelayMs = 2500,
}) => {
  console.log('ReactionTimeTest rendered');
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    roundsTotal: rounds,
  });

  // Animated values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(0)).current; // 0 = waiting (red), 1 = tap-now (green)
  const feedbackOpacity = useRef(new Animated.Value(0)).current; // for "Too soon!" or reaction time flash

  // Timeout management
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Animate background based on phase
  useEffect(() => {
    const toValue = state.phase === 'tap-now' ? 1 : 0;
    Animated.timing(bgAnim, {
      toValue,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false, // animating background color (non-transform)
    }).start();
  }, [state.phase, bgAnim]);

  // Schedule the random delay to show "Tap!" when in waiting phase
  useEffect(() => {
    if (state.phase !== 'waiting') return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const delay = Math.floor(
      Math.random() * (maxDelayMs - minDelayMs + 1) + minDelayMs
    );

    timeoutRef.current = setTimeout(() => {
      dispatch({ type: 'SHOW_TAP', timestamp: Date.now() });
      timeoutRef.current = null;
      // pulse animation when "Tap!" appears
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 120,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 10,
        }),
      ]).start();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [state.phase, state.currentRound, minDelayMs, maxDelayMs, scaleAnim]);

  // Handlers
  const handleStart = () => {
    dispatch({ type: 'START', roundsTotal: rounds });
  };

  const handleTap = () => {
    if (state.phase === 'waiting') {
      // False start: tapped too early
      dispatch({ type: 'FALSE_START' });
      // Show feedback
      showFeedback();
      // Reschedule tap for the same round
      dispatch({ type: 'SCHEDULE_TAP' });
      return;
    }

    if (state.phase === 'tap-now' && state.startTimestamp) {
      const reactionMs = Date.now() - state.startTimestamp;
      const scoreDelta = calculateScoreDelta(reactionMs);
      dispatch({ type: 'SUCCESS_TAP', reactionMs, scoreDelta });

      // Flash reaction feedback
      showFeedback();

      // Proceed to next round or finish
      setTimeout(() => {
        dispatch({ type: 'NEXT_ROUND' });
      }, 350);
    }
  };

  const handleRestart = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    dispatch({ type: 'RESET' });
  };

  // Simple encouraging message based on average reaction time and accuracy
  const averageReaction = useMemo(() => {
    if (state.reactionTimes.length === 0) return 0;
    const sum = state.reactionTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / state.reactionTimes.length);
  }, [state.reactionTimes]);

  const accuracy = useMemo(() => {
    const attempts = state.reactionTimes.length + state.falseStarts;
    if (attempts === 0) return 0;
    return Math.round((state.reactionTimes.length / attempts) * 100);
  }, [state.reactionTimes, state.falseStarts]);

  const encouragement = useMemo(() => {
    if (averageReaction === 0) return 'Nice warm-up!';
    if (averageReaction < 220 && accuracy >= 90) return 'Lightning fast! Great focus!';
    if (averageReaction < 300 && accuracy >= 80) return 'Strong performance! Keep it up!';
    if (averageReaction < 380) return 'Good job! You’re getting sharper!';
    return 'Try again tomorrow! You’ve got this!';
  }, [averageReaction, accuracy]);

  // Feedback animation (opacity pulse)
  const showFeedback = () => {
    feedbackOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(feedbackOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        delay: 180,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Background color interpolation
  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ff6b6b', '#2ecc71'], // waiting (red) -> tap-now (green)
  });

  // Text color for contrast
  const foregroundColor = '#0b0b0b';

  // Round progress text
  const progressText =
    state.phase === 'intro'
      ? `Rounds: ${rounds}`
      : `Round ${clamp(state.currentRound, 1, state.roundsTotal)} of ${state.roundsTotal}`;

  // Displayed helper text
  const helperText =
    state.phase === 'intro'
      ? 'Tap “Start” and wait for green.\nTap as fast as you can!'
      : state.phase === 'waiting'
      ? 'Wait for green...'
      : state.phase === 'tap-now'
      ? 'Tap!'
      : 'Results';

  return (
    <View style={styles.container}>
      {/* Background */}
      <Animated.View style={[styles.full, { backgroundColor: bgColor }]} />

      {/* Header / Progress */}
      <View style={styles.header}>
        <Text style={styles.title}>Reaction Time Tap Test</Text>
        <Text style={styles.progress}>{progressText}</Text>
      </View>

      {/* Content */}
      {state.phase === 'intro' && (
        <View style={styles.centerContent}>
          <Text style={styles.instructions}>
            - You’ll play {rounds} short rounds.{'\n'}
            - Wait for the screen to turn green, then tap as fast as you can.{'\n'}
            - False starts don’t score, but they affect accuracy.
          </Text>
          <Pressable onPress={handleStart} style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}>
            <Text style={styles.primaryBtnText}>Start</Text>
          </Pressable>
        </View>
      )}

      {(state.phase === 'waiting' || state.phase === 'tap-now') && (
        <View style={styles.centerContent}>
          <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.circleText}>{helperText}</Text>
          </Animated.View>

          <Animated.View style={[styles.feedbackBubble, { opacity: feedbackOpacity }]}>
            <Text style={styles.feedbackText}>
              {state.phase === 'waiting' ? 'Too soon!' : 'Nice!'}
            </Text>
          </Animated.View>

          <Pressable
            onPress={handleTap}
            style={styles.tapArea}
            android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
            accessibilityRole="button"
            accessibilityLabel={state.phase === 'waiting' ? 'Wait' : 'Tap now'}
          >
            <Text style={[styles.tapHint, { color: foregroundColor }]}>
              {state.phase === 'waiting' ? 'Wait...' : 'Tap anywhere!'}
            </Text>
          </Pressable>

          <View style={styles.hud}>
            <Text style={styles.hudText}>Score: {state.score}</Text>
            <Text style={styles.hudText}>Accuracy: {accuracy}%</Text>
            <Text style={styles.hudText}>
              Avg: {state.reactionTimes.length ? `${averageReaction}ms` : '—'}
            </Text>
          </View>
        </View>
      )}

      {state.phase === 'result' && (
        <View style={styles.centerContent}>
          <Text style={styles.resultTitle}>All done!</Text>
          <View style={styles.resultCard}>
            <Text style={styles.resultRow}>Total Score: <Text style={styles.resultValue}>{state.score}</Text></Text>
            <Text style={styles.resultRow}>
              Average Reaction: <Text style={styles.resultValue}>
                {state.reactionTimes.length ? `${averageReaction} ms` : '—'}
              </Text>
            </Text>
            <Text style={styles.resultRow}>
              Accuracy: <Text style={styles.resultValue}>{accuracy}%</Text>
            </Text>
          </View>
          <Text style={styles.encouragement}>{encouragement}</Text>

          <Pressable onPress={handleRestart} style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}>
            <Text style={styles.primaryBtnText}>Play Again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default ReactionTimeTest;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  full: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    paddingTop: Platform.select({ ios: 56, android: 36, default: 28 }),
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0b0b0b',
  },
  progress: {
    marginTop: 4,
    fontSize: 14,
    color: '#0b0b0b',
    opacity: 0.8,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  instructions: {
    textAlign: 'center',
    fontSize: 16,
    color: '#0b0b0b',
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: '#0b0b0b',
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    minWidth: 140,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  circleText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0b0b0b',
  },
  tapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tapHint: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
  },
  hud: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  hudText: {
    fontSize: 12,
    color: '#0b0b0b',
    fontWeight: '700',
  },
  feedbackBubble: {
    position: 'absolute',
    bottom: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0b0b0b',
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0b0b0b',
    marginBottom: 12,
  },
  resultCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 12,
    width: '88%',
  },
  resultRow: {
    fontSize: 16,
    color: '#0b0b0b',
    marginBottom: 8,
  },
  resultValue: {
    fontWeight: '800',
  },
  encouragement: {
    fontSize: 16,
    color: '#0b0b0b',
    opacity: 0.9,
    marginBottom: 16,
    textAlign: 'center',
  },
});