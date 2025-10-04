import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X, Target, Clock, TrendingUp, Award } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { DailyRecommendation } from '@/types/mood';

interface RecommendedPlanModalProps {
  visible: boolean;
  onClose: () => void;
  recommendation: DailyRecommendation | null;
  onStartPlan: (recommendation: DailyRecommendation) => void;
}

export default function RecommendedPlanModal({ 
  visible, 
  onClose, 
  recommendation,
  onStartPlan
}: RecommendedPlanModalProps) {
  if (!recommendation) return null;

  const getRecommendationDetails = () => {
    switch (recommendation.type) {
      case 'activity':
        return {
          icon: '🏋️',
          nature: 'Physical Activity',
          goal: 'Improve mood and energy levels',
          duration: '20-30 minutes',
          frequency: '3-5 times per week',
          results: 'Increased endorphins, better sleep quality, enhanced mood'
        };
      case 'intimacy':
        return {
          icon: '❤️',
          nature: 'Intimacy Practice',
          goal: 'Enhance emotional connection and wellbeing',
          duration: 'Varies',
          frequency: 'As comfortable',
          results: 'Reduced stress, improved mood, better sleep'
        };
      case 'sleep':
        return {
          icon: '🌙',
          nature: 'Sleep Improvement',
          goal: 'Enhance sleep quality and consistency',
          duration: '7-9 hours',
          frequency: 'Daily',
          results: 'Better cognitive function, improved mood, increased energy'
        };
      case 'mood':
        return {
          icon: '😊',
          nature: 'Mood Enhancement',
          goal: 'Boost positive emotions and mental wellbeing',
          duration: '10-15 minutes',
          frequency: 'Daily',
          results: 'Increased happiness, reduced stress, better emotional regulation'
        };
      default:
        return {
          icon: '💡',
          nature: 'Wellness Activity',
          goal: 'Improve overall wellbeing',
          duration: 'Varies',
          frequency: 'As recommended',
          results: 'Enhanced quality of life and mental health'
        };
    }
  };

  const details = getRecommendationDetails();

  const handleStartPlan = () => {
    onStartPlan(recommendation);
    onClose();
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Recommended Plan Details</Text>
            <TouchableOpacity onPress={onClose}>
              <X color={COLORS.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.planHeader}>
              <Text style={styles.planIcon}>{details.icon}</Text>
              <Text style={styles.planTitle}>{recommendation.suggestion}</Text>
              <Text style={styles.planReason}>{recommendation.reason}</Text>
            </View>

            <View style={styles.detailsSection}>
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Target color={COLORS.primary} size={20} />
                  <Text style={styles.detailTitle}>Nature of Activity</Text>
                </View>
                <Text style={styles.detailText}>{details.nature}</Text>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Award color={COLORS.success} size={20} />
                  <Text style={styles.detailTitle}>Goal</Text>
                </View>
                <Text style={styles.detailText}>{details.goal}</Text>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Clock color={COLORS.warning} size={20} />
                  <Text style={styles.detailTitle}>Duration & Frequency</Text>
                </View>
                <Text style={styles.detailText}>Duration: {details.duration}</Text>
                <Text style={styles.detailText}>Frequency: {details.frequency}</Text>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <TrendingUp color={COLORS.accent} size={20} />
                  <Text style={styles.detailTitle}>Expected Results</Text>
                </View>
                <Text style={styles.detailText}>{details.results}</Text>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>Why This Recommendation?</Text>
                <Text style={styles.detailText}>
                  This recommendation is based on your recent patterns and data analysis. 
                  Our system has identified this as a high-impact activity for your specific 
                  situation to improve your wellbeing.
                </Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartPlan}
          >
            <Text style={styles.startButtonText}>Start This Plan with Tracking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '90%',
    maxHeight: '80%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  } as any,
  scrollContent: {
    flex: 1,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
  },
  planIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  planTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  } as any,
  planReason: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  } as any,
  detailsSection: {
    gap: SPACING.md,
  },
  detailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    fontSize: 18,
  } as any,
  detailText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  } as any,
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  startButtonText: {
    ...TYPOGRAPHY.body,
    color: 'white',
    fontWeight: '600' as '600',
  },
});