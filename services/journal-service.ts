import { supabaseService } from '@/database/supabase-service';
import { JournalEntry } from '@/types/mood';

interface Trigger {
  id: string;
  name: string;
  keywords: string[];
}

interface AIAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  patterns: string[];
  intensity: number; // 1-10 scale
  suggestions: string[];
}

// New interface for storing AI analysis results
interface AIAnalysisEntry {
  id?: number;
  journal_entry_id: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  patterns: string[];
  intensity: number; // 1-10 scale
  suggestions: string[];
  created_at?: string;
}

export class JournalService {
  // Common triggers to detect
  private static triggers: Trigger[] = [
    {
      id: 'work',
      name: 'Work',
      keywords: ['work', 'job', 'boss', 'colleague', 'deadline', 'meeting', 'project', 'office']
    },
    {
      id: 'social',
      name: 'Social',
      keywords: ['friend', 'family', 'relationship', 'social', 'party', 'date', 'conversation', 'interaction']
    },
    {
      id: 'caffeine',
      name: 'Caffeine',
      keywords: ['coffee', 'tea', 'caffeine', 'espresso', 'energy drink']
    },
    {
      id: 'sleep',
      name: 'Sleep Issues',
      keywords: ['sleep', 'insomnia', 'tired', 'fatigue', 'restless', 'awake']
    },
    {
      id: 'health',
      name: 'Health',
      keywords: ['health', 'pain', 'sick', 'illness', 'doctor', 'medication']
    },
    {
      id: 'conflict',
      name: 'Conflict',
      keywords: ['conflict', 'argue', 'fight', 'disagreement', 'tension']
    },
    {
      id: 'relationship',
      name: 'Relationship',
      keywords: ['relationship', 'partner', 'spouse', 'love', 'romance', 'intimate']
    },
    {
      id: 'money',
      name: 'Money',
      keywords: ['money', 'financial', 'debt', 'budget', 'expense', 'income']
    }
  ];

  static async saveJournalEntry(entry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>): Promise<number> {
    try {
      // Detect triggers in the journal responses
      const detectedTriggers = this.detectTriggers(entry.responses);
      
      // Save to database
      const savedEntryId = await supabaseService.insertJournalEntry({
        template_id: entry.template_id,
        responses: entry.responses,
        triggers: detectedTriggers
      });
      
      return savedEntryId;
    } catch (error) {
      console.error('Error saving journal entry:', error);
      throw error;
    }
  }

  // New method to save AI analysis results
  static async saveAIAnalysis(analysis: Omit<AIAnalysisEntry, 'id' | 'created_at'>): Promise<number> {
    try {
      const savedAnalysisId = await supabaseService.insertAIAnalysis(analysis);
      return savedAnalysisId;
    } catch (error) {
      console.error('Error saving AI analysis:', error);
      throw error;
    }
  }

  // New method to get AI analysis for a journal entry
  static async getAIAnalysisForEntry(journalEntryId: number): Promise<AIAnalysisEntry | null> {
    try {
      return await supabaseService.getAIAnalysisForEntry(journalEntryId);
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      throw error;
    }
  }

  static detectTriggers(responses: string[]): string[] {
    const detectedTriggers: string[] = [];
    const combinedText = responses.join(' ').toLowerCase();
    
    // Check each trigger for keywords in the journal responses
    for (const trigger of this.triggers) {
      const hasTrigger = trigger.keywords.some(keyword => 
        combinedText.includes(keyword.toLowerCase())
      );
      
      if (hasTrigger) {
        detectedTriggers.push(trigger.name);
      }
    }
    
    return detectedTriggers;
  }

  // Simulate AI analysis of journal entries
  static analyzeWithAI(text: string): AIAnalysisResult {
    // This is a simplified simulation - in a real app, this would call an AI service
    const lowerText = text.toLowerCase();
    
    // Determine sentiment based on keywords
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    const positiveWords = ['happy', 'good', 'great', 'excited', 'love', 'wonderful', 'amazing', 'joy', 'pleased'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'worried', 'stressed', 'anxious', 'terrible', 'hate', 'awful'];
    
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
    }
    
    // Detect patterns (simplified)
    const patterns: string[] = [];
    if (lowerText.includes('meeting') && (lowerText.includes('anxious') || lowerText.includes('nervous'))) {
      patterns.push('You often feel anxious after meetings.');
    }
    if (lowerText.includes('work') && (lowerText.includes('stress') || lowerText.includes('overwhelm'))) {
      patterns.push('Work seems to be a major source of stress for you.');
    }
    if (lowerText.includes('wednesday') || lowerText.includes('mid-week')) {
      patterns.push('Your stress seems highest mid-week.');
    }
    if (lowerText.includes('sleep') && (lowerText.includes('poor') || lowerText.includes('bad'))) {
      patterns.push('Sleep quality appears to impact your mood.');
    }
    
    // Determine intensity based on exclamation marks and emotional words
    const exclamationCount = (text.match(/!/g) || []).length;
    const emotionalWords = [...positiveWords, ...negativeWords];
    const emotionalWordCount = emotionalWords.filter(word => lowerText.includes(word)).length;
    const intensity = Math.min(10, Math.max(1, 3 + exclamationCount + Math.floor(emotionalWordCount / 2)));
    
    // Generate suggestions based on content
    const suggestions: string[] = [];
    if (sentiment === 'negative') {
      suggestions.push('Try this CBT exercise to reframe negative thoughts.');
    }
    if (patterns.some(p => p.includes('mid-week'))) {
      suggestions.push('Consider a short meditation break on Wednesdays.');
    }
    if (lowerText.includes('sleep') || lowerText.includes('tired')) {
      suggestions.push('Try a bedtime breathing exercise to improve sleep quality.');
    }
    if (lowerText.includes('work') && (lowerText.includes('stress') || lowerText.includes('overwhelm'))) {
      suggestions.push('Consider setting boundaries between work and personal time.');
    }
    if (suggestions.length === 0) {
      suggestions.push('Keep journaling regularly to track your emotional patterns.');
    }
    
    return {
      sentiment,
      patterns,
      intensity,
      suggestions
    };
  }

  static async getJournalEntries(): Promise<JournalEntry[]> {
    try {
      return await supabaseService.getJournalEntries();
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      throw error;
    }
  }

  static async getJournalEntryById(id: number): Promise<JournalEntry | null> {
    try {
      return await supabaseService.getJournalEntryById(id);
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      throw error;
    }
  }
}

export default JournalService;