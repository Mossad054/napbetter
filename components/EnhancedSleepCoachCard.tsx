import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Moon, Star, Bed, Lamp } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useMoodStore } from '@/hooks/mood-store';
import { SleepEntry } from '@/types/mood';

// Eye-catching headlines
const HEADLINES = [
  "🌙 Sleep Better Tonight",
  "🛌 Wake Up Refreshed",
  "✨ Transform Your Nights",
  "💤 Deep, Restful Sleep"
];

// Benefit summaries
const BENEFIT_SUMMARIES = [
  "Get guided playlists, routines & experiments to sleep deeper.",
  "Personalized tips to help you fall asleep faster and stay asleep.",
  "Discover what's keeping you awake and how to fix it.",
  "Unlock the secrets to waking up energized every morning."
];

const EnhancedSleepCoachCard: React.FC = () => {
  const router = useRouter();
  const { getSleepEntries } = useMoodStore();
  const [sleepData, setSleepData] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [headline, setHeadline] = useState("");
  const [benefitSummary, setBenefitSummary] = useState("");
  const [animation] = useState(new Animated.Value(0));

  // Rotate headlines and benefit summaries
  useEffect(() => {
    const randomHeadline = HEADLINES[Math.floor(Math.random() * HEADLINES.length)];
    const randomBenefit = BENEFIT_SUMMARIES[Math.floor(Math.random() * BENEFIT_SUMMARIES.length)];
    setHeadline(randomHeadline);
    setBenefitSummary(randomBenefit);
  }, []);

  // Load sleep data
  useEffect(() => {
    const loadSleepData = async () => {
      try {
        const entries = await getSleepEntries();
        setSleepData(entries);
      } catch (error) {
        console.error('Error loading sleep data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSleepData();
  }, [getSleepEntries]);

  // Start animation when component mounts
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0.98,
          duration: 2000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [animation]);

  // Calculate average sleep from last 7 days
  const calculateAverageSleep = () => {
    if (sleepData.length === 0) return null;
    
    // Get last 7 days of sleep data
    const recentSleep = sleepData.slice(0, 7);
    if (recentSleep.length === 0) return null;
    
    // Calculate average duration
    const totalDuration = recentSleep.reduce((sum, entry) => {
      return sum + (entry.duration || 0);
    }, 0);
    
    const averageDuration = totalDuration / recentSleep.length;
    return averageDuration;
  };

  // Format hours and minutes
  const formatHours = (hours: number) => {
    const fullHours = Math.floor(hours);
    const minutes = Math.round((hours - fullHours) * 60);
    return `${fullHours}h ${minutes}m`;
  };

  // Handle CTA button press with animation
  const handlePressIn = () => {
    Animated.timing(animation, {
      toValue: 0.96,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    // Navigate to sleep coach tab
    router.push('/(tabs)/sleep');
  };

  const averageSleep = calculateAverageSleep();
  const animatedStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.02]
        })
      }
    ],
    opacity: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1]
    })
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Background with gradient effect */}
      <View style={styles.backgroundGradient} />
      
      {/* Sleep illustration */}
      <Animated.View style={[styles.illustrationContainer, {
        transform: [{
          translateY: animation.interpolate({
            inputRange: [0.98, 1],
            outputRange: [0, -5]
          })
        }]
      }]}> 
        <Moon color="rgba(255, 255, 255, 0.8)" size={24} style={styles.moon} />
        <Star color="rgba(255, 255, 255, 0.6)" size={16} style={[styles.star, styles.star1]} />
        <Star color="rgba(255, 255, 255, 0.4)" size={12} style={[styles.star, styles.star2]} />
        <Star color="rgba(255, 255, 255, 0.6)" size={14} style={[styles.star, styles.star3]} />
      </Animated.View>
      
      <View style={styles.content}>
        <Text style={styles.headline}>{headline}</Text>
        
        {/* Personalized snapshot */}
        <View style={styles.snapshotContainer}>
          {loading ? (
            <Text style={styles.snapshotText}>Loading your sleep data...</Text>
          ) : sleepData.length > 0 ? (
            averageSleep ? (
              <Text style={styles.snapshotText}>
                You averaged {formatHours(averageSleep)} of sleep last week. Try Sleep Coach to hit 8h.
              </Text>
            ) : (
              <Text style={styles.snapshotText}>
                Track your sleep to see insights and tips.
              </Text>
            )
          ) : (
            <Text style={styles.snapshotText}>
              Start tracking your sleep to see insights and tips.
            </Text>
          )}
        </View>
        
        <Text style={styles.benefitSummary}>{benefitSummary}</Text>
        
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <Animated.Text style={[styles.ctaButtonText, {
            transform: [{
              scale: animation.interpolate({
                inputRange: [0.96, 1],
                outputRange: [0.95, 1]
              })
            }]
          }]}>Improve My Sleep</Animated.Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#253a7a', // Deep night blue
    borderRadius: BORDER_RADIUS.lg,
    margin: SPACING.lg,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#253a7a', // Deep night blue
  },
  illustrationContainer: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 60,
    height: 60,
  },
  moon: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  star: {
    position: 'absolute',
  },
  star1: {
    top: 5,
    left: 5,
  },
  star2: {
    bottom: 10,
    right: 15,
  },
  star3: {
    top: 20,
    right: 5,
  },
  content: {
    padding: SPACING.lg,
    position: 'relative',
    zIndex: 1,
  },
  headline: {
    ...TYPOGRAPHY.h3,
    color: 'white',
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  snapshotContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // More visible semi-transparent white
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  snapshotText: {
    ...TYPOGRAPHY.body,
    color: 'white',
    fontWeight: '500',
  },
  benefitSummary: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.lg,
  },
  ctaButton: {
    backgroundColor: '#4CAF50', // Vibrant green for contrast
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EnhancedSleepCoachCard;