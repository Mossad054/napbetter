import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { Plus, Clock, X } from 'lucide-react-native';

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (habit: any) => void;
  habit?: any; // Optional habit data to pre-fill
}

export default function AddHabitModal({ visible, onClose, onAdd, habit }: AddHabitModalProps) {
  const [duration, setDuration] = useState<number>(7);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [tempHour, setTempHour] = useState(21);
  const [tempMinute, setTempMinute] = useState(0);
  const [customTitle, setCustomTitle] = useState(habit?.title || '');
  const [customDescription, setCustomDescription] = useState(habit?.description || '');
  const [category, setCategory] = useState(habit?.category || 'sleep');

  // Reset form when habit changes
  useEffect(() => {
    setDuration(habit?.duration || 7);
    setReminderEnabled(habit?.reminderEnabled !== undefined ? habit.reminderEnabled : true);
    setTempHour(habit?.reminderTime ? parseInt(habit.reminderTime.split(':')[0]) : 21);
    setTempMinute(habit?.reminderTime ? parseInt(habit.reminderTime.split(':')[1]) : 0);
    setCustomTitle(habit?.title || '');
    setCustomDescription(habit?.description || '');
    setCategory(habit?.category || 'sleep');
  }, [habit]);

  const handleConfirm = () => {
    const newHabit = {
      id: habit?.id || `custom-${Date.now()}`,
      title: customTitle || habit?.title || 'Custom Habit',
      description: customDescription || habit?.description || 'User created habit',
      category: category || habit?.category || 'sleep',
      duration: duration || 7,
      reminderEnabled: reminderEnabled,
      reminderTime: reminderEnabled ? `${tempHour}:${tempMinute < 10 ? '0' + tempMinute : tempMinute}` : undefined,
      streak: 0,
      isCompletedToday: false,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      totalCompleted: 0,
      lastFeedback: undefined,
    };
    
    onAdd(newHabit);
    // Close the modal
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setDuration(habit?.duration || 7);
    setReminderEnabled(habit?.reminderEnabled !== undefined ? habit.reminderEnabled : true);
    setTempHour(habit?.reminderTime ? parseInt(habit.reminderTime.split(':')[0]) : 21);
    setTempMinute(habit?.reminderTime ? parseInt(habit.reminderTime.split(':')[1]) : 0);
    setCustomTitle(habit?.title || '');
    setCustomDescription(habit?.description || '');
    setCategory(habit?.category || 'sleep');
    onClose();
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {habit ? 'Add Habit to Track' : 'Create Custom Habit'}
            </Text>
            <TouchableOpacity onPress={handleCancel}>
              <X color={COLORS.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          {habit ? (
            <View style={styles.habitPreview}>
              <Text style={styles.habitTitle}>{habit.title}</Text>
              <Text style={styles.habitDescription}>{habit.description}</Text>
              <Text style={styles.habitCategory}>Category: {habit.category}</Text>
            </View>
          ) : (
            <View style={styles.customForm}>
              <Text style={styles.formLabel}>Habit Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter habit name"
                value={customTitle}
                onChangeText={setCustomTitle}
              />
              
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Enter description"
                value={customDescription}
                onChangeText={setCustomDescription}
                multiline
              />
              
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  style={styles.picker}
                  onValueChange={(value: string) => setCategory(value)}
                >
                  <Picker.Item label="Sleep" value="sleep" />
                  <Picker.Item label="Mood" value="mood" />
                  <Picker.Item label="Anxiety" value="anxiety" />
                  <Picker.Item label="Mental Clarity" value="mentalClarity" />
                  <Picker.Item label="Intimacy" value="intimacy" />
                  <Picker.Item label="Health" value="health" />
                </Picker>
              </View>
            </View>
          )}

          <Text style={styles.formLabel}>Duration</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={duration}
              style={styles.picker}
              onValueChange={(value: number) => setDuration(value)}
            >
              <Picker.Item label="3 days" value={3} />
              <Picker.Item label="7 days" value={7} />
              <Picker.Item label="14 days" value={14} />
              <Picker.Item label="21 days" value={21} />
              <Picker.Item label="30 days" value={30} />
            </Picker>
          </View>

          <View style={styles.reminderSection}>
            <Text style={styles.formLabel}>Reminder</Text>
            <TouchableOpacity 
              style={[styles.toggleButton, reminderEnabled && styles.toggleButtonActive]}
              onPress={() => setReminderEnabled(!reminderEnabled)}
            >
              <Text style={[styles.toggleText, reminderEnabled && styles.toggleTextActive]}>
                {reminderEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>
          </View>

          {reminderEnabled && (
            <View style={styles.timePickerSection}>
              <Text style={styles.formLabel}>Reminder Time</Text>
              <View style={styles.timePickerContainer}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={tempHour}
                    style={styles.smallPicker}
                    onValueChange={(value: number) => setTempHour(value)}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <Picker.Item key={i} label={`${i}`} value={i} />
                    ))}
                  </Picker>
                </View>
                
                <Text style={styles.timeSeparator}>:</Text>
                
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={tempMinute}
                    style={styles.smallPicker}
                    onValueChange={(value: number) => setTempMinute(value)}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <Picker.Item key={i} label={`${i < 10 ? '0' + i : i}`} value={i} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Plus color="white" size={16} />
              <Text style={styles.confirmButtonText}>Add Habit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.overlay,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
  },
  habitPreview: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.xs,
  },
  habitCategory: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  customForm: {
    marginBottom: SPACING.lg,
  },
  formLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  textInput: {
    ...TYPOGRAPHY.body,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  smallPicker: {
    height: 50,
    width: 80,
  },
  reminderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  toggleButton: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: 'white',
  },
  timePickerSection: {
    marginBottom: SPACING.lg,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SPACING.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    ...TYPOGRAPHY.body,
    color: 'white',
    fontWeight: '600',
  },
});