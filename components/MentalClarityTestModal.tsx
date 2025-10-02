import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import ReactionTimeTest from '@/components/ReactionTimeTest';
import WorkingMemoryTest from '@/components/WorkingMemoryTest';
import CognitiveFlexibilityTest from '@/components/CognitiveFlexibilityTest';
import StroopTest from '@/components/StroopTest';
import NBackTest from '@/components/NBackTest';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';

interface MentalClarityTestModalProps {
  visible: boolean;
  onClose: () => void;
  onTestComplete: (score: number) => void;
}

type TestType = 'reaction' | 'memory' | 'flexibility' | 'stroop' | 'nback';
type TestStatus = 'selecting' | 'taking' | 'completed';

export default function MentalClarityTestModal({ 
  visible, 
  onClose, 
  onTestComplete 
}: MentalClarityTestModalProps) {
  console.log('MentalClarityTestModal rendered with visible:', visible);
  const [testStatus, setTestStatus] = useState<TestStatus>('selecting');
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null);
  const [testResults, setTestResults] = useState<{
    score: number;
    averageReaction: number;
    accuracy: number;
    testName: string;
  } | null>(null);

  const handleTestComplete = (results: {
    score: number;
    averageReaction: number;
    accuracy: number;
  }) => {
    setTestResults({
      ...results,
      testName: getTestName(selectedTest)
    });
    onTestComplete(results.score);
  };

  const handleStartTest = (testType: TestType) => {
    setSelectedTest(testType);
    setTestStatus('taking');
  };

  const handleCognitiveTestComplete = (results: any) => {
    // For cognitive tests, we'll need to convert their results to our format
    const score = calculateScoreFromTest(selectedTest, results);
    setTestResults({
      score,
      averageReaction: results.avgTime || 0,
      accuracy: results.accuracy || 0,
      testName: getTestName(selectedTest)
    });
    setTestStatus('completed');
    onTestComplete(score);
  };

  const handleRestartTest = () => {
    setTestResults(null);
    setTestStatus('selecting');
    setSelectedTest(null);
  };

  const getTestName = (testType: TestType | null) => {
    switch (testType) {
      case 'reaction': return 'Reaction Time Test';
      case 'memory': return 'Working Memory Test';
      case 'flexibility': return 'Cognitive Flexibility Test';
      case 'stroop': return 'Stroop Test';
      case 'nback': return 'N-Back Test';
      default: return 'Mental Clarity Test';
    }
  };

  const calculateScoreFromTest = (testType: TestType | null, results: any) => {
    // Convert test-specific results to a normalized score
    switch (testType) {
      case 'reaction':
        // Reaction time test already provides a score
        return results.score || 500;
      case 'memory':
        // Working memory: higher sequence length = higher score
        return (results.maxLevel || 3) * 100;
      case 'flexibility':
      case 'stroop':
      case 'nback':
        // Percentage accuracy based tests
        return Math.round((results.accuracy || 50) * 10);
      default:
        return 500;
    }
  };

  const renderTestSelection = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mental Clarity Tests</Text>
      <Text style={styles.description}>
        Choose from a variety of cognitive tests to measure different aspects of mental clarity and focus.
      </Text>
      
      <View style={styles.testTypeContainer}>
        <Text style={styles.sectionTitle}>Reaction & Speed</Text>
        <TouchableOpacity 
          style={styles.testTypeButton} 
          onPress={() => handleStartTest('reaction')}
        >
          <Text style={styles.testTypeButtonText}>Reaction Time Test</Text>
          <Text style={styles.testTypeDescription}>
            Measure how quickly you can respond to visual stimuli
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.testTypeContainer}>
        <Text style={styles.sectionTitle}>Memory</Text>
        <TouchableOpacity 
          style={styles.testTypeButton} 
          onPress={() => handleStartTest('memory')}
        >
          <Text style={styles.testTypeButtonText}>Working Memory Test</Text>
          <Text style={styles.testTypeDescription}>
            Test your ability to hold and manipulate information
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.testTypeContainer}>
        <Text style={styles.sectionTitle}>Cognitive Flexibility</Text>
        <TouchableOpacity 
          style={styles.testTypeButton} 
          onPress={() => handleStartTest('flexibility')}
        >
          <Text style={styles.testTypeButtonText}>Cognitive Flexibility Test</Text>
          <Text style={styles.testTypeDescription}>
            Switch between different rules and mental sets
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.testTypeContainer}>
        <Text style={styles.sectionTitle}>Attention</Text>
        <TouchableOpacity 
          style={styles.testTypeButton} 
          onPress={() => handleStartTest('stroop')}
        >
          <Text style={styles.testTypeButtonText}>Stroop Test</Text>
          <Text style={styles.testTypeDescription}>
            Measure selective attention and cognitive control
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.testTypeButton, { marginTop: SPACING.md }]} 
          onPress={() => handleStartTest('nback')}
        >
          <Text style={styles.testTypeButtonText}>N-Back Test</Text>
          <Text style={styles.testTypeDescription}>
            Test working memory and sustained attention
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
        <Text style={styles.secondaryButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderTest = () => {
    if (!selectedTest) return null;

    switch (selectedTest) {
      case 'reaction':
        return <ReactionTimeTest onTestComplete={handleCognitiveTestComplete} />;
      case 'memory':
        return <WorkingMemoryTest onTestComplete={handleCognitiveTestComplete} />;
      case 'flexibility':
        return <CognitiveFlexibilityTest onTestComplete={handleCognitiveTestComplete} />;
      case 'stroop':
        return <StroopTest onTestComplete={handleCognitiveTestComplete} />;
      case 'nback':
        return <NBackTest onTestComplete={handleCognitiveTestComplete} />;
      default:
        return <ReactionTimeTest onTestComplete={handleCognitiveTestComplete} />;
    }
  };

  const renderResults = () => {
    if (!testResults) return null;

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Test Complete!</Text>
        <Text style={styles.testName}>{testResults.testName}</Text>
        
        <View style={styles.resultsCard}>
          <Text style={styles.resultLabel}>Your Clarity Score</Text>
          <Text style={styles.resultScore}>{testResults.score}</Text>
          
          {testResults.averageReaction > 0 && (
            <View style={styles.resultRow}>
              <Text style={styles.resultMetric}>Average Reaction</Text>
              <Text style={styles.resultValue}>{Math.round(testResults.averageReaction)}ms</Text>
            </View>
          )}
          
          {testResults.accuracy > 0 && (
            <View style={styles.resultRow}>
              <Text style={styles.resultMetric}>Accuracy</Text>
              <Text style={styles.resultValue}>{testResults.accuracy}%</Text>
            </View>
          )}
        </View>

        <View style={styles.performanceSection}>
          <Text style={styles.performanceTitle}>Performance Level</Text>
          {testResults.score >= 800 && (
            <Text style={[styles.performanceBadge, styles.performanceElite]}>Elite</Text>
          )}
          {testResults.score >= 600 && testResults.score < 800 && (
            <Text style={[styles.performanceBadge, styles.performanceStrong]}>Strong</Text>
          )}
          {testResults.score >= 400 && testResults.score < 600 && (
            <Text style={[styles.performanceBadge, styles.performanceGood]}>Good</Text>
          )}
          {testResults.score >= 200 && testResults.score < 400 && (
            <Text style={[styles.performanceBadge, styles.performanceDeveloping]}>Developing</Text>
          )}
          {testResults.score < 200 && (
            <Text style={[styles.performanceBadge, styles.performanceBuilding]}>Building</Text>
          )}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleRestartTest}>
          <Text style={styles.primaryButtonText}>Test Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
          <Text style={styles.secondaryButtonText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {testStatus === 'selecting' && renderTestSelection()}
        {testStatus === 'taking' && renderTest()}
        {testStatus === 'completed' && renderResults()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  testName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    lineHeight: 22,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
    alignSelf: 'flex-start',
  },
  testTypeContainer: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  testTypeButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: '100%',
  },
  testTypeButtonText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    fontWeight: '600',
  },
  testTypeDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  infoSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  infoTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  infoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.md,
  },
  primaryButtonText: {
    color: 'white',
    ...TYPOGRAPHY.h4,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
  },
  resultsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    width: '100%',
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  resultLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  resultScore: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.md,
  },
  resultMetric: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  resultValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  performanceSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  performanceTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  performanceBadge: {
    ...TYPOGRAPHY.h3,
    fontWeight: 'bold',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  performanceElite: {
    backgroundColor: '#9b59b6',
    color: 'white',
  },
  performanceStrong: {
    backgroundColor: '#3498db',
    color: 'white',
  },
  performanceGood: {
    backgroundColor: '#2ecc71',
    color: 'white',
  },
  performanceDeveloping: {
    backgroundColor: '#f1c40f',
    color: 'white',
  },
  performanceBuilding: {
    backgroundColor: '#e67e22',
    color: 'white',
  },
});