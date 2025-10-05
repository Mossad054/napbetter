// IntimacyWellnessHub.tsx
// Multi-page React Native + Expo Router screen implementing the 3-phase Intimate Wellness Hub.
// Uses mock data only. No external chart library required. Keeps UI simple, card-based, scrollable.
// Assumes lucide-react-native is installed for icons and expo-router is available for navigation.

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  DimensionValue,
  Modal,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import {
  Heart,
  ChevronRight,
  Play,
  BookOpen,
  Calendar as CalendarIcon,
  Sparkles,
  MessageSquare,
  X,
  User,
  Users,
  Smile,
  Frown,
  Activity,
  Clock,
  MapPin,
  Target,
  CheckCircle,
  ArrowRight,
  Star,
  Trophy,
  Gift,
  Zap,
  Flame,
  BarChart3,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { getColors } from "@/constants/theme";
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from "@/constants/theme";

/**
 * Intimacy Wellness Hub - Multi-Page Onboarding
 *
 * Features implemented (mock-data-first):
 * - Page 1: Initial Assessment & Setup
 *   - Solo/Couples toggle
 *   - Comprehensive data collection based on user type
 *   - Goal identification
 *   - Baseline establishment
 *
 * - Page 2: Engagement & Activity
 *   - Intimacy Prompts Deck (flip simulated by show/hide)
 *   - Weekly Challenge with completion toggle
 *   - Reflection Journal (local state)
 *   - Date Night Generator (simple suggestions based on inputs)
 *
 * - Page 3: Tracking, Review & Improvement
 *   - Quick intimacy log (satisfaction 1-5, connected Y/N, notes)
 *   - Progress review: small bar chart comparing intimacy score vs mood (mock)
 *   - Adjust plan: button that "recommends" next playlist (mock)
 *
 * UI:
 * - Mobile onboarding style with clean, minimalist design
 * - Single page per phase with clear feedback
 * - Progress indicators
 * - Soft shadows, rounded corners
 *
 * Replace mock data and local state with Supabase calls when ready.
 */

/* ----------------------------
   Mock data (simple structures)
   ----------------------------*/
const MOCK_PLAYLISTS = [
  {
    id: "pl-comm-4wk",
    title: "4-Week Communication Boost",
    durationWeeks: 4,
    description: "Daily micro-exercises to strengthen communication and listening.",
    techniques: ["Active Listening", "Daily Gratitude Share", "Check-in Ritual"],
    goal: "Communication"
  },
  {
    id: "pl-conn-3wk",
    title: "3-Week Connection Track",
    durationWeeks: 3,
    description: "Short prompts + weekly date ideas to increase emotional connection.",
    techniques: ["Touch Ritual", "Affection Reminders", "Shared Mini-Tasks"],
    goal: "Connection"
  },
  {
    id: "pl-pleasure-2wk",
    title: "2-Week Pleasure Exploration",
    durationWeeks: 2,
    description: "Activities to explore and enhance physical intimacy.",
    techniques: ["Body Awareness", "Sensate Focus", "Fantasy Sharing"],
    goal: "Pleasure"
  },
  {
    id: "pl-stress-3wk",
    title: "3-Week Stress Relief",
    durationWeeks: 3,
    description: "Mindfulness and relaxation techniques for intimacy.",
    techniques: ["Breathing Exercises", "Progressive Relaxation", "Mindful Touch"],
    goal: "Stress Relief"
  },
];

const MOCK_TECHNIQUES = [
  { id: "t-1", title: "Active Listening", description: "Reflect what your partner says before responding.", category: "Communication", funIcon: "👂" },
  { id: "t-2", title: "Affection Ritual", description: "1 small non-sexual touch per day with intention.", category: "Connection", funIcon: "🤗" },
  { id: "t-3", title: "Gratitude Share", description: "Share one thing you're grateful for about your partner.", category: "Connection", funIcon: "💝" },
  { id: "t-4", title: "Body Awareness", description: "Mindful exploration of your own body and sensations.", category: "Pleasure", funIcon: "🧘" },
  { id: "t-5", title: "Sensate Focus", description: "Non-goal oriented touching exercises.", category: "Pleasure", funIcon: "🔥" },
  { id: "t-6", title: "Fantasy Sharing", description: "Open communication about sexual desires and fantasies.", category: "Pleasure", funIcon: "💋" },
  { id: "t-7", title: "Breathing Exercises", description: "Synchronized breathing to reduce stress and increase connection.", category: "Stress Relief", funIcon: "💨" },
  { id: "t-8", title: "Progressive Relaxation", description: "Tension and release exercises for the whole body.", category: "Stress Relief", funIcon: "🌊" },
  { id: "t-9", title: "Mindful Touch", description: "Present-moment awareness during physical contact.", category: "Stress Relief", funIcon: "✨" },
  { id: "t-10", title: "Appreciation Notes", description: "Leave surprise notes with things you appreciate.", category: "Connection", funIcon: "📝" },
  { id: "t-11", title: "Eye Gazing", description: "Sit facing each other and gaze into each other's eyes.", category: "Connection", funIcon: "👁️" },
  { id: "t-12", title: "Dance Party", description: "Dance together to your favorite songs.", category: "Pleasure", funIcon: "💃" },
];

const MOCK_PROMPTS = [
  "🌟 What made you smile this week?",
  "💝 Name one small thing I could do that would make you feel loved.",
  "📸 Share a memory of us that you cherish.",
  "✨ What is a tiny change that would improve our intimacy?",
  "💖 What do you appreciate most about our connection?",
  "🎯 How do you feel most loved and appreciated?",
  "🎪 What's one thing we could try together to deepen our intimacy?",
  "🚧 What barriers do you feel prevent us from being more intimate?",
  "⏰ When do you feel most connected to me?",
  "💭 What does intimacy mean to you personally?",
  "🌈 What's something new we could explore together?",
  "🎁 If you could give me a gift that represents our connection, what would it be?"
];

const MOCK_CHALLENGES = [
  { id: "c-1", title: "📱 Tech-free Dinner", hint: "No phones at dinner tonight", completed: false, category: "Connection", funIcon: "🍽️" },
  { id: "c-2", title: "💬 15-min Check-in", hint: "Ask: How are you really feeling?", completed: false, category: "Communication", funIcon: "🗨️" },
  { id: "c-3", title: "💌 Morning Affirmation", hint: "Share one positive thing about your partner", completed: false, category: "Connection", funIcon: "📬" },
  { id: "c-4", title: "🤝 Mindful Touch", hint: "10 minutes of non-sexual touch with full attention", completed: false, category: "Pleasure", funIcon: "👐" },
  { id: "c-5", title: "💋 Fantasy Sharing", hint: "Share a sexual fantasy without judgment", completed: false, category: "Pleasure", funIcon: "💋" },
  { id: "c-6", title: "💨 Breathing Together", hint: "5 minutes of synchronized breathing", completed: false, category: "Stress Relief", funIcon: "🌬️" },
  { id: "c-7", title: "💃 Dance Party", hint: "Dance together to your favorite songs", completed: false, category: "Pleasure", funIcon: "🕺" },
  { id: "c-8", title: "📝 Appreciation Notes", hint: "Leave surprise notes with things you appreciate", completed: false, category: "Connection", funIcon: "📬" },
];

const MOCK_LOGS = [
  {
    id: "log-1",
    date: "2025-10-01",
    satisfaction: 4,
    feltConnected: true,
    notes: "Good conversation after walk.",
  },
  {
    id: "log-2",
    date: "2025-10-02",
    satisfaction: 3,
    feltConnected: false,
    notes: "Busy day, short interaction.",
  },
];

const MOCK_PROGRESS = {
  // average intimacy satisfaction per week (mock)
  weeks: ["Week 1", "Week 2", "Week 3", "Week 4"],
  intimacyScores: [3.8, 4.0, 4.2, 4.1],
  moodScores: [3.5, 3.9, 4.0, 4.0],
};

// Define types for assessment questions
type ScaleQuestion = {
  id: string;
  question: string;
  type: "scale";
  min: number;
  max: number;
  description?: string;
};

type ChoiceQuestion = {
  id: string;
  question: string;
  type: "choice";
  options: string[];
  description?: string;
};

type MultiQuestion = {
  id: string;
  question: string;
  type: "multi";
  options: string[];
  description?: string;
};

type TextQuestion = {
  id: string;
  question: string;
  type: "text";
  placeholder?: string;
  description?: string;
};

type AssessmentQuestion = ScaleQuestion | ChoiceQuestion | MultiQuestion | TextQuestion;

// Enhanced assessment questions for solo users with more detailed questions (1-5 scale)
const SOLO_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  { 
    id: "s1", 
    question: "How would you rate your current level of intimacy with yourself?", 
    type: "scale", 
    min: 1, 
    max: 5,
    description: "Consider emotional, physical, and spiritual connection with yourself"
  },
  { 
    id: "s2", 
    question: "How often do you engage in self-care activities?", 
    type: "choice", 
    options: ["Daily", "3-4 times a week", "Weekly", "Monthly", "Rarely"],
    description: "Including activities that nurture your body, mind, and spirit"
  },
  { 
    id: "s3", 
    question: "What areas of your intimate life would you like to improve?", 
    type: "multi", 
    options: ["Self-connection", "Body image", "Sexual satisfaction", "Emotional intimacy", "Communication", "Stress management"],
    description: "Select all that apply"
  },
  { 
    id: "s4", 
    question: "What prevents you from having a fulfilling intimate life?", 
    type: "text",
    placeholder: "Describe any barriers or challenges...",
    description: "Be as specific as possible"
  },
  { 
    id: "s5", 
    question: "How satisfied are you with your current level of sexual satisfaction?", 
    type: "scale", 
    min: 1, 
    max: 5
  },
  { 
    id: "s6", 
    question: "How connected do you feel to your body and physical sensations?", 
    type: "scale", 
    min: 1, 
    max: 5
  },

];

