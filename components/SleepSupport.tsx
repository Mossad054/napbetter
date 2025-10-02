import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { 
  Moon, 
  Play, 
  Clock, 
  CheckCircle, 
  X,
  Star,
  Wind,
  Bed,
  Brain,
  Heart
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { SleepTutorial, TutorialCompletion } from '@/types/mood';
import { SLEEP_TUTORIALS } from '@/constants/activities';

interface SleepSupportProps {
  visible: boolean;
  onClose: () => void;
  onTutorialComplete: (completion: Omit<TutorialCompletion, 'id'>) => void;
}

export default function SleepSupport({ visible, onClose, onTutorialComplete }: SleepSupportProps) {
  const [selectedTutorial, setSelectedTutorial] = useState<SleepTutorial | null>(null);
  const [showTutorialDetail, setShowTutorialDetail] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showRating, setShowRating] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [wasHelpful, setWasHelpful] = useState<boolean>(false);

  const getTutorialIcon = (type: SleepTutorial['type']) => {
    switch (type) {
      case 'breathing':
        return <Wind color={COLORS.primary} size={24} />;
      case 'hygiene':
        return <Bed color={COLORS.success} size={24} />;
      case 'relaxation':
        return <Heart color={COLORS.error} size={24} />;
      case 'meditation':
        return <Brain color={COLORS.warning} size={24} />;
      default:
        return <Moon color={COLORS.primary} size={24} />;
    }
  };

  const handleTutorialSelect = (tutorial: SleepTutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStep(0);
    setIsPlaying(false);
    setShowTutorialDetail(true);
  };

  const handleTutorialComplete = () => {
    setIsPlaying(false);
    setShowRating(true);
  };

  const handleRatingSubmit = () => {
    if (selectedTutorial) {
      const completion: Omit<TutorialCompletion, 'id'> = {
        tutorialId: selectedTutorial.id,
        date: new Date().toISOString().split('T')[0],
        wasHelpful,
        rating,
        notes: undefined
      };
      
      onTutorialComplete(completion);
    }
    
    setShowRating(false);
    setShowTutorialDetail(false);
    setSelectedTutorial(null);
    setRating(0);
    setWasHelpful(false);
  };

  const renderTutorialCard = (tutorial: SleepTutorial) => (
    <TouchableOpacity
      key={tutorial.id}
      style={styles.tutorialCard}
      onPress={() => handleTutorialSelect(tutorial)}
    >
      <View style={styles.tutorialHeader}>
        {getTutorialIcon(tutorial.type)}
        <View style={styles.tutorialInfo}>
          <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
          <Text style={styles.tutorialDescription}>{tutorial.description}</Text>
        </View>
        <View style={styles.tutorialMeta}>
          <Clock color={COLORS.textSecondary} size={16} />
          <Text style={styles.tutorialDuration}>{tutorial.duration}m</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTutorialDetail = () => {
    if (!selectedTutorial) return null;

    return (
      <Modal
        visible={showTutorialDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTutorialDetail(false)}
      >
        <View style={styles.tutorialDetailContainer}>
          <View style={styles.tutorialDetailHeader}>
            <Text style={styles.tutorialDetailTitle}>{selectedTutorial.title}</Text>
            <TouchableOpacity
              onPress={() => setShowTutorialDetail(false)}
              style={styles.closeButton}
            >
              <X color={COLORS.text} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.tutorialDetailContent}>
            <View style={styles.tutorialDetailInfo}>
              {getTutorialIcon(selectedTutorial.type)}
              <View style={styles.tutorialDetailMeta}>
                <Text style={styles.tutorialDetailDescription}>
                  {selectedTutorial.description}
                </Text>
                <View style={styles.tutorialDetailDuration}>
                  <Clock color={COLORS.textSecondary} size={16} />
                  <Text style={styles.tutorialDetailDurationText}>
                    {selectedTutorial.duration} minutes
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.instructionsSection}>
              <Text style={styles.instructionsTitle}>Instructions</Text>
              {selectedTutorial.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={[
                    styles.instructionNumber,
                    currentStep >= index && styles.instructionNumberActive
                  ]}>
                    <Text style={[
                      styles.instructionNumberText,
                      currentStep >= index && styles.instructionNumberTextActive
                    ]}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={[
                    styles.instructionText,
                    currentStep >= index && styles.instructionTextActive
                  ]}>
                    {instruction}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.tutorialDetailFooter}>
            {!isPlaying ? (
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => setIsPlaying(true)}
              >
                <Play color={COLORS.surface} size={20} />
                <Text style={styles.startButtonText}>Start Tutorial</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.playingControls}>
                <Text style={styles.playingText}>
                  Step {currentStep + 1} of {selectedTutorial.instructions.length}
                </Text>
                <View style={styles.playingButtons}>
                  {currentStep < selectedTutorial.instructions.length - 1 ? (
                    <TouchableOpacity
                      style={styles.nextButton}
                      onPress={() => setCurrentStep(currentStep + 1)}
                    >
                      <Text style={styles.nextButtonText}>Next Step</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={handleTutorialComplete}
                    >
                      <CheckCircle color={COLORS.surface} size={20} />
                      <Text style={styles.completeButtonText}>Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderRatingModal = () => (
    <Modal
      visible={showRating}
      animationType="fade"
      transparent
      onRequestClose={() => setShowRating(false)}
    >
      <View style={styles.ratingOverlay}>
        <View style={styles.ratingModal}>
          <Text style={styles.ratingTitle}>How was this tutorial?</Text>
          
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Star
                  color={star <= rating ? COLORS.warning : COLORS.textSecondary}
                  fill={star <= rating ? COLORS.warning : 'transparent'}
                  size={32}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.helpfulSection}>
            <Text style={styles.helpfulTitle}>Was this helpful?</Text>
            <View style={styles.helpfulButtons}>
              <TouchableOpacity
                style={[styles.helpfulButton, !wasHelpful && styles.helpfulButtonActive]}
                onPress={() => setWasHelpful(false)}
              >
                <Text style={[styles.helpfulButtonText, !wasHelpful && styles.helpfulButtonTextActive]}>
                  No
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.helpfulButton, wasHelpful && styles.helpfulButtonActive]}
                onPress={() => setWasHelpful(true)}
              >
                <Text style={[styles.helpfulButtonText, wasHelpful && styles.helpfulButtonTextActive]}>
                  Yes
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.ratingFooter}>
            <TouchableOpacity
              style={styles.ratingCancelButton}
              onPress={() => setShowRating(false)}
            >
              <Text style={styles.ratingCancelButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ratingSubmitButton}
              onPress={handleRatingSubmit}
            >
              <Text style={styles.ratingSubmitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sleep Support</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color={COLORS.text} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Improve your sleep quality with these guided tutorials and exercises
          </Text>

          <View style={styles.tutorialsList}>
            {SLEEP_TUTORIALS.map(renderTutorialCard)}
          </View>
        </ScrollView>

        {renderTutorialDetail()}
        {renderRatingModal()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  tutorialsList: {
    gap: SPACING.md,
  },
  tutorialCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tutorialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorialInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  tutorialTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tutorialDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  tutorialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  tutorialDuration: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tutorialDetailContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tutorialDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tutorialDetailTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    flex: 1,
  },
  tutorialDetailContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  tutorialDetailInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  tutorialDetailMeta: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  tutorialDetailDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  tutorialDetailDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  tutorialDetailDurationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  instructionsSection: {
    marginBottom: SPACING.xl,
  },
  instructionsTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  instructionNumberActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  instructionNumberText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  instructionNumberTextActive: {
    color: COLORS.surface,
  },
  instructionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  instructionTextActive: {
    color: COLORS.text,
    fontWeight: '500',
  },
  tutorialDetailFooter: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  startButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600',
  },
  playingControls: {
    alignItems: 'center',
  },
  playingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  playingButtons: {
    width: '100%',
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  nextButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  completeButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600',
  },
  ratingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  ratingModal: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
  },
  ratingTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  ratingStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  starButton: {
    padding: SPACING.xs,
  },
  helpfulSection: {
    marginBottom: SPACING.xl,
  },
  helpfulTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  helpfulButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  helpfulButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  helpfulButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  helpfulButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  helpfulButtonTextActive: {
    color: COLORS.surface,
  },
  ratingFooter: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  ratingCancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  ratingCancelButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  ratingSubmitButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  ratingSubmitButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600',
  },
});