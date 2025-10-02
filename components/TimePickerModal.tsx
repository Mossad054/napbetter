import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (time: string) => void;
  selectedTime?: string;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  selectedTime,
}) => {
  const [selectedHour, setSelectedHour] = useState<number>(
    selectedTime ? parseInt(selectedTime.split(':')[0]) : 22
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(
    selectedTime ? parseInt(selectedTime.split(':')[1]) : 0
  );
  const [period, setPeriod] = useState<'AM' | 'PM'>(
    selectedTime && parseInt(selectedTime.split(':')[0]) >= 12 ? 'PM' : 'AM'
  );

  // Generate hours (1-12 for 12-hour format)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minutes (0, 15, 30, 45 for simplicity)
  const minutes = [0, 15, 30, 45];

  const handleConfirm = () => {
    // Convert to 24-hour format for storage
    let hour24 = selectedHour;
    if (period === 'AM' && selectedHour === 12) {
      hour24 = 0;
    } else if (period === 'PM' && selectedHour !== 12) {
      hour24 = selectedHour + 12;
    }
    
    const formattedTime = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onConfirm(formattedTime);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.pickerContainer}>
            {/* Hours */}
            <ScrollView style={styles.pickerColumn}>
              {hours.map((hour) => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.pickerItem,
                    selectedHour === hour && styles.selectedPickerItem,
                  ]}
                  onPress={() => setSelectedHour(hour)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedHour === hour && styles.selectedPickerItemText,
                    ]}
                  >
                    {hour}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Minutes */}
            <ScrollView style={styles.pickerColumn}>
              {minutes.map((minute) => (
                <TouchableOpacity
                  key={minute}
                  style={[
                    styles.pickerItem,
                    selectedMinute === minute && styles.selectedPickerItem,
                  ]}
                  onPress={() => setSelectedMinute(minute)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedMinute === minute && styles.selectedPickerItemText,
                    ]}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* AM/PM */}
            <ScrollView style={styles.pickerColumn}>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  period === 'AM' && styles.selectedPickerItem,
                ]}
                onPress={() => setPeriod('AM')}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    period === 'AM' && styles.selectedPickerItemText,
                  ]}
                >
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  period === 'PM' && styles.selectedPickerItem,
                ]}
                onPress={() => setPeriod('PM')}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    period === 'PM' && styles.selectedPickerItemText,
                  ]}
                >
                  PM
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: 300,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 200,
    marginBottom: SPACING.lg,
  },
  pickerColumn: {
    width: 80,
  },
  pickerItem: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  selectedPickerItem: {
    backgroundColor: COLORS.primary,
  },
  pickerItemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontSize: 20,
  },
  selectedPickerItemText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    marginLeft: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    ...TYPOGRAPHY.body,
    color: 'white',
    fontWeight: '600',
  },
});

export default TimePickerModal;