// Enhanced assessment questions for couples with more detailed questions (1-5 scale)
const COUPLE_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  { 
    id: "c2", 
    question: "How often do you and your partner communicate about intimacy?", 
    type: "choice", 
    options: ["Daily", "3-4 times a week", "Weekly", "Monthly", "Rarely"],
    description: "Including both verbal and non-verbal communication"
  },
  { 
    id: "c3", 
    question: "What areas of your intimate relationship would you like to improve?", 
    type: "multi", 
    options: ["Communication", "Emotional connection", "Physical intimacy", "Trust", "Shared activities", "Conflict resolution"],
    description: "Select all that apply"
  },
  { 
    id: "c4", 
    question: "What prevents you from having a more fulfilling intimate relationship?", 
    type: "text",
    placeholder: "Describe any barriers or challenges...",
    description: "Be as specific as possible"
  },
  { 
    id: "c6", 
    question: "How connected do you feel to your partner emotionally?", 
    type: "scale", 
    min: 1, 
    max: 5
  },

];

/* ----------------------------
   Helper Components
   ----------------------------*/
function EmojiMoodScale({ 
  onRatingChange, 
  initialRating,
  question 
}: { 
  onRatingChange: (rating: number) => void; 
  initialRating?: number;
  question: string;
}) {
  const { isDarkMode } = useTheme();
  const COLORS = getColors(isDarkMode);
  const [selectedRating, setSelectedRating] = useState(initialRating || 0);
  
  const moodOptions = [
    { emoji: "😡", label: "Very Poor", value: 1 },
    { emoji: "🙁", label: "Poor", value: 2 },
    { emoji: "😐", label: "Neutral", value: 3 },
    { emoji: "🙂", label: "Good", value: 4 },
    { emoji: "😃", label: "Excellent", value: 5 },
  ];

  const handleSelect = (rating: number) => {
    setSelectedRating(rating);
    onRatingChange(rating);
  };

  return (
    <View style={[styles.card, { backgroundColor: COLORS.surface, marginTop: 8 }]}>
      <Text style={[styles.label, { color: COLORS.text, marginBottom: 16 }]}>{question}</Text>
      <View style={styles.emojiScaleContainer}>
        {moodOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.emojiOption}
            onPress={() => handleSelect(option.value)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.emojiContainer,
                {
                  backgroundColor: selectedRating === option.value ? COLORS.primary : COLORS.background,
                  transform: [
                    {
                      scale: selectedRating === option.value ? 1.1 : 1,
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
            </View>
            <Text style={[styles.emojiLabel, { color: COLORS.textSecondary }]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  const { isDarkMode } = useTheme();
  const COLORS = getColors(isDarkMode);
  
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { backgroundColor: COLORS.background }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: (progress + "%") as DimensionValue,
              backgroundColor: COLORS.primary 
            }
          ]} 
        />
      </View>
    </View>
  );
}

function SuccessMessage({ title, message }: { title: string; message: string }) {
  const { isDarkMode } = useTheme();
  const COLORS = getColors(isDarkMode);
  
  return (
    <View style={[styles.successContainer, { backgroundColor: COLORS.surface }]}>
      <CheckCircle size={48} color={COLORS.success} style={styles.successIcon} />
      <Text style={[styles.successTitle, { color: COLORS.text }]}>{title}</Text>
      <Text style={[styles.successMessage, { color: COLORS.textSecondary }]}>{message}</Text>
    </View>
  );
}

function DesireSpectrum({ 
  onSelfChange, 
  onPartnerChange,
  selfValue,
  partnerValue
}: { 
  onSelfChange: (value: number) => void; 
  onPartnerChange: (value: number) => void;
  selfValue: number;
  partnerValue: number;
}) {
  const { isDarkMode } = useTheme();
  const COLORS = getColors(isDarkMode);
  
  return (
    <View style={[styles.card, { backgroundColor: COLORS.surface, marginTop: 8 }]}>
      <Text style={[styles.label, { color: COLORS.text, marginBottom: 16 }]}>Desire Spectrum (quick)</Text>
      <Text style={[styles.smallText, { color: COLORS.textSecondary, marginBottom: 16 }]}>
        Rate your current level of sexual desire (1 = low desire, 5 = high desire)
      </Text>
      
      <View style={styles.emojiScaleContainer}>
        {/* Self Desire Rating */}
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={[styles.smallText, { color: COLORS.textSecondary, marginBottom: 16 }]}>You</Text>
          <View style={{ flexDirection: "row" }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={`self-${value}`}
                style={styles.emojiOption}
                onPress={() => onSelfChange(value)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.emojiContainer,
                    {
                      backgroundColor: selfValue === value ? COLORS.primary : COLORS.background,
                      transform: [
                        {
                          scale: selfValue === value ? 1.1 : 1,
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.emoji}>
                    {value === 1 ? "🔴" : 
                     value === 2 ? "🟠" : 
                     value === 3 ? "🟡" : 
                     value === 4 ? "🟢" : 
                     "🟣"}
                  </Text>
                </View>
                <Text style={[styles.emojiLabel, { color: COLORS.textSecondary }]}>
                  {value === 1 ? "Very Low" : 
                   value === 2 ? "Low" : 
                   value === 3 ? "Neutral" : 
                   value === 4 ? "High" : 
                   "Very High"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.tinyText, { color: COLORS.textTertiary, marginTop: 8 }]}>
            {selfValue}/5
          </Text>
        </View>
        
        <View style={{ width: 20 }} />
        
        {/* Partner Desire Rating */}
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={[styles.smallText, { color: COLORS.textSecondary, marginBottom: 16 }]}>Partner</Text>
          <View style={{ flexDirection: "row" }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={`partner-${value}`}
                style={styles.emojiOption}
                onPress={() => onPartnerChange(value)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.emojiContainer,
                    {
                      backgroundColor: partnerValue === value ? COLORS.primary : COLORS.background,
                      transform: [
                        {
                          scale: partnerValue === value ? 1.1 : 1,
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.emoji}>
                    {value === 1 ? "🔴" : 
                     value === 2 ? "🟠" : 
                     value === 3 ? "🟡" : 
                     value === 4 ? "🟢" : 
                     "🟣"}
                  </Text>
                </View>
                <Text style={[styles.emojiLabel, { color: COLORS.textSecondary }]}>
                  {value === 1 ? "Very Low" : 
                   value === 2 ? "Low" : 
                   value === 3 ? "Neutral" : 
                   value === 4 ? "High" : 
                   "Very High"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.tinyText, { color: COLORS.textTertiary, marginTop: 8 }]}>
            {partnerValue}/5
          </Text>
        </View>
      </View>
    </View>
  );
}

// Modal component for displaying playlist details
function PlaylistModal({ 
  visible, 
  onClose, 
  playlist,
  onStartPlan
}: { 
  visible: boolean; 
  onClose: () => void; 
  playlist: any;
  onStartPlan: () => void;
}) {
  const { isDarkMode } = useTheme();
  const COLORS = getColors(isDarkMode);

  if (!playlist) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <View style={[styles.card, { 
          backgroundColor: COLORS.surface, 
          width: '90%',
          maxHeight: '80%',
          padding: 20
        }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={[styles.label, { color: COLORS.text }]}>{playlist.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.smallText, { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 }]}>
                DESCRIPTION
              </Text>
              <Text style={[styles.smallText, { color: COLORS.text }]}>
                {playlist.description}
              </Text>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.smallText, { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 }]}>
                DURATION
              </Text>
              <Text style={[styles.smallText, { color: COLORS.text }]}>
                {playlist.durationWeeks} weeks
              </Text>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.smallText, { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 }]}>
                TECHNIQUES INCLUDED
              </Text>
              {playlist.techniques.map((technique: string, index: number) => (
                <View key={index} style={{ 
                  backgroundColor: COLORS.background, 
                  padding: 8, 
                  borderRadius: 8, 
                  marginBottom: 4 
                }}>
                  <Text style={[styles.smallText, { color: COLORS.text }]}>
                    • {technique}
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.smallText, { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 }]}>
                GOAL
              </Text>
              <View style={[styles.pill, { backgroundColor: COLORS.primary }]}>
                <Text style={{ color: COLORS.surface, fontWeight: '600' }}>
                  {playlist.goal}
                </Text>
              </View>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.smallText, { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 }]}>
                EXPECTED RESULTS
              </Text>
              <Text style={[styles.smallText, { color: COLORS.text }]}>
                By completing this plan, you can expect to see improvements in your {playlist.goal.toLowerCase()} skills, 
                deeper connection with your partner, and enhanced overall intimacy satisfaction.
              </Text>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.smallText, { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 }]}>
                NATURE OF ACTIVITIES
              </Text>
              <Text style={[styles.smallText, { color: COLORS.text }]}>
                This plan includes daily micro-exercises, weekly challenges, and reflection activities 
                designed to gradually build your intimacy skills over time.
              </Text>
            </View>
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: COLORS.primary, marginTop: 16 }]}
            onPress={onStartPlan}
          >
            <Text style={{ color: COLORS.surface, fontWeight: '600' }}>
              Start This Plan
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Modal component for displaying technique details
function TechniqueModal({ 
  visible, 
  onClose, 
  technique,
  onAddToActivities
}: { 
  visible: boolean; 
  onClose: () => void; 
  technique: any;
  onAddToActivities: () => void;
}) {
  const { isDarkMode } = useTheme();
  const COLORS = getColors(isDarkMode);

  if (!technique) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <View style={[styles.card, { 
          backgroundColor: COLORS.surface, 
          width: '90%',
          maxHeight: '80%',
          padding: 20
        }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 10 }}>{technique.funIcon}</Text>
              <Text style={[styles.label, { color: COLORS.text }]}>{technique.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.smallText, { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 }]}>
                DESCRIPTION
              </Text>
              <Text style={[styles.smallText, { color: COLORS.text }]}>
                {technique.description}
              </Text>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.smallText, { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 }]}>
                CATEGORY
              </Text>
              <View style={[styles.pill, { backgroundColor: COLORS.background }]}>
                <Text style={{ color: COLORS.text, fontWeight: '600' }}>
                  {technique.category}
                </Text>
              </View>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.smallText, { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 }]}>
                IMPORTANCE
              </Text>
              <Text style={[styles.smallText, { color: COLORS.text }]}>
                This technique is fundamental for building {technique.category.toLowerCase()} in intimate relationships. 
                Regular practice can lead to significant improvements in your connection with your partner.
              </Text>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.smallText, { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 }]}>
                EXPECTED RESULTS
              </Text>
              <Text style={[styles.smallText, { color: COLORS.text }]}>
                Practicing this technique regularly can help you:
              </Text>
              <Text style={[styles.smallText, { color: COLORS.text, marginTop: 4 }]}>
                • Build stronger emotional connection
              </Text>
              <Text style={[styles.smallText, { color: COLORS.text }]}>
                • Improve communication quality
              </Text>
              <Text style={[styles.smallText, { color: COLORS.text }]}>
                • Increase intimacy satisfaction
              </Text>
              <Text style={[styles.smallText, { color: COLORS.text }]}>
                • Develop better understanding of your partner's needs
              </Text>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.smallText, { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 }]}>
                HOW TO PRACTICE
              </Text>
              <Text style={[styles.smallText, { color: COLORS.text }]}>
                Set aside 5-10 minutes daily to practice this technique. Find a quiet, comfortable space 
                where you and your partner can focus on each other without distractions.
              </Text>
            </View>
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: COLORS.primary, marginTop: 16 }]}
            onPress={onAddToActivities}
          >
            <Text style={{ color: COLORS.surface, fontWeight: '600' }}>
              Add to My Activities
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/* ----------------------------
   Main Hub Component
   ----------------------------*/
