import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

type GameState = 'instructions' | 'playing' | 'results';

interface Trial {
  letter: string;
  isMatch: boolean;
  userAnswer?: boolean;
  responseTime?: number;
  correct?: boolean;
}

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

interface NBackTestProps {
  onTestComplete?: (results: { accuracy: number; avgTime: number }) => void;
}

export default function NBackTest({ onTestComplete }: NBackTestProps) {
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [currentTrial, setCurrentTrial] = useState(0);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [userResponded, setUserResponded] = useState(false);
  
  const totalTrials = 25;
  const nBack = 2;
  const displayTime = 2000;

  const generateTrials = () => {
    const newTrials: Trial[] = [];
    
    for (let i = 0; i < totalTrials; i++) {
      let letter: string;
      let isMatch = false;
      
      if (i >= nBack && Math.random() < 0.3) {
        letter = newTrials[i - nBack].letter;
        isMatch = true;
      } else {
        letter = letters[Math.floor(Math.random() * letters.length)];
        
        if (i >= nBack) {
          while (letter === newTrials[i - nBack].letter) {
            letter = letters[Math.floor(Math.random() * letters.length)];
          }
        }
      }
      
      newTrials.push({ letter, isMatch });
    }
    
    return newTrials;
  };

  const startTest = () => {
    const trialsData = generateTrials();
    setTrials(trialsData);
    setCurrentTrial(0);
    setGameState('playing');
    showNextTrial(0, trialsData);
  };

  const showNextTrial = (trialIndex: number, trialsData: Trial[]) => {
    setUserResponded(false);
    setStartTime(Date.now());
    
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(displayTime - 600),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start(() => {
      if (trialIndex + 1 < totalTrials) {
        setTimeout(() => {
          if (!userResponded) {
            recordAnswer(false, trialsData, trialIndex);
          }
          setCurrentTrial(trialIndex + 1);
          showNextTrial(trialIndex + 1, trialsData);
        }, 200);
      } else {
        if (!userResponded) {
          recordAnswer(false, trialsData, trialIndex);
        }
        setGameState('results');
        const results = calculateResults();
        onTestComplete && onTestComplete({
          accuracy: parseFloat(results.accuracy),
          avgTime: parseFloat(results.avgTime)
        });
      }
    });
  };

  const handleMatch = () => {
    if (!userResponded && gameState === 'playing') {
      recordAnswer(true, trials, currentTrial);
    }
  };

  const handleNoMatch = () => {
    if (!userResponded && gameState === 'playing') {
      recordAnswer(false, trials, currentTrial);
    }
  };

  const recordAnswer = (userSaidMatch: boolean, trialsData: Trial[], trialIndex: number) => {
    setUserResponded(true);
    const responseTime = Date.now() - startTime;
    const trial = trialsData[trialIndex];
    const correct = trial.isMatch === userSaidMatch;

    const updatedTrials = [...trialsData];
    updatedTrials[trialIndex] = {
      ...trial,
      userAnswer: userSaidMatch,
      responseTime,
      correct
    };
    setTrials(updatedTrials);
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
        <Text style={styles.title}>🔄 N-Back Test</Text>
        <Text style={styles.instructions}>
          This test measures your working memory.
          {'\n\n'}
          You'll see letters appear one at a time.
          {'\n\n'}
          Press "MATCH" if the current letter is the same as the one that appeared 2 steps ago.
          {'\n\n'}
          Press "NO MATCH" if it's different.
          {'\n\n'}
          For example: A, B, C, A → Press MATCH on the second A
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
          <Text style={styles.trialText}>Trial {currentTrial + 1} of {totalTrials}</Text>
          <Animated.View style={[styles.letterContainer, { opacity: fadeAnim }]}>
            <Text style={styles.letter}>{trial.letter}</Text>
          </Animated.View>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.responseButton, styles.noMatchButton]} 
              onPress={handleNoMatch}
            >
              <Text style={styles.buttonText}>NO MATCH</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.responseButton, styles.matchButton]} 
              onPress={handleMatch}
            >
              <Text style={styles.buttonText}>MATCH</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderResults = () => {
    const { accuracy, avgTime } = calculateResults();
    const emoji = parseFloat(accuracy) >= 85 ? '🌟' : parseFloat(accuracy) >= 70 ? '😊' : '👍';
    const feedback = parseFloat(accuracy) >= 85 ? 'Excellent memory!' : parseFloat(accuracy) >= 70 ? 'Good job!' : 'Keep practicing!';

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
  trialText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  letterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  letter: {
    fontSize: 64,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  responseButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.sm,
  },
  noMatchButton: {
    backgroundColor: '#e74c3c',
  },
  matchButton: {
    backgroundColor: '#2ecc71',
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