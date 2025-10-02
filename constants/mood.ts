import { Mood } from '@/types/mood';

export const MOODS: Mood[] = [
  { id: 1, name: 'awful', color: '#FF4757', value: 1, emoji: '😢' },
  { id: 2, name: 'bad', color: '#FF7F50', value: 2, emoji: '😕' },
  { id: 3, name: 'meh', color: '#5DADE2', value: 3, emoji: '😐' },
  { id: 4, name: 'good', color: '#58D68D', value: 4, emoji: '😊' },
  { id: 5, name: 'rad', color: '#2ECC71', value: 5, emoji: '😄' },
];

export const getMoodById = (id: number): Mood | undefined => {
  return MOODS.find(mood => mood.id === id);
};

export const getMoodByValue = (value: number): Mood | undefined => {
  return MOODS.find(mood => mood.value === value);
};