function IntimacyWellnessHub() {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const COLORS = getColors(isDarkMode);

  // Navigation state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mode: solo / couples
  const [isCoupleMode, setIsCoupleMode] = useState(true);

  // Assessment state
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, any>>({});
  
  // Desire Spectrum (couples): 1-5 for both partners (mock UI)
  const [desireSelf, setDesireSelf] = useState(3);
  const [desirePartner, setDesirePartner] = useState(3);

  // Selected goal & playlist
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(MOCK_PLAYLISTS[0]);

  // Modal states
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<any>(null);

  // Techniques (preview)
  const techniques = MOCK_TECHNIQUES;

  // Prompts Deck state
  const [prompts, setPrompts] = useState(MOCK_PROMPTS);
  const [promptIndex, setPromptIndex] = useState(0);

  // Challenges
  const [challenges, setChallenges] = useState(MOCK_CHALLENGES);

  // Journal
  const [journalText, setJournalText] = useState("");

  // Date Night inputs & suggestions
  const [dateBudget, setDateBudget] = useState<string>("low");
  const [dateTime, setDateTime] = useState<string>("evening");
  const [dateIdeas, setDateIdeas] = useState<string[] | null>(null);

  // Logs & progress (mock)
  const [logs, setLogs] = useState(MOCK_LOGS);
  const progress = MOCK_PROGRESS;

  // Quick log inputs
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [feltConnected, setFeltConnected] = useState<boolean>(false);
  const [logNotes, setLogNotes] = useState<string>("");

  // Act and Track state
  const [activities, setActivities] = useState<any[]>([
    { id: "a1", title: "Daily Check-in", completed: false, streak: 3, category: "Connection" },
    { id: "a2", title: "Mindful Touch", completed: true, streak: 5, category: "Pleasure" },
    { id: "a3", title: "Gratitude Share", completed: false, streak: 1, category: "Connection" },
    { id: "a4", title: "Breathing Exercise", completed: true, streak: 7, category: "Stress Relief" },
  ]);
  
  const [feedbackText, setFeedbackText] = useState("");
  const [overallSatisfaction, setOverallSatisfaction] = useState<number | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [completedActivities, setCompletedActivities] = useState(0);

  /* ----------------------------
     Assessment handlers
     ----------------------------*/
  const handleAssessmentAnswer = (questionId: string, answer: any) => {
    setAssessmentAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  /* ----------------------------
     Phase actions / helpers
     ----------------------------*/
  const desireMismatch = useMemo(() => Math.abs(desireSelf - desirePartner) > 1, [desireSelf, desirePartner]);

  function applyGoal(goal: string) {
    setSelectedGoal(goal);
    // pick a mock playlist that best matches
    const pick = MOCK_PLAYLISTS.find((p) => p.title.toLowerCase().includes(goal.toLowerCase())) || MOCK_PLAYLISTS[0];
    setSelectedPlaylist(pick);
  }

  function flipPrompt() {
    setPromptIndex((i) => (i + 1) % prompts.length);
  }

  function toggleChallenge(id: string) {
    setChallenges((prev) => prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c)));
  }

  function saveJournal() {
    if (!journalText.trim()) {
      Alert.alert("Empty", "Write something before saving.");
      return;
    }
    // In mock mode we just alert and clear
    Alert.alert("Journal saved", "Your reflection has been saved (mock).");
    setJournalText("");
  }

  function generateDateIdeas() {
    // simple mock generator based on budget/time
    const suggestions: string[] = [];
    if (dateBudget === "low") {
      suggestions.push(dateTime === "evening" ? "Home-cooked themed dinner + playlist" : "Morning coffee & walk");
    } else if (dateBudget === "medium") {
      suggestions.push(dateTime === "evening" ? "Local tapas + live music" : "Museum + brunch");
    } else {
      suggestions.push(dateTime === "evening" ? "Weekend getaway" : "Hot air balloon (day trip)");
    }
    suggestions.push("Simple surprise note + 20-min talk");
    setDateIdeas(suggestions);
  }

  function addQuickLog() {
    if (satisfaction === null) {
      Alert.alert("Missing", "Please select satisfaction (1-5).");
      return;
    }
    const newLog = {
      id: "log-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      satisfaction,
      feltConnected,
      notes: logNotes,
    };
    setLogs((prev) => [newLog, ...prev]);
    Alert.alert("Logged", "Your intimacy log has been saved (mock).");
    setSatisfaction(null);
    setFeltConnected(false);
    setLogNotes("");
  }

  function recommendNextPlaylist() {
    // mock: pick the other playlist
    const next = MOCK_PLAYLISTS.find((p) => p.id !== selectedPlaylist.id) || MOCK_PLAYLISTS[0];
    Alert.alert("Recommendation", "We recommend: " + next.title);
    setSelectedPlaylist(next);
  }

  function toggleActivity(id: string) {
    setActivities(prev => prev.map(activity => {
      if (activity.id === id) {
        const updatedActivity = { ...activity, completed: !activity.completed };
        // Update streak if activity is completed
        if (updatedActivity.completed) {
          updatedActivity.streak = activity.streak + 1;
        }
        return updatedActivity;
      }
      return activity;
    }));
  }

  /* ----------------------------
     Render assessment questions
     ----------------------------*/
  const renderAssessmentQuestions = () => {
    const questions = isCoupleMode ? COUPLE_ASSESSMENT_QUESTIONS : SOLO_ASSESSMENT_QUESTIONS;
    
    return questions.map((q) => (
      <View key={q.id} style={{ marginBottom: 16 }}>
        {/* Only show question text for non-scale questions since EmojiMoodScale handles it for scale questions */}
        {q.type !== "scale" && (
          <>
            <Text style={[styles.label, { color: COLORS.text }]}>{q.question}</Text>
            {q.description && (
              <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 4 }]}>
                {q.description}
              </Text>
            )}
          </>
        )}
        
        {q.type === "scale" && (
          // Use the EmojiMoodScale component for scale questions (it includes the question text)
          <EmojiMoodScale 
            question={q.question}
            onRatingChange={(rating) => handleAssessmentAnswer(q.id, rating)}
            initialRating={assessmentAnswers[q.id]}
          />
        )}
        
        {q.type === "choice" && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {(q as ChoiceQuestion).options.map((option) => (
              <TouchableOpacity 
                key={option}
                style={[styles.pill, { backgroundColor: COLORS.background }, assessmentAnswers[q.id] === option && { backgroundColor: COLORS.primary }]}
                onPress={() => handleAssessmentAnswer(q.id, option)}
              >
                <Text style={{ color: assessmentAnswers[q.id] === option ? COLORS.surface : COLORS.text }}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {q.type === "multi" && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {(q as MultiQuestion).options.map((option) => {
              const selected = Array.isArray(assessmentAnswers[q.id]) && assessmentAnswers[q.id].includes(option);
              return (
                <TouchableOpacity 
                  key={option}
                  style={[styles.pill, { backgroundColor: COLORS.background }, selected && { backgroundColor: COLORS.primary }]}
                  onPress={() => {
                    const current = Array.isArray(assessmentAnswers[q.id]) ? assessmentAnswers[q.id] : [];
                    if (selected) {
                      handleAssessmentAnswer(q.id, current.filter((item: string) => item !== option));
                    } else {
                      handleAssessmentAnswer(q.id, [...current, option]);
                    }
                  }}
                >
                  <Text style={{ color: selected ? COLORS.surface : COLORS.text }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        
        {q.type === "text" && (
          <>
            {q.description && (
              <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 4 }]}>
                {q.description}
              </Text>
            )}
            <TextInput
              value={assessmentAnswers[q.id] || ""}
              onChangeText={(text) => handleAssessmentAnswer(q.id, text)}
              placeholder={q.placeholder || "Type your answer here..."}
              multiline
              style={[styles.textArea, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text, marginTop: 8 }]}
              placeholderTextColor={COLORS.textSecondary}
            />
          </>
        )}
      </View>
    ));
  };

  /* ----------------------------
     Render Pages
     ----------------------------*/
  const renderPage1 = () => (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.backgroundSecondary }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Intimate Wellness Hub",
          headerStyle: { backgroundColor: COLORS.surface },
          headerTitleStyle: { color: COLORS.text, fontWeight: "600" },
          headerLeft: () => (
            <TouchableOpacity style={{ padding: 8 }} onPress={() => router.back()}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Heart size={48} color={COLORS.primary} />
          <Text style={[styles.pageTitle, { color: COLORS.text, marginTop: 12 }]}>Assessment & Setup</Text>
          <Text style={[styles.pageSubtitle, { color: COLORS.textSecondary, marginTop: 4 }]}>Understanding your intimate needs</Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: COLORS.surface, marginTop: 20 }]}>
          <ProgressBar progress={33} />
          
          <Text style={[styles.smallText, { color: COLORS.textSecondary, marginBottom: 16, marginTop: 16 }]}>
            Complete this assessment to help us understand your intimate needs and goals. 
            Your responses will be used to personalize your experience in later phases.
          </Text>
          
          {/* Solo/Couples */}
          <View style={styles.row}>
            <Text style={[styles.label, { color: COLORS.text }]}>Mode</Text>
            <View style={styles.rowRight}>
              <Text style={[styles.smallText, { color: COLORS.textSecondary }]}>{isCoupleMode ? "Couples" : "Solo"}</Text>
              <Switch value={isCoupleMode} onValueChange={setIsCoupleMode} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor={isCoupleMode ? COLORS.surface : COLORS.textSecondary} />
            </View>
          </View>

          {/* Desire Spectrum (couples only) */}
          {isCoupleMode && (
            <DesireSpectrum 
              onSelfChange={setDesireSelf}
              onPartnerChange={setDesirePartner}
              selfValue={desireSelf}
              partnerValue={desirePartner}
            />
          )}

          {/* Comprehensive Assessment */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.label, { color: COLORS.text }]}>
              {isCoupleMode ? "Couple Assessment" : "Solo Assessment"}
            </Text>
            <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 4 }]}>
              Help us understand your intimate needs and goals
            </Text>
            
            {renderAssessmentQuestions()}
            
            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: COLORS.primary, marginTop: 16 }]} 
              onPress={() => {
                // Save assessment data (in a real app, this would be sent to a backend)
                console.log("Assessment completed:", {
                  mode: isCoupleMode ? "couple" : "solo",
                  answers: assessmentAnswers,
                  desireSelf: isCoupleMode ? desireSelf : undefined,
                  desirePartner: isCoupleMode ? desirePartner : undefined
                });
                
                setCurrentPage(2);
              }}
            >
              <Text style={{ color: COLORS.surface, fontWeight: "600" }}>Continue to Next Phase</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderPage2 = () => (
    <View style={{ flex: 1, backgroundColor: COLORS.backgroundSecondary }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Intimate Wellness Hub",
          headerStyle: { backgroundColor: COLORS.surface },
          headerTitleStyle: { color: COLORS.text, fontWeight: "600" },
          headerLeft: () => (
            <TouchableOpacity style={{ padding: 8 }} onPress={() => setCurrentPage(1)}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <BookOpen size={48} color={COLORS.accent} />
          <Text style={[styles.pageTitle, { color: COLORS.text, marginTop: 12 }]}>Learn & Explore</Text>
          <Text style={[styles.pageSubtitle, { color: COLORS.textSecondary, marginTop: 4 }]}>Discover personalized techniques</Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: COLORS.surface, marginTop: 20 }]}>
          <ProgressBar progress={66} />
          
          <Text style={[styles.smallText, { color: COLORS.textSecondary, marginBottom: 16, marginTop: 16 }]}>
            Based on your assessment, we've prepared personalized content to help you grow.
          </Text>
          
          {/* Goal Setting */}
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.label, { color: COLORS.text }]}>Choose a Goal</Text>
            <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 4 }]}>
              Based on your assessment, what would you like to focus on?
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {["Communication", "Connection", "Pleasure", "Stress Relief"].map((g) => (
                <TouchableOpacity 
                  key={g} 
                  style={[
                    styles.goalButton, 
                    { backgroundColor: COLORS.background }, 
                    selectedGoal === g && { backgroundColor: COLORS.primary }
                  ]} 
                  onPress={() => applyGoal(g)}
                >
                  <Text style={[
                    styles.goalText, 
                    { color: COLORS.text }, 
                    selectedGoal === g && { color: COLORS.surface }
                  ]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected playlist */}
            {selectedPlaylist && (
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.label, { color: COLORS.text }]}>Recommended Plan</Text>
                <TouchableOpacity 
                  style={[styles.playlistBox, { backgroundColor: COLORS.surfaceLight }]} 
                  onPress={() => setShowPlaylistModal(true)}
                >
                  <Text style={{ fontWeight: "700", color: COLORS.text }}>{selectedPlaylist.title}</Text>
                  <Text style={{ marginTop: 6, color: COLORS.textSecondary }}>{selectedPlaylist.description}</Text>
                  <Text style={{ marginTop: 6, color: COLORS.textTertiary }}>Techniques: {selectedPlaylist.techniques.join(", ")}</Text>
                  <Text style={{ marginTop: 6, color: COLORS.primary, fontWeight: "600" }}>Goal: {selectedPlaylist.goal}</Text>
                  <Text style={{ marginTop: 8, color: COLORS.accent, fontSize: 12, textAlign: 'right' }}>Tap to view details</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Technique Library */}
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.label, { color: COLORS.text }]}>Habit Library</Text>
            <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 4 }]}>
              Personalized techniques based on your goals
            </Text>
            {techniques
              .filter(t => !selectedPlaylist || t.category === selectedPlaylist.goal)
              .map((t) => (
                <TouchableOpacity 
                  key={t.id} 
                  style={[styles.techRow, { backgroundColor: COLORS.surfaceLight, borderRadius: 8, padding: 12, marginTop: 8 }]}
                  onPress={() => {
                    setSelectedTechnique(t);
                    setShowTechniqueModal(true);
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 24, marginRight: 10 }}>{t.funIcon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "600", color: COLORS.text }}>{t.title}</Text>
                      <Text style={{ color: COLORS.textSecondary, marginTop: 4 }}>{t.description}</Text>
                      <View style={[styles.pill, { backgroundColor: COLORS.background, alignSelf: "flex-start", marginTop: 6 }]}>
                        <Text style={{ color: COLORS.text, fontSize: 12 }}>{t.category}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: COLORS.accent, fontSize: 12 }}>Details</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
          
          {/* Prompts Deck */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.label, { color: COLORS.text }]}>Intimacy Prompts</Text>
            <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 4 }]}>
              Conversation starters to deepen connection
            </Text>
            <View style={[styles.promptCard, { backgroundColor: COLORS.surfaceLight, marginTop: 8 }]}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.text }}>{prompts[promptIndex]}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 12 }}>
              <TouchableOpacity style={styles.smallBtn} onPress={() => flipPrompt()}>
                <Text style={{ color: COLORS.text }}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Weekly Challenge */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.label, { color: COLORS.text }]}>Weekly Challenge</Text>
            <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 4 }]}>
              Try out one activity together and report your completion!
            </Text>
            <View style={[styles.card, { backgroundColor: COLORS.surfaceLight, padding: 12, marginTop: 8 }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontWeight: "600", color: COLORS.text }}>{challenges[promptIndex].title}</Text>
                <TouchableOpacity onPress={() => toggleChallenge(challenges[promptIndex].id)}>
                  {challenges[promptIndex].completed ? <X size={24} color={COLORS.error} /> : <Sparkles size={24} color={COLORS.accent} />}
                </TouchableOpacity>
              </View>
              <Text style={{ marginTop: 8, color: COLORS.textSecondary }}>{challenges[promptIndex].hint}</Text>
            </View>
          </View>
          
          {/* Reflection Journal */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.label, { color: COLORS.text }]}>Reflection Journal</Text>
            <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 4 }]}>
              Write your thoughts after a shared intimate experience.
            </Text>
            <TextInput
              value={journalText}
              onChangeText={setJournalText}
              placeholder="How was the connection?"
              style={[styles.textArea, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text, marginTop: 8 }]}
              placeholderTextColor={COLORS.textSecondary}
              multiline
            />
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: COLORS.primary, marginTop: 8 }]} onPress={saveJournal}>
              <Text style={{ color: COLORS.surface, fontWeight: "600" }}>Save to Journal</Text>
            </TouchableOpacity>
          </View>
          
          {/* Date Night Generator */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.label, { color: COLORS.text }]}>Date Night Idea Generator</Text>
            <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 4 }]}>
              Get custom ideas for connecting in ways you'll enjoy!
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 8 }}>
              <TouchableOpacity style={styles.smallBtn} onPress={() => setDateBudget("low")}>
                <Text style={{ color: COLORS.text }}>Low</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallBtn} onPress={() => setDateBudget("medium")}>
                <Text style={{ color: COLORS.text }}>Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallBtn} onPress={() => setDateBudget("high")}>
                <Text style={{ color: COLORS.text }}>High</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 8 }}>
              <TouchableOpacity style={styles.smallBtn} onPress={() => setDateTime("morning")}>
                <Text style={{ color: COLORS.text }}>Morning</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallBtn} onPress={() => setDateTime("evening")}>
                <Text style={{ color: COLORS.text }}>Evening</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: COLORS.primary, marginTop: 16 }]} onPress={generateDateIdeas}>
              <Text style={{ color: COLORS.surface, fontWeight: "600" }}>Generate Idea!</Text>
            </TouchableOpacity>
            {dateIdeas && dateIdeas.map((idea) => (
              <View key={idea} style={[styles.card, { backgroundColor: COLORS.surfaceLight, padding: 12, margin: 8 }]}>
                <Text style={{ color: COLORS.text }}>{idea}</Text>
              </View>
            ))}
          </View>
          
          {/* Navigation to Act & Track */}
          <View style={{ marginTop: 24 }}>
            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => setCurrentPage(3)}
            >
              <Text style={{ color: COLORS.surface, fontWeight: "600" }}>Continue to Act & Track</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderPage3 = () => (
    <View style={{ flex: 1, backgroundColor: COLORS.backgroundSecondary }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Intimate Wellness Hub",
          headerStyle: { backgroundColor: COLORS.surface },
          headerTitleStyle: { color: COLORS.text, fontWeight: "600" },
          headerLeft: () => (
            <TouchableOpacity style={{ padding: 8 }} onPress={() => setCurrentPage(2)}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Target size={48} color={COLORS.primary} />
          <Text style={[styles.pageTitle, { color: COLORS.text, marginTop: 12 }]}>Act & Track</Text>
          <Text style={[styles.pageSubtitle, { color: COLORS.textSecondary, marginTop: 4 }]}>Track your activities and progress</Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: COLORS.surface, marginTop: 20 }]}>
          <ProgressBar progress={66} />
          
          <Text style={[styles.smallText, { color: COLORS.textSecondary, marginBottom: 16, marginTop: 16 }]}>
            Track your daily activities, view your progress, and provide feedback on your experience.
          </Text>
          
          {/* Activities Tracking */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.label, { color: COLORS.text }]}>Today's Activities</Text>
            <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 4 }]}>
              Track your daily intimacy activities
            </Text>
            
            {activities.map((activity) => (
              <View key={activity.id} style={[styles.card, { backgroundColor: COLORS.surfaceLight, padding: 12, marginTop: 8 }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", color: COLORS.text }}>{activity.title}</Text>
                    <View style={[styles.pill, { backgroundColor: COLORS.background, alignSelf: "flex-start", marginTop: 6 }]}>
                      <Text style={{ color: COLORS.text, fontSize: 12 }}>{activity.category}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {activity.streak > 0 && (
                      <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                        <Flame size={16} color={COLORS.primary} />
                        <Text style={{ color: COLORS.text, marginLeft: 4, fontWeight: "600" }}>{activity.streak}</Text>
                      </View>
                    )}
                    <TouchableOpacity 
                      onPress={() => toggleActivity(activity.id)}
                      style={[
                        styles.checkbox, 
                        { 
                          backgroundColor: activity.completed ? COLORS.success : COLORS.background,
                          minWidth: 80
                        }
                      ]}
                    >
                      <Text style={{ color: activity.completed ? COLORS.surface : COLORS.text, fontWeight: "600" }}>
                        {activity.completed ? "Completed" : "Mark Done"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
          
          {/* Progress Overview */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.label, { color: COLORS.text }]}>Progress Overview</Text>
            <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 4 }]}>
              Your intimacy journey so far
            </Text>
            
            <View style={[styles.card, { backgroundColor: COLORS.surfaceLight, padding: 16, marginTop: 8 }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={{ fontWeight: "600", color: COLORS.text }}>Current Streak</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <Flame size={20} color={COLORS.primary} />
                    <Text style={{ color: COLORS.text, marginLeft: 8, fontSize: 18, fontWeight: "700" }}>
                      {activities.filter(a => a.completed).length} days
                    </Text>
                  </View>
                </View>
                <View>
                  <Text style={{ fontWeight: "600", color: COLORS.text }}>Activities Completed</Text>
                  <Text style={{ color: COLORS.text, marginTop: 4, fontSize: 18, fontWeight: "700", textAlign: "right" }}>
                    {activities.filter(a => a.completed).length}/{activities.length}
                  </Text>
                </View>
              </View>
              
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontWeight: "600", color: COLORS.text }}>Completion Rate</Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                  <View style={{ flex: 1, height: 8, backgroundColor: COLORS.background, borderRadius: 4 }}>
                    <View 
                      style={{ 
                        height: "100%", 
                        width: `${(activities.filter(a => a.completed).length / activities.length) * 100}%`, 
                        backgroundColor: COLORS.primary, 
                        borderRadius: 4 
                      }} 
                    />
                  </View>
                  <Text style={{ color: COLORS.text, marginLeft: 8, fontWeight: "600" }}>
                    {Math.round((activities.filter(a => a.completed).length / activities.length) * 100)}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Feedback Section */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.label, { color: COLORS.text }]}>Share Your Feedback</Text>
            <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 4 }]}>
              Help us improve your experience
            </Text>
            
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.smallText, { color: COLORS.text, fontWeight: "600" }]}>Overall Satisfaction</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={styles.satDot}
                    onPress={() => setOverallSatisfaction(value)}
                  >
                    <View
                      style={[
                        styles.emojiContainer,
                        {
                          backgroundColor: overallSatisfaction === value ? COLORS.primary : COLORS.background,
                          transform: [
                            {
                              scale: overallSatisfaction === value ? 1.1 : 1,
                            },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.emoji}>{value}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TextInput
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="What's working well? What could be improved?"
              style={[styles.textArea, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text, marginTop: 16 }]}
              placeholderTextColor={COLORS.textSecondary}
              multiline
            />
            
            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: COLORS.primary, marginTop: 16 }]}
              onPress={() => {
                if (!feedbackText.trim() && overallSatisfaction === null) {
                  Alert.alert("Feedback", "Please provide feedback or rating before submitting.");
                  return;
                }
                // Save feedback (mock)
                console.log("Feedback submitted:", { feedbackText, overallSatisfaction });
                setShowSuccessMessage(true);
                setTimeout(() => setShowSuccessMessage(false), 3000);
                setFeedbackText("");
                setOverallSatisfaction(null);
              }}
            >
              <Text style={{ color: COLORS.surface, fontWeight: "600" }}>Submit Feedback</Text>
            </TouchableOpacity>
            
            {showSuccessMessage && (
              <View style={{ marginTop: 12, padding: 12, backgroundColor: `${COLORS.success}20`, borderRadius: 8, alignItems: "center" }}>
                <Text style={{ color: COLORS.success, fontWeight: "600" }}>Feedback submitted successfully!</Text>
              </View>
            )}
          </View>
          
          {/* Save All Data Button */}
          <View style={{ marginTop: 24 }}>
            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => {
                // Save all data (mock)
                console.log("All data saved:", { 
                  activities, 
                  feedback: { feedbackText, overallSatisfaction },
                  logs
                });
                Alert.alert(
                  "Data Saved", 
                  "All your progress and activities have been saved successfully!",
                  [
                    { text: "Continue", onPress: () => setCurrentPage(4) }
                  ]
                );
              }}
            >
              <Text style={{ color: COLORS.surface, fontWeight: "600" }}>Save All Data & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderPage4 = () => (
    <View style={{ flex: 1, backgroundColor: COLORS.backgroundSecondary }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Intimate Wellness Hub",
          headerStyle: { backgroundColor: COLORS.surface },
          headerTitleStyle: { color: COLORS.text, fontWeight: "600" },
          headerLeft: () => (
            <TouchableOpacity style={{ padding: 8 }} onPress={() => setCurrentPage(3)}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Trophy size={48} color={COLORS.primary} />
          <Text style={[styles.pageTitle, { color: COLORS.text, marginTop: 12 }]}>Congratulations!</Text>
          <Text style={[styles.pageSubtitle, { color: COLORS.textSecondary, marginTop: 4 }]}>You've completed the wellness journey</Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: COLORS.surface, marginTop: 20 }]}>
          <ProgressBar progress={100} />
          
          <Text style={[styles.smallText, { color: COLORS.textSecondary, marginBottom: 16, marginTop: 16 }]}>
            You've successfully completed all phases of the Intimate Wellness Hub. Your data has been saved and you're ready to continue your journey.
          </Text>
          
          {/* Completion Summary */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.label, { color: COLORS.text }]}>Your Journey Summary</Text>
            
            <View style={[styles.card, { backgroundColor: COLORS.surfaceLight, padding: 16, marginTop: 12 }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: "700" }}>
                    {activities.filter(a => a.completed).length}
                  </Text>
                  <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 4 }]}>Activities</Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: "700" }}>
                    {Math.round((activities.filter(a => a.completed).length / activities.length) * 100)}%
                  </Text>
                  <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 4 }]}>Completion</Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: "700" }}>
                    {activities.filter(a => a.completed).length}
                  </Text>
                  <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 4 }]}>Day Streak</Text>
                </View>
              </View>
              
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.label, { color: COLORS.text, fontSize: 18 }]}>Next Steps</Text>
                <Text style={[styles.smallText, { color: COLORS.textSecondary, marginTop: 8 }]}>
                  Continue practicing the activities you've learned to maintain and build on your progress.
                </Text>
              </View>
              
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.label, { color: COLORS.text, fontSize: 18 }]}>Resources</Text>
                <View style={{ marginTop: 8 }}>
                  <TouchableOpacity 
                    style={[styles.card, { backgroundColor: COLORS.background, padding: 12, flexDirection: "row", alignItems: "center" }]}
                    onPress={() => Alert.alert("Resource", "Your personalized plan recommendations will appear here.")}
                  >
                    <Gift size={20} color={COLORS.primary} />
                    <Text style={{ color: COLORS.text, marginLeft: 12, flex: 1 }}>Personalized Plan Recommendations</Text>
                    <ChevronRight size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.card, { backgroundColor: COLORS.background, padding: 12, flexDirection: "row", alignItems: "center", marginTop: 8 }]}
                    onPress={() => Alert.alert("Resource", "Your progress tracking tools will appear here.")}
                  >
                    <BarChart3 size={20} color={COLORS.accent} />
                    <Text style={{ color: COLORS.text, marginLeft: 12, flex: 1 }}>Progress Tracking Tools</Text>
                    <ChevronRight size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.card, { backgroundColor: COLORS.background, padding: 12, flexDirection: "row", alignItems: "center", marginTop: 8 }]}
                    onPress={() => Alert.alert("Resource", "Community support resources will appear here.")}
                  >
                    <Users size={20} color={COLORS.success} />
                    <Text style={{ color: COLORS.text, marginLeft: 12, flex: 1 }}>Community Support</Text>
                    <ChevronRight size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={{ marginTop: 24, flexDirection: "row", justifyContent: "space-between" }}>
            <TouchableOpacity 
              style={[styles.secondaryBtn, { backgroundColor: COLORS.surface, borderColor: COLORS.border, flex: 1, marginRight: 8 }]}
              onPress={() => setCurrentPage(3)}
            >
              <Text style={{ color: COLORS.text, fontWeight: "600" }}>Review Progress</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: COLORS.primary, flex: 1, marginLeft: 8 }]}
              onPress={() => {
                Alert.alert(
                  "Wellness Journey Complete",
                  "You've successfully completed the Intimate Wellness Hub! Your progress has been saved. Continue practicing the techniques you've learned to maintain and build on your progress.",
                  [
                    { 
                      text: "Finish", 
                      onPress: () => {
                        // Reset to first page for potential future use
                        setCurrentPage(1);
                        // In a real app, you might navigate back to the main screen
                        router.back();
                      } 
                    }
                  ]
                );
              }}
            >
              <Text style={{ color: COLORS.surface, fontWeight: "600" }}>Finish Journey</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  /* ----------------------------
     Render
     ----------------------------*/
  return (
    <>
      {currentPage === 1 && renderPage1()}
      {currentPage === 2 && renderPage2()}
      {currentPage === 3 && renderPage3()}
      {currentPage === 4 && renderPage4()}
      <PlaylistModal 
        visible={showPlaylistModal} 
        onClose={() => setShowPlaylistModal(false)} 
        playlist={selectedPlaylist}
        onStartPlan={() => {
          setShowPlaylistModal(false);
          // TODO: Implement actual plan start logic
          Alert.alert("Plan Started", "You have successfully started the plan!");
        }}
      />
      <TechniqueModal 
        visible={showTechniqueModal} 
        onClose={() => setShowTechniqueModal(false)} 
        technique={selectedTechnique}
        onAddToActivities={() => {
          setShowTechniqueModal(false);
          // TODO: Implement actual add to activities logic
          if (selectedTechnique) {
            Alert.alert("Added to Activities", `${selectedTechnique.title} has been added to your activities!`);
          }
        }}
      />
    </>
  );
}

