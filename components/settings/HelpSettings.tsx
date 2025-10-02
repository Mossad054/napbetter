import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, Alert, Platform } from 'react-native';
import { Mail, FileText, MessageCircle, Globe, Heart, Bug, Star, Share2, Info } from 'lucide-react-native';
import { getColors } from '@/constants/theme';
import { SPACING } from '@/constants/theme';

interface HelpSettingsProps {
  isDarkMode: boolean;
  onHelpPress?: () => void;
}

const HelpSettings = ({ isDarkMode, onHelpPress }: HelpSettingsProps) => {
  const COLORS = getColors(isDarkMode);
  const [isRequestingReview, setIsRequestingReview] = useState(false);

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@napbetter.app?subject=Support Request');
  };

  const handleDocumentation = () => {
    Linking.openURL('https://napbetter.app/docs');
  };

  const handleCommunity = () => {
    Linking.openURL('https://napbetter.app/community');
  };

  const handleFAQ = () => {
    if (onHelpPress) {
      onHelpPress();
    }
  };

  const handleBugReport = () => {
    Linking.openURL('mailto:support@napbetter.app?subject=Bug Report&body=Please describe the bug you encountered:%0A%0ASteps to reproduce:%0A1.%0A2.%0A3.%0A%0AExpected behavior:%0A%0AActual behavior:%0A%0ADevice information:%0A- Platform: ' + Platform.OS + '%0A- Version: ' + Platform.Version);
  };

  const handleFeatureRequest = () => {
    Linking.openURL('mailto:support@napbetter.app?subject=Feature Request&body=Please describe the feature you would like to see in NapBetter:');
  };

  const handleRateApp = () => {
    // Open the app store directly since we can't use expo-store-review
    const storeUrl = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/app/napbetter' 
      : 'https://play.google.com/store/apps/details?id=com.napbetter';
    Linking.openURL(storeUrl);
  };

  const handleShareApp = async () => {
    try {
      const message = 'Check out NapBetter - a privacy-focused app for tracking mood, sleep, and intimacy. Download it today!';
      const url = Platform.OS === 'ios' 
        ? 'https://apps.apple.com/app/napbetter' 
        : 'https://play.google.com/store/apps/details?id=com.napbetter';
      
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(url);
        Alert.alert('Copied to Clipboard', 'The app link has been copied to your clipboard.');
      } else {
        // For mobile, we could use Share API, but for now we'll just open the store
        Linking.openURL(url);
      }
    } catch (error) {
      console.log('Error sharing app:', error);
      Alert.alert('Error', 'Unable to share the app at this time.');
    }
  };

  const handleAbout = () => {
    Alert.alert(
      'About NapBetter',
      'NapBetter v1.0.0\n\nA privacy-focused wellness tracking app designed to help you understand patterns in your mood, sleep, and intimacy.\n\n© 2025 NapBetter. All rights reserved.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Get Help</Text>
      
      <TouchableOpacity style={styles.option} onPress={handleFAQ}>
        <View style={styles.optionContent}>
          <MessageCircle size={20} color={COLORS.primary} />
          <Text style={[styles.optionText, { color: COLORS.text }]}>FAQ & Help Center</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleEmailSupport}>
        <View style={styles.optionContent}>
          <Mail size={20} color={COLORS.primary} />
          <Text style={[styles.optionText, { color: COLORS.text }]}>Email Support</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleDocumentation}>
        <View style={styles.optionContent}>
          <FileText size={20} color={COLORS.primary} />
          <Text style={[styles.optionText, { color: COLORS.text }]}>Documentation</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleCommunity}>
        <View style={styles.optionContent}>
          <Globe size={20} color={COLORS.primary} />
          <Text style={[styles.optionText, { color: COLORS.text }]}>Community Forum</Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: COLORS.text, marginTop: SPACING.lg }]}>Feedback & Support</Text>
      
      <TouchableOpacity style={styles.option} onPress={handleBugReport}>
        <View style={styles.optionContent}>
          <Bug size={20} color={COLORS.error} />
          <Text style={[styles.optionText, { color: COLORS.text }]}>Report a Bug</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleFeatureRequest}>
        <View style={styles.optionContent}>
          <Heart size={20} color={COLORS.accent} />
          <Text style={[styles.optionText, { color: COLORS.text }]}>Request a Feature</Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: COLORS.text, marginTop: SPACING.lg }]}>Spread the Word</Text>
      
      <TouchableOpacity style={styles.option} onPress={handleRateApp}>
        <View style={styles.optionContent}>
          <Star size={20} color={COLORS.warning} />
          <Text style={[styles.optionText, { color: COLORS.text }]}>Rate the App</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleShareApp}>
        <View style={styles.optionContent}>
          <Share2 size={20} color={COLORS.success} />
          <Text style={[styles.optionText, { color: COLORS.text }]}>Share NapBetter</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleAbout}>
        <View style={styles.optionContent}>
          <Info size={20} color={COLORS.textSecondary} />
          <Text style={[styles.optionText, { color: COLORS.text }]}>About</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  option: {
    paddingVertical: SPACING.sm,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    flex: 1,
  },
});

export default HelpSettings;