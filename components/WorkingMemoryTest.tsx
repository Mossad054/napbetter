import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

type GameState = 'instructions' | 'showing' | 'input' | 'results';

interface WorkingMemoryTestProps {
  onTestComplete?: (results: { maxLevel: number; score: number; accuracy: number }) => void;
}

export default function WorkingMemoryTest({ onTestComplete }: WorkingMemoryTestProps) {
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [currentLevel, setCurrentLevel] = useState(3);
  const [mistakes, setMistakes] = useState(0);
  const [maxLevel, setMaxLevel] = useState(3);
  const [score, setScore] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  const generateSequence = (length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
  };

  const startRound = () => {
    const newSequence = generateSequence(currentLevel);
    setSequence(newSequence);
    setUserInput([]);
    setGameState('showing');

    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000 + currentLevel * 500),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start(() => {
      setGameState('input');
    });
  };

  const handleNumberPress = (num: number) => {
    const newInput = [...userInput, num];
    setUserInput(newInput);

    if (newInput.length === sequence.length) {
      checkAnswer(newInput);
    }
  };

  const checkAnswer = (input: number[]) => {
    const isCorrect = input.every((num, idx) => num === sequence[idx]);

    if (isCorrect) {
      setScore(score + currentLevel * 10);
      setMaxLevel(Math.max(maxLevel, currentLevel));
      setCurrentLevel(currentLevel + 1);
      setTimeout(() => startRound(), 1000);
    } else {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      
      if (newMistakes >= 2) {
        setGameState('results');
        onTestComplete && onTestComplete({
          maxLevel,
          score,
          accuracy: Math.round((maxLevel / (maxLevel + mistakes)) * 100)
        });
      } else {
        setTimeout(() => startRound(), 1000);
      }
    }
  };

  const handleClear = () => {
    setUserInput([]);
  };

  const resetGame = () => {
    setGameState('instructions');
    setCurrentLevel(3);
    setMistakes(0);
    setMaxLevel(3);
    setScore(0);
    setSequence([]);
    setUserInput([]);
  };

  const renderInstructions = () => (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🧠 Working Memory Test</Text>
        <Text style={styles.instructions}>
          Memorize the sequence of numbers that appears on screen.
          {'\n\n'}
          After they disappear, enter them in the correct order.
          {'\n\n'}
          The sequence gets longer each round.
          {'\n\n'}
          The test ends after 2 mistakes.
        </Text>
        <TouchableOpacity style={styles.button} onPress={startRound}>
          <Text style={styles.buttonText}>Start Test</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderShowing = () => (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentLevel - 3) * 10}%` }]} />
      </View>
      <View style={styles.card}>
        <Text style={styles.levelText}>Level {currentLevel}</Text>
        <Animated.View style={[styles.sequenceContainer, { opacity: fadeAnim }]}>
          {sequence.map((num, idx) => (
            <Text key={idx} style={styles.sequenceNumber}>{num}</Text>
          ))}
        </Animated.View>
        <Text style={styles.hintText}>Memorize this sequence...</Text>
      </View>
    </View>
  );

  const renderInput = () => (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentLevel - 3) * 10}%` }]} />
      </View>
      <View style={styles.card}>
        <Text style={styles.levelText}>Level {currentLevel}</Text>
        <View style={styles.inputDisplay}>
          {userInput.length > 0 ? (
            userInput.map((num, idx) => (
              <Text key={idx} style={styles.inputNumber}>{num}</Text>
            ))
          ) : (
            <Text style={styles.placeholderText}>Enter sequence...</Text>
          )}
        </View>
        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.keypadButton}
              onPress={() => handleNumberPress(num)}
            >
              <Text style={styles.keypadText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResults = () => {
    const emoji = maxLevel >= 8 ? '🌟' : maxLevel >= 6 ? '😊' : '👍';
    const feedback = maxLevel >= 8 ? 'Outstanding!' : maxLevel >= 6 ? 'Great job!' : 'Good effort!';
    const accuracy = Math.round((maxLevel / (maxLevel + mistakes)) * 100);

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.resultEmoji}>{emoji}</Text>
          <Text style={styles.resultTitle}>{feedback}</Text>
          <View style={styles.resultStats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Max Sequence</Text>
              <Text style={styles.statValue}>{maxLevel}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Score</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={styles.statValue}>{accuracy}%</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.button} onPress={resetGame}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      {gameState === 'instructions' && renderInstructions()}
      {gameState === 'showing' && renderShowing()}
      {gameState === 'input' && renderInput()}
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
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  sequenceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  sequenceNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SPACING.sm,
  },
  hintText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  inputDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    minHeight: 40,
  },
  inputNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SPACING.xs,
  },
  placeholderText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  keypadButton: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    margin: SPACING.xs,
  },
  keypadText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  clearButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    width: '100%',
  },
  clearText: {
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