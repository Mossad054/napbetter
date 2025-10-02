import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Target, Heart, Brain, Activity, Moon, Search, Plus, Flame, X } from 'lucide-react-native';
import AddHabitModal from '@/components/AddHabitModal';
import { useHabitRecommendations } from '@/hooks/use-habit-recommendations';
import { useHabits } from '@/hooks/use-habits';

// Define habit categories
const CATEGORIES = [
  { id: 'sleep', name: 'Sleep', icon: Moon, color: COLORS.primary, emoji: '🛌' },
  { id: 'mood', name: 'Mood', icon: Heart, color: COLORS.error, emoji: '😊' },
  { id: 'anxiety', name: 'Anxiety', icon: Activity, color: COLORS.warning, emoji: '😟' },
  { id: 'mentalClarity', name: 'Mental Clarity', icon: Brain, color: COLORS.success, emoji: '🧠' },
  { id: 'intimacy', name: 'Intimacy', icon: Heart, color: '#FF69B4', emoji: '❤️' },
  { id: 'health', name: 'Health', icon: Activity, color: COLORS.accent, emoji: '💪' },
];

interface HabitLibrarySectionProps {
  onHabitAdded?: () => void;
}

const HabitLibrarySection: React.FC<HabitLibrarySectionProps> = ({ onHabitAdded }) => {
  const router = useRouter();
  const { smartSuggestions, getPersonalizedHabits, getHabitsByCategory } = useHabitRecommendations();
  const { addHabit } = useHabits();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const [tooltipVisible, setTooltipVisible] = useState<{ [key: string]: boolean }>({});

  // Get all habits from the library, personalized based on user data
  const HABIT_LIBRARY = getPersonalizedHabits();

  // Filter habits based on search and category
  const filteredHabits = HABIT_LIBRARY.filter(habit => {
    const matchesSearch = habit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         habit.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || habit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get category icon component
  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    if (category) {
      const IconComponent = category.icon;
      return <IconComponent color={category.color} size={20} />;
    }
    return <Target color={COLORS.textSecondary} size={20} />;
  };

  // Get category color
  const getCategoryColor = (categoryId: string) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.color : COLORS.textSecondary;
  };

  // Handle adding a habit
  const handleAddHabit = (habit: any) => {
    setSelectedHabit(habit);
    setModalVisible(true);
  };

  // Handle custom habit creation
  const handleCreateCustomHabit = () => {
    console.log('Create custom habit button pressed');
    setSelectedHabit(null);
    setModalVisible(true);
  };

  // Toggle tooltip visibility
  const toggleTooltip = (key: string) => {
    setTooltipVisible(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle habit confirmation - this is where we integrate with the useHabits hook
  const handleHabitConfirm = (habitData: any) => {
    // Add the habit using the useHabits hook
    addHabit({
      title: habitData.title || selectedHabit?.title || 'Custom Habit',
      description: habitData.description || selectedHabit?.description || 'User created habit',
      category: habitData.category || selectedHabit?.category || 'sleep',
      duration: habitData.duration || 7,
      reminderEnabled: habitData.reminderEnabled || false,
      reminderTime: habitData.reminderTime,
      startDate: new Date().toISOString().split('T')[0],
      isActive: true,
    });
    
    // Close the modal and notify parent
    setModalVisible(false);
    onHabitAdded?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Habit Library</Text>
        <Text style={styles.subtitle}>Build better habits, one step at a time</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search color={COLORS.textSecondary} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search habits..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Smart Suggestions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Flame color={COLORS.warning} size={20} />
          <Text style={styles.sectionTitle}>Suggested for You</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Based on your recent data and patterns
        </Text>
        
        <View style={styles.suggestionsList}>
          {smartSuggestions.map((suggestion) => (
            <View key={suggestion.id} style={styles.suggestionCard}>
              <View style={styles.suggestionHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(suggestion.category) + '20' }]}>
                  {getCategoryIcon(suggestion.category)}
                  <Text style={[styles.categoryText, { color: getCategoryColor(suggestion.category) }]}>
                    {CATEGORIES.find(cat => cat.id === suggestion.category)?.name}
                  </Text>
                </View>
              </View>
              <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
              <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
              <Text style={styles.suggestionReason}>✨ {suggestion.reason}</Text>
              
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleAddHabit(suggestion)}
              >
                <Plus color="white" size={16} />
                <Text style={styles.addButtonText}>Add to My Habits</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
      >
        <TouchableOpacity 
          style={[
            styles.categoryButton,
            !selectedCategory && styles.selectedCategoryButton
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[
            styles.categoryButtonText,
            !selectedCategory && styles.selectedCategoryButtonText
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        {CATEGORIES.map((category) => {
          const IconComponent = category.icon;
          return (
            <TouchableOpacity 
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <IconComponent 
                color={selectedCategory === category.id ? 'white' : category.color} 
                size={16} 
              />
              <Text style={[
                styles.categoryButtonText,
                { color: selectedCategory === category.id ? 'white' : category.color },
                selectedCategory === category.id && styles.selectedCategoryButtonText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Habit List */}
      <ScrollView style={styles.habitsList}>
        {filteredHabits.map((habit) => (
          <View key={habit.id} style={styles.habitCard}>
            <View style={styles.habitHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(habit.category) + '20' }]}>
                {getCategoryIcon(habit.category)}
                <Text style={[styles.categoryText, { color: getCategoryColor(habit.category) }]}>
                  {CATEGORIES.find(cat => cat.id === habit.category)?.name}
                </Text>
              </View>
            </View>
            
            <Text style={styles.habitTitle}>{habit.title}</Text>
            <Text style={styles.habitDescription}>{habit.description}</Text>
            <Text style={styles.habitBenefits}>💡 {habit.benefits}</Text>
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => handleAddHabit(habit)}
            >
              <Plus color="white" size={16} />
              <Text style={styles.addButtonText}>Add to My Habits</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Create Custom Habit Button */}
      <TouchableOpacity 
        style={styles.createCustomButton}
        onPress={handleCreateCustomHabit}
      >
        <Plus color="white" size={20} />
        <View style={styles.createCustomContent}>
          <Text style={styles.createCustomButtonText}>Create Your Own Habit</Text>
          <View style={styles.descriptionContainer}>
            <Text style={styles.cardDescription}>
              Design a personal habit tailored to your lifestyle.
            </Text>
            <TouchableOpacity 
              style={styles.infoIcon}
              onPress={() => toggleTooltip('create')}
            >
              <Text style={styles.infoIconText}>ℹ️</Text>
            </TouchableOpacity>
            {tooltipVisible.create && (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>Customize your own habits and track progress with reminders.</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Add Habit Modal */}
      <AddHabitModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleHabitConfirm}
        habit={selectedHabit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInput: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  section: {
    margin: SPACING.lg,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  suggestionsList: {
    gap: SPACING.md,
  },
  suggestionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  suggestionTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  suggestionDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  suggestionReason: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  categoryFilter: {
    marginVertical: SPACING.md,
  },
  categoryFilterContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.backgroundSecondary,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
  habitsList: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  habitCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  habitTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  habitDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  habitBenefits: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  addButtonText: {
    ...TYPOGRAPHY.body,
    color: 'white',
    fontWeight: '600',
  },
  createCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    margin: SPACING.lg,
    gap: SPACING.md,
  },
  createCustomContent: {
    flex: 1,
  },
  createCustomButtonText: {
    ...TYPOGRAPHY.body,
    color: 'white',
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: 'bold',
    flex: 1,
    flexWrap: 'wrap',
  },
  infoIcon: {
    marginLeft: SPACING.xs,
    padding: SPACING.xs,
  },
  infoIconText: {
    fontSize: 12,
    color: 'white',
  },
  tooltip: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    zIndex: 100,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: 200,
  },
  tooltipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
  },
});

export default HabitLibrarySection;