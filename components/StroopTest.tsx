import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

type GameState = 'instructions' | 'playing' | 'results';

interface Trial {
  word: string;
  color: string;
  userAnswer?: string;
  responseTime?: number;
  correct?: boolean;
}

const colors = ['red', 'blue', 'green', 'yellow'];
const colorNames = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

interface StroopTestProps {
  onTestComplete?: (results: { accuracy: number; avgTime: number }) => void;
}

export default function StroopTest({ onTestComplete }: StroopTestProps) {
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [currentTrial, setCurrentTrial] = useState(0);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [startTime, setStartTime] = useState(0);
  const totalTrials = 20;

  const generateTrials = () => {
    const newTrials: Trial[] = [];
    for (let i = 0; i < totalTrials; i++) {
      const wordIndex = Math.floor(Math.random() * colors.length);
      let colorIndex = Math.floor(Math.random() * colors.length);
      
      while (colorIndex === wordIndex) {
        colorIndex = Math.floor(Math.random() * colors.length);
      }
      
      newTrials.push({
        word: colorNames[wordIndex],
        color: colors[colorIndex]
      });
    }
    return newTrials;
  };

  const startTest = () => {
    setTrials(generateTrials());
    setCurrentTrial(0);
    setGameState('playing');
    setStartTime(Date.now());
  };

  const handleAnswer = (selectedColor: string) => {
    const responseTime = Date.now() - startTime;
    const trial = trials[currentTrial];
    const correct = trial.color === selectedColor;

    const updatedTrials = [...trials];
    updatedTrials[currentTrial] = {
      ...trial,
      userAnswer: selectedColor,
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

  const getColorStyle = (color: string) => {
    const colorMap: { [key: string]: string } = {
      red: '#FF6B6B',
      blue: '#4ECDC4',
      green: '#95E1D3',
      yellow: '#FFE66D'
    };
    return { backgroundColor: colorMap[color] };
  };

  const renderInstructions = () => (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🎯 Stroop Test</Text>
        <Text style={styles.instructions}>
          You'll see color words displayed in different colors.
          {'\n\n'}
          <Text style={styles.bold}>IMPORTANT:</Text>
          {'\n'}Select the COLOR, not the word!
          {'\n\n'}
          For example:
          {'\n'}If you see <Text style={{ color: '#4ECDC4' }}>RED</Text> (shown in blue)
          {'\n'}You should select BLUE
          {'\n\n'}
          Focus and ignore what you read!
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
          <Text style={styles.instructionText}>Select the COLOR (not the word)</Text>
          <View style={styles.wordContainer}>
            <Text style={[styles.stroopWord, { color: trial.color }]}>
              {trial.word}
            </Text>
          </View>
          <View style={styles.colorGrid}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorButton, getColorStyle(color)]}
                onPress={() => handleAnswer(color)}
              >
                <Text style={styles.colorLabel}>{color.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderResults = () => {
    const { accuracy, avgTime } = calculateResults();
    const emoji = parseFloat(accuracy) >= 85 ? '🌟' : parseFloat(accuracy) >= 70 ? '😊' : '👍';
    const feedback = parseFloat(accuracy) >= 85 ? 'Excellent focus!' : parseFloat(accuracy) >= 70 ? 'Good job!' : 'Keep practicing!';

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
  instructionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stroopWord: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorButton: {
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    margin: SPACING.sm,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
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