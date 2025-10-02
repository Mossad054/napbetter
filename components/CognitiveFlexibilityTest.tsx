import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

type Rule = 'number' | 'shape';
type GameState = 'instructions' | 'playing' | 'results';

interface Trial {
  rule: Rule;
  value: number | string;
  correctSide: 'left' | 'right';
  userAnswer?: 'left' | 'right';
  responseTime?: number;
  correct?: boolean;
}

interface CognitiveFlexibilityTestProps {
  onTestComplete?: (results: { accuracy: number; avgTime: number }) => void;
}

export default function CognitiveFlexibilityTest({ onTestComplete }: CognitiveFlexibilityTestProps) {
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [currentTrial, setCurrentTrial] = useState(0);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [startTime, setStartTime] = useState(0);

  const shapes = ['●', '■'];
  const totalTrials = 20;

  const generateTrials = () => {
    const newTrials: Trial[] = [];
    for (let i = 0; i < totalTrials; i++) {
      const rule: Rule = Math.random() > 0.5 ? 'number' : 'shape';
      
      if (rule === 'number') {
        const num = Math.floor(Math.random() * 20) + 1;
        newTrials.push({
          rule,
          value: num,
          correctSide: num % 2 === 0 ? 'right' : 'left'
        });
      } else {
        const shapeIndex = Math.floor(Math.random() * 2);
        newTrials.push({
          rule,
          value: shapes[shapeIndex],
          correctSide: shapeIndex === 0 ? 'left' : 'right'
        });
      }
    }

    return newTrials;
  };

  const startTest = () => {
    setTrials(generateTrials());
    setCurrentTrial(0);
    setGameState('playing');
    setStartTime(Date.now());
  };

  const handleAnswer = (side: 'left' | 'right') => {
    const responseTime = Date.now() - startTime;
    const trial = trials[currentTrial];
    const correct = trial.correctSide === side;

    const updatedTrials = [...trials];
    updatedTrials[currentTrial] = {
      ...trial,
      userAnswer: side,
      responseTime,
      correct
    };
    setTrials(updatedTrials);

    if (currentTrial + 1 < totalTrials) {
      setCurrentTrial(currentTrial + 1);
      setStartTime(Date.now());
    } else {
      setGameState('results');
      const results = calculateResults();
      onTestComplete && onTestComplete({
        accuracy: parseFloat(results.accuracy),
        avgTime: parseFloat(results.avgTime)
      });
    }
  };

  const calculateResults = () => {
    const correctAnswers = trials.filter(t => t.correct).length;
    const avgTime = trials.reduce((sum, t) => sum + (t.responseTime || 0), 0) / trials.length;
    return {
      accuracy: ((correctAnswers / trials.length) * 100).toFixed(1),
      avgTime: (avgTime / 1000).toFixed(2)
    };
  };

  const renderInstructions = () => (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🧩 Cognitive Flexibility Test</Text>
        <Text style={styles.instructions}>
          You'll switch between two rules:
          {'\n\n'}
          <Text style={styles.bold}>Rule A (Numbers):</Text>
          {'\n'}Odd → Left, Even → Right
          {'\n\n'}
          <Text style={styles.bold}>Rule B (Shapes):</Text>
          {'\n'}Circle (●) → Left, Square (■) → Right
          {'\n\n'}
          The rule will change randomly.
          {'\n'}Pay attention to the rule at the top!
        </Text>
        <TouchableOpacity style={styles.button} onPress={startTest}>
          <Text style={styles.buttonText}>Start Test</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPlaying = () => {
    const trial = trials[currentTrial];
    if (!trial) return null;

    return (
      <View style={styles.container}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentTrial / totalTrials) * 100}%` }]} />
        </View>
        <View style={styles.card}>
          <Text style={styles.ruleText}>
            {trial.rule === 'number' ? '🔢 Numbers: Odd→Left, Even→Right' : '🔷 Shapes: ●→Left, ■→Right'}
          </Text>
          <View style={styles.stimulusContainer}>
            <Text style={styles.stimulus}>{trial.value}</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.choiceButton, styles.leftButton]} 
              onPress={() => handleAnswer('left')}
            >
              <Text style={styles.choiceText}>← Left</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.choiceButton, styles.rightButton]} 
              onPress={() => handleAnswer('right')}
            >
              <Text style={styles.choiceText}>Right →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderResults = () => {
    const { accuracy, avgTime } = calculateResults();
    const emoji = parseFloat(accuracy) >= 90 ? '🌟' : parseFloat(accuracy) >= 75 ? '😊' : '👍';
    const feedback = parseFloat(accuracy) >= 90 ? 'Excellent!' : parseFloat(accuracy) >= 75 ? 'Well done!' : 'Good try!';

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.resultEmoji}>{emoji}</Text>
          <Text style={styles.resultTitle}>{feedback}</Text>
          <View style={styles.resultStats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={styles.statValue}>{accuracy}%</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Avg Time</Text>
              <Text style={styles.statValue}>{avgTime}s</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => setGameState('instructions')}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      {gameState === 'instructions' && renderInstructions()}
      {gameState === 'playing' && renderPlaying()}
      {gameState === 'results' && renderResults()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  ruleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  stimulusContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stimulus: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  choiceButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  leftButton: {
    backgroundColor: '#3498db',
    marginRight: SPACING.sm,
  },
  rightButton: {
    backgroundColor: '#2ecc71',
    marginLeft: SPACING.sm,
  },
  choiceText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.xl,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});