// app/tests/CognitiveTests.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

// This file is kept for backward compatibility but the individual test components
// have been moved to separate files for better modularity:
// - WorkingMemoryTest.tsx
// - CognitiveFlexibilityTest.tsx
// - StroopTest.tsx
// - NBackTest.tsx
// - ReactionTimeTest.tsx

export function CognitiveTestsOverview() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cognitive Tests</Text>
      <Text style={styles.text}>
        Individual cognitive tests have been moved to separate components for better modularity.
      </Text>
      <Text style={styles.text}>
        Please import them directly from their respective files:
      </Text>
      <Text style={styles.text}>- WorkingMemoryTest</Text>
      <Text style={styles.text}>- CognitiveFlexibilityTest</Text>
      <Text style={styles.text}>- StroopTest</Text>
      <Text style={styles.text}>- NBackTest</Text>
      <Text style={styles.text}>- ReactionTimeTest</Text>
    </View>
  );
}

/* ============ Shared Styles ============ */
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  text: { fontSize: 16, marginVertical: 5 },
});