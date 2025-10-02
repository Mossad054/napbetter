import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import WorkingMemoryTest from '@/components/WorkingMemoryTest';
import CognitiveFlexibilityTest from '@/components/CognitiveFlexibilityTest';
import StroopTest from '@/components/StroopTest';
import NBackTest from '@/components/NBackTest';
import ReactionTimeTest from '@/components/ReactionTimeTest';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';

type TestType = 'reaction' | 'memory' | 'flexibility' | 'stroop' | 'nback' | null;

export default function TestsScreen() {
  const [selectedTest, setSelectedTest] = useState<TestType>(null);

  const handleTestComplete = (results: any) => {
    console.log('Test completed with results:', results);
  };

  const renderTestSelection = () => (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cognitive Tests</Text>
      <Text style={styles.description}>
        Select a test to run it in isolation
      </Text>
      
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={() => setSelectedTest('reaction')}
      >
        <Text style={styles.testButtonText}>Reaction Time Test</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={() => setSelectedTest('memory')}
      >
        <Text style={styles.testButtonText}>Working Memory Test</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={() => setSelectedTest('flexibility')}
      >
        <Text style={styles.testButtonText}>Cognitive Flexibility Test</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={() => setSelectedTest('stroop')}
      >
        <Text style={styles.testButtonText}>Stroop Test</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={() => setSelectedTest('nback')}
      >
        <Text style={styles.testButtonText}>N-Back Test</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.testButton, styles.backButton]} 
        onPress={() => setSelectedTest(null)}
      >
        <Text style={styles.testButtonText}>Back to Menu</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderTest = () => {
    switch (selectedTest) {
      case 'reaction':
        return <ReactionTimeTest onTestComplete={handleTestComplete} />;
      case 'memory':
        return <WorkingMemoryTest onTestComplete={handleTestComplete} />;
      case 'flexibility':
        return <CognitiveFlexibilityTest onTestComplete={handleTestComplete} />;
      case 'stroop':
        return <StroopTest onTestComplete={handleTestComplete} />;
      case 'nback':
        return <NBackTest onTestComplete={handleTestComplete} />;
      default:
        return renderTestSelection();
    }
  };

  return (
    <View style={styles.container}>
      {selectedTest ? renderTest() : renderTestSelection()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
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
  testButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    width: '100%',
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    ...TYPOGRAPHY.h4,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: COLORS.surface,
  },
});