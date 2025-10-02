# Cognitive Tests Documentation

## Overview
This project now includes a variety of cognitive tests to measure different aspects of mental clarity and cognitive function. All tests are implemented as separate React components for better modularity and reusability.

## Available Tests

### 1. Reaction Time Test (`ReactionTimeTest.tsx`)
Measures how quickly a user can respond to visual stimuli.
- **Metrics**: Average reaction time, best reaction time, score
- **Rounds**: 8
- **Scoring**: Lower reaction times result in higher scores

### 2. Working Memory Test (`WorkingMemoryTest.tsx`)
Tests the ability to hold and manipulate information in short-term memory.
- **Mechanics**: Users memorize sequences of numbers that increase in length
- **Metrics**: Maximum sequence length, score, accuracy
- **Scoring**: Longer sequences result in higher scores

### 3. Cognitive Flexibility Test (`CognitiveFlexibilityTest.tsx`)
Measures the ability to switch between different rules or mental sets.
- **Mechanics**: Users switch between number-based (odd/even) and shape-based (circle/square) rules
- **Metrics**: Accuracy, average response time
- **Rounds**: 20

### 4. Stroop Test (`StroopTest.tsx`)
Measures selective attention and cognitive control.
- **Mechanics**: Users must identify the color of text while ignoring the word itself
- **Metrics**: Accuracy, average response time
- **Rounds**: 20

### 5. N-Back Test (`NBackTest.tsx`)
Tests working memory and sustained attention.
- **Mechanics**: Users identify when a stimulus matches the one that appeared N steps earlier
- **Metrics**: Accuracy, average response time
- **Rounds**: 25 (2-back)

## Usage

### In Mental Clarity Modal
All tests are integrated into the `MentalClarityTestModal` component, which allows users to select which test they want to take.

### Individual Usage
Each test can be imported and used individually:

```tsx
import WorkingMemoryTest from '@/components/WorkingMemoryTest';
import CognitiveFlexibilityTest from '@/components/CognitiveFlexibilityTest';
// ... other imports

// In your component
<WorkingMemoryTest onTestComplete={(results) => console.log(results)} />
```

### Test Results Format
All tests follow a consistent pattern for reporting results:
- `accuracy`: Percentage accuracy (where applicable)
- `avgTime`: Average response time in milliseconds (where applicable)
- `score`: Normalized score for comparison across tests

## Styling
All tests use the theme constants from `@/constants/theme` for consistent styling across the application.

## Callbacks
Each test component accepts an optional `onTestComplete` callback that is called when the test is finished with the results object.