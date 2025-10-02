import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.h2.fontSize,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  link: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  linkText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.primary,
  },
});