/* ----------------------------
   Styles
   ----------------------------*/
const styles = StyleSheet.create({
  label: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  smallText: {
    fontSize: 16,
    color: "#757575",
    fontWeight: "normal",
  },
  primaryBtn: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryBtn: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  smallBtn: {
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  pill: {
    padding: 4,
    borderRadius: 16,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  tinyText: { 
    fontSize: 11, 
    color: "#9CA3AF",
    fontWeight: "normal",
  },
  rangeRow: { 
    flexDirection: "row", 
    marginTop: 8, 
    flexWrap: "wrap", 
    gap: 6, 
    maxWidth: 180 
  },
  rangeDot: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  warningBox: { 
    marginTop: 10, 
    padding: 12, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F39C12"
  },
  goalButton: { 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0"
  },
  goalText: { 
    fontSize: 14,
    fontWeight: "normal",
  },
  playlistBox: { 
    marginTop: 8, 
    padding: 12, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0"
  },
  techRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 8, 
    justifyContent: "space-between" 
  },
  promptCard: { 
    padding: 12, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0"
  },
  challengeRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FAFAFA"
  },
  checkbox: { 
    padding: 8, 
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center"
  },
  textArea: { 
    minHeight: 80, 
    borderWidth: 1, 
    borderRadius: 8, 
    padding: 10, 
    marginTop: 8,
    fontSize: 16,
    fontWeight: "400",
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginVertical: 20
  },
  progressBar: {
    height: "100%",
    borderRadius: 3
  },
  progressFill: {
    height: "100%"
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  pageSubtitle: {
    fontSize: 16,
    fontWeight: "normal",
  },
  successContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  successIcon: {
    marginBottom: 16
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  successMessage: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "normal",
  },
  satDot: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  // Add these new styles for the emoji mood scale
  emojiScaleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
  },
  emojiOption: {
    alignItems: "center",
    justifyContent: "center",
  },
  emojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emoji: {
    fontSize: 28,
  },
  emojiLabel: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "normal",
  },

});

export default IntimacyWellnessHub;