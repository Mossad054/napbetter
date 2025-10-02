import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

type GameState = 'instructions' | 'waiting' | 'ready' | 'results';

interface ReactionTimeTestProps {
  onTestComplete?: (results: { avgTime: number; bestTime: number; score: number }) => void;
}

export default function ReactionTimeTest({ onTestComplete }: ReactionTimeTestProps) {
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [currentRound, setCurrentRound] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(0));
  const totalRounds = 8;

  useEffect(() => {
    if (gameState === 'waiting') {
      const delay = 2000 + Math.random() * 3000;
      const timer = setTimeout(() => {
        setGameState('ready');
        setStartTime(Date.now());
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 5
        }).start();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [gameState, scaleAnim]);

  const startTest = () => {
    setReactionTimes([]);
    setCurrentRound(0);
    startNextRound();
  };

  const startNextRound = () => {
    setGameState('waiting');
    scaleAnim.setValue(0);
  };

  const handleTap = () => {
    if (gameState === 'ready') {
      const reactionTime = Date.now() - startTime;
      const newTimes = [...reactionTimes, reactionTime];
      setReactionTimes(newTimes);

      if (currentRound + 1 < totalRounds) {
        setCurrentRound(currentRound + 1);
        startNextRound();
      } else {
        setGameState('results');
        const results = calculateResults();
        // Calculate score based on reaction times (lower is better)
        const score = Math.max(0, 1000 - Math.round(results.avgTime));
        onTestComplete && onTestComplete({
          avgTime: results.avgTime,
          bestTime: results.bestTime,
          score
        });
      }
    } else if (gameState === 'waiting') {
      // False start - restart current round
      startNextRound();
    }
  };

  const calculateResults = () => {
    const avgTime = reactionTimes.reduce((sum, t) => sum + t, 0) / reactionTimes.length;
    const bestTime = Math.min(...reactionTimes);
    return {
      avgTime: Math.round(avgTime),
      bestTime: Math.round(bestTime)
    };
  };

  const renderInstructions = () => (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🕒 Reaction Time Test</Text>
        <Text style={styles.instructions}>
          Wait for the green circle to appear.
          {'\n\n'}
          Tap it as quickly as possible!
          {'\n\n'}
          You'll do {totalRounds} rounds.
          {'\n\n'}
          <Text style={styles.warning}>⚠️ Don't tap too early!</Text>
        </Text>
        <TouchableOpacity style={styles.button} onPress={startTest}>
          <Text style={styles.buttonText}>Start Test</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWaiting = () => (
    <TouchableOpacity 
      style={styles.fullScreenTap} 
      activeOpacity={1}
      onPress={handleTap}
    >
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentRound / totalRounds) * 100}%` }]} />
      </View>
      <Text style={styles.waitingText}>Wait...</Text>
      <Text style={styles.roundText}>Round {currentRound + 1}/{totalRounds}</Text>
    </TouchableOpacity>
  );

  const renderReady = () => (
    <TouchableOpacity 
      style={styles.fullScreenTap} 
      activeOpacity={1}
      onPress={handleTap}
    >
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentRound / totalRounds) * 100}%` }]} />
      </View>
      <Animated.View 
        style={[
          styles.circle, 
          { transform: [{ scale: scaleAnim }] }
        ]} 
      />
      <Text style={styles.tapText}>TAP NOW!</Text>
    </TouchableOpacity>
  );

  const renderResults = () => {
    const { avgTime, bestTime } = calculateResults();
    const score = Math.max(0, 1000 - Math.round(avgTime));
    const emoji = avgTime < 300 ? '⚡' : avgTime < 400 ? '😊' : '👍';
    const feedback = avgTime < 300 ? 'Lightning fast!' : avgTime < 400 ? 'Great reflexes!' : 'Good job!';

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.resultEmoji}>{emoji}</Text>
          <Text style={styles.resultTitle}>{feedback}</Text>
          <View style={styles.resultStats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Average</Text>
              <Text style={styles.statValue}>{avgTime}ms</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Best</Text>
              <Text style={styles.statValue}>{bestTime}ms</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Score</Text>
              <Text style={styles.statValue}>{score}</Text>
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
      {gameState === 'waiting' && renderWaiting()}
      {gameState === 'ready' && renderReady()}
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
  warning: {
    fontWeight: 'bold',
    color: '#e74c3c',
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
  fullScreenTap: {
    flex: 1,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
  },
  waitingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.lg,
  },
  roundText: {
    fontSize: 18,
    color: 'white',
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#2ecc71',
    marginBottom: SPACING.xl,
  },
  tapText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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