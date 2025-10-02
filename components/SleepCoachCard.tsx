import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Moon, Star } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useMoodStore } from '@/hooks/mood-store';
import Toast from '@/components/Toast';

// Eye-catching headlines
const HEADLINES = [
  "🌙 Sleep Better Tonight",
  "🛌 Wake Up Refreshed",
  "Boost Your Sleep Quality by 30%"
];

// Helper function to calculate average sleep for last N days
export function averageSleepLastNDays(sleepLogs: Array<{startISO: string, endISO: string}>, days = 7) {
  if (sleepLogs.length === 0) return null;
  
  const now = new Date();
  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  // Filter logs within the last N days
  const recentLogs = sleepLogs.filter(log => {
    const endDate = new Date(log.endISO);
    return endDate >= cutoffDate && endDate <= now;
  });
  
  if (recentLogs.length === 0) return null;
  
  // Calculate durations
  const durations = recentLogs.map(log => {
    const start = new Date(log.startISO);
    const end = new Date(log.endISO);
    
    // Handle case where sleep crosses midnight
    let durationMs;
    if (end < start) {
      // Add 24 hours to end time
      durationMs = (end.getTime() + 24 * 60 * 60 * 1000) - start.getTime();
    } else {
      durationMs = end.getTime() - start.getTime();
    }
    
    return durationMs / (1000 * 60 * 60); // Convert to hours
  });
  
  // Calculate average
  const totalHours = durations.reduce((sum, duration) => sum + duration, 0);
  return totalHours / durations.length;
}

// Format hours and minutes
const formatHours = (hours: number) => {
  const fullHours = Math.floor(hours);
  const minutes = Math.round((hours - fullHours) * 60);
  return `${fullHours}h ${minutes}m`;
};

interface SleepCoachCardProps {
  onImproveSleepPress?: () => void;
}

