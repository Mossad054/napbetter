import { Activity, SleepTutorial } from '@/types/mood';

export const DEFAULT_ACTIVITIES: Omit<Activity, 'id'>[] = [
  // Work
  { name: 'Work', icon: 'briefcase', category: 'Work', isGood: true },
  { name: 'Meeting', icon: 'users', category: 'Work', isGood: false },
  { name: 'Deadline', icon: 'clock', category: 'Work', isGood: false },
  
  // Social
  { name: 'Friends', icon: 'heart', category: 'Social', isGood: true },
  { name: 'Family', icon: 'home', category: 'Social', isGood: true },
  { name: 'Party', icon: 'music', category: 'Social', isGood: true },
  { name: 'Date', icon: 'heart', category: 'Social', isGood: true },
  
  // Health
  { name: 'Exercise', icon: 'activity', category: 'Health', isGood: true },
  { name: 'Sleep', icon: 'moon', category: 'Health', isGood: true },
  { name: 'Sick', icon: 'thermometer', category: 'Health', isGood: false },
  { name: 'Doctor', icon: 'stethoscope', category: 'Health', isGood: false },
  
  // Food
  { name: 'Cooking', icon: 'chef-hat', category: 'Food', isGood: true },
  { name: 'Restaurant', icon: 'utensils', category: 'Food', isGood: true },
  { name: 'Fast Food', icon: 'pizza', category: 'Food', isGood: false },
  
  // Entertainment
  { name: 'Movie', icon: 'film', category: 'Entertainment', isGood: true },
  { name: 'Reading', icon: 'book', category: 'Entertainment', isGood: true },
  { name: 'Gaming', icon: 'gamepad-2', category: 'Entertainment', isGood: true },
  { name: 'TV', icon: 'tv', category: 'Entertainment', isGood: true },
  
  // Intimacy
  { name: 'Solo Intimacy', icon: 'heart', category: 'Intimacy', isGood: true },
  { name: 'Couple Intimacy', icon: 'heart', category: 'Intimacy', isGood: true },
  { name: 'Romantic Time', icon: 'heart', category: 'Intimacy', isGood: true },
  
  // Other
  { name: 'Shopping', icon: 'shopping-bag', category: 'Other', isGood: true },
  { name: 'Travel', icon: 'plane', category: 'Other', isGood: true },
  { name: 'Cleaning', icon: 'spray-can', category: 'Other', isGood: false },
  { name: 'Stress', icon: 'zap', category: 'Other', isGood: false },
];

export const SLEEP_TUTORIALS: SleepTutorial[] = [
  {
    id: 'breathing-4-7-8',
    title: '4-7-8 Breathing Technique',
    description: 'A simple breathing exercise to help you fall asleep faster',
    type: 'breathing',
    duration: 5,
    instructions: [
      'Exhale completely through your mouth',
      'Close your mouth and inhale through your nose for 4 counts',
      'Hold your breath for 7 counts',
      'Exhale through your mouth for 8 counts',
      'Repeat this cycle 3-4 times'
    ]
  },
  {
    id: 'sleep-hygiene-basics',
    title: 'Sleep Hygiene Basics',
    description: 'Essential habits for better sleep quality',
    type: 'hygiene',
    duration: 10,
    instructions: [
      'Keep your bedroom cool (60-67°F)',
      'Make your room as dark as possible',
      'Avoid screens 1 hour before bed',
      'Stick to a consistent sleep schedule',
      'Avoid caffeine after 2 PM',
      'Create a relaxing bedtime routine'
    ]
  },
  {
    id: 'progressive-muscle-relaxation',
    title: 'Progressive Muscle Relaxation',
    description: 'Systematically relax your entire body',
    type: 'relaxation',
    duration: 15,
    instructions: [
      'Start with your toes - tense for 5 seconds, then relax',
      'Move to your calves, then thighs',
      'Continue with your abdomen and chest',
      'Tense and relax your arms and hands',
      'Finish with your neck and face muscles',
      'Notice the difference between tension and relaxation'
    ]
  },
  {
    id: 'body-scan-meditation',
    title: 'Body Scan Meditation',
    description: 'Mindful awareness of your body to promote sleep',
    type: 'meditation',
    duration: 20,
    instructions: [
      'Lie down comfortably and close your eyes',
      'Start by noticing your breath',
      'Slowly scan from the top of your head down',
      'Notice any sensations without judgment',
      'If your mind wanders, gently return to the body scan',
      'End by taking three deep breaths'
    ]
  }
];

export const ACTIVITY_CATEGORIES = [
  'Work',
  'Social', 
  'Health',
  'Food',
  'Entertainment',
  'Intimacy',
  'Other'
];