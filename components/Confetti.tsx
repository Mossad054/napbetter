import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS } from '@/constants/theme';

interface ConfettiProps {
  visible: boolean;
  onComplete: () => void;
}

const Confetti: React.FC<ConfettiProps> = ({ visible, onComplete }) => {
  const confettiPieces = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 500,
    duration: Math.random() * 1000 + 1000,
    emoji: ['✨', '🎉', '🎊', '⭐', '🌟', '💥', '💫'][Math.floor(Math.random() * 7)],
    size: Math.random() * 10 + 10,
  }));

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          left={piece.left}
          delay={piece.delay}
          duration={piece.duration}
          emoji={piece.emoji}
          size={piece.size}
        />
      ))}
    </View>
  );
};

interface ConfettiPieceProps {
  left: number;
  delay: number;
  duration: number;
  emoji: string;
  size: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ left, delay, duration, emoji, size }) => {
  const translateY = new Animated.Value(0);
  const opacity = new Animated.Value(1);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, duration, translateY, opacity]);

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          left: `${left}%`,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Text style={[styles.emoji, { fontSize: size }]}>{emoji}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  confettiPiece: {
    position: 'absolute',
    top: '-20%',
  },
  emoji: {
    color: COLORS.primary,
  },
});

export default Confetti;