const SleepCoachCard: React.FC<SleepCoachCardProps> = ({ onImproveSleepPress }) => {
  const router = useRouter();
  const { getSleepEntries } = useMoodStore();
  const [sleepData, setSleepData] = useState<Array<{startISO: string, endISO: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [headline, setHeadline] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const cacheRef = useRef<{data: any, timestamp: number} | null>(null);
  const cardAnimation = useRef(new Animated.Value(0)).current;
  const ctaAnimation = useRef(new Animated.Value(1)).current;

  // Rotate headlines
  useEffect(() => {
    const randomHeadline = HEADLINES[Math.floor(Math.random() * HEADLINES.length)];
    setHeadline(randomHeadline);
  }, []);

  // Load sleep data with caching
  useEffect(() => {
    const loadSleepData = async () => {
      try {
        // Check cache first
        const now = Date.now();
        if (cacheRef.current && now - cacheRef.current.timestamp < 5 * 60 * 1000) {
          setSleepData(cacheRef.current.data);
          setLoading(false);
          return;
        }

        const entries = await getSleepEntries();
        
        // Transform SleepEntry to required format
        const transformedData = entries
          .filter(entry => entry.bedtime && entry.wakeTime)
          .map(entry => {
            // Create ISO strings for bedtime and wake time
            const bedtimeISO = `${entry.date}T${entry.bedtime}:00`;
            const wakeTimeISO = `${entry.date}T${entry.wakeTime}:00`;
            
            // Handle case where wake time is next day
            let endISO = wakeTimeISO;
            const bedtime = new Date(bedtimeISO);
            const wakeTime = new Date(wakeTimeISO);
            
            if (wakeTime < bedtime) {
              // Add one day to wake time
              const nextDay = new Date(wakeTime);
              nextDay.setDate(nextDay.getDate() + 1);
              endISO = nextDay.toISOString();
            }
            
            return {
              startISO: bedtimeISO,
              endISO: endISO
            };
          });
        
        setSleepData(transformedData);
        cacheRef.current = { data: transformedData, timestamp: now };
      } catch (error) {
        console.error('Error loading sleep data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSleepData();
  }, [getSleepEntries]);

  // Card entrance animation
  useEffect(() => {
    // Check for reduced motion preference
    const reduceMotion = Platform.OS === 'web' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (reduceMotion) {
      cardAnimation.setValue(1);
    } else {
      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [cardAnimation]);

  // Calculate average sleep from last 7 days
  const calculateAverageSleep = () => {
    if (sleepData.length === 0) return null;
    return averageSleepLastNDays(sleepData, 7);
  };

  // Handle CTA button press with animation
  const handlePressIn = () => {
    Animated.timing(ctaAnimation, {
      toValue: 0.96,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(ctaAnimation, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    // Show toast
    setToastMessage("Opening Sleep Coach...");
    setToastVisible(true);
    
    // Call the prop function if provided, otherwise navigate
    if (onImproveSleepPress) {
      onImproveSleepPress();
    } else {
      router.push('/(tabs)/sleep' as Href);
    }
  };

  const handleTrackSleep = () => {
    // Call the prop function if provided, otherwise navigate
    if (onImproveSleepPress) {
      onImproveSleepPress();
    } else {
      router.push('/(tabs)/sleep' as Href);
    }
  };

  const averageSleep = calculateAverageSleep();
  const nightsCount = sleepData.length;
  
  const cardAnimatedStyle = {
    opacity: cardAnimation,
    transform: [{
      scale: cardAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.95, 1]
      })
    }]
  };

  const ctaAnimatedStyle = {
    transform: [{
      scale: ctaAnimation
    }]
  };

  return (
    <>
      <Animated.View 
        style={[styles.container, cardAnimatedStyle]}
        accessibilityLabel="Sleep Coach Card"
      >
        {/* Background with gradient effect */}
        <View style={styles.backgroundGradient} />
        
        {/* Sleep illustration */}
        <View style={styles.illustrationContainer}>
          <Moon color="rgba(255, 255, 255, 0.8)" size={24} style={styles.moon} />
          <Star color="rgba(255, 255, 255, 0.6)" size={16} style={[styles.star, styles.star1]} />
          <Star color="rgba(255, 255, 255, 0.4)" size={12} style={[styles.star, styles.star2]} />
          <Star color="rgba(255, 255, 255, 0.6)" size={14} style={[styles.star, styles.star3]} />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.headline} accessibilityRole="header">{headline}</Text>
          
          {/* Personalized snapshot */}
          <View style={styles.snapshotContainer}>
            {loading ? (
              <Text style={styles.snapshotText}>Loading your sleep data...</Text>
            ) : nightsCount >= 3 && averageSleep ? (
              <Text style={styles.snapshotText}>
                You averaged {formatHours(averageSleep)} of sleep last week. Try Sleep Coach to hit 8h.
              </Text>
            ) : (
              <View style={styles.fallbackContainer}>
                <Text style={styles.snapshotText}>
                  Start tracking your sleep to see insights and tips.{' '}
                </Text>
                <TouchableOpacity onPress={handleTrackSleep}>
                  <Text style={styles.trackLink}>Track My Sleep</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <Text style={styles.benefitSummary}>Get guided playlists, routines & experiments to sleep deeper.</Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
            accessibilityLabel="Improve My Sleep Button"
          >
            <Animated.Text style={[styles.ctaButtonText, ctaAnimatedStyle]}>
              Improve My Sleep
            </Animated.Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <Toast 
        message={toastMessage} 
        visible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
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
    backgroundColor: '#1a2a6c',
    // Note: For a real gradient, we would use expo-linear-gradient
    // but we're keeping it simple for now as per requirements
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  fallbackContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  snapshotText: {
    ...TYPOGRAPHY.body,
    color: 'white',
    fontWeight: '500',
  },
  trackLink: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  benefitSummary: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.lg,
  },
  ctaButton: {
    backgroundColor: COLORS.primary, // Using app's existing color tokens
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  ctaButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SleepCoachCard;