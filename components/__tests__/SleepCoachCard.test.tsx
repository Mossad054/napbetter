import React from 'react';
import { averageSleepLastNDays } from '../SleepCoachCard';

describe('SleepCoachCard', () => {
  describe('averageSleepLastNDays', () => {
    it('should calculate average sleep correctly for normal sleep patterns', () => {
      // Use recent dates to ensure they fall within the last 7 days
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(now);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const sleepLogs = [
        { 
          startISO: new Date(threeDaysAgo.getTime() - 8 * 60 * 60 * 1000).toISOString(), 
          endISO: threeDaysAgo.toISOString() 
        }, // 8 hours
        { 
          startISO: new Date(twoDaysAgo.getTime() - 8 * 60 * 60 * 1000).toISOString(), 
          endISO: twoDaysAgo.toISOString() 
        }, // 8 hours
        { 
          startISO: new Date(yesterday.getTime() - 8 * 60 * 60 * 1000).toISOString(), 
          endISO: yesterday.toISOString() 
        }, // 8 hours
      ];
      
      const average = averageSleepLastNDays(sleepLogs, 7);
      expect(average).toBeCloseTo(8);
    });

    it('should calculate average sleep correctly for sleep crossing midnight', () => {
      // Use recent dates to ensure they fall within the last 7 days
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(now);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const sleepLogs = [
        { 
          startISO: new Date(yesterday.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour before midnight
          endISO: yesterday.toISOString() 
        }, // 1 hour (crossing midnight)
        { 
          startISO: new Date(twoDaysAgo.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour before midnight
          endISO: twoDaysAgo.toISOString() 
        }, // 1 hour (crossing midnight)
      ];
      
      const average = averageSleepLastNDays(sleepLogs, 7);
      expect(average).toBeCloseTo(1);
    });

    it('should return null for empty sleep logs', () => {
      const sleepLogs: Array<{startISO: string, endISO: string}> = [];
      const average = averageSleepLastNDays(sleepLogs, 7);
      expect(average).toBeNull();
    });

    it('should filter logs within the last N days', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const tenDaysAgo = new Date(now);
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      
      const sleepLogs = [
        { startISO: tenDaysAgo.toISOString(), endISO: new Date(tenDaysAgo.getTime() + 8 * 60 * 60 * 1000).toISOString() }, // 8 hours, 10 days ago
        { startISO: threeDaysAgo.toISOString(), endISO: new Date(threeDaysAgo.getTime() + 7 * 60 * 60 * 1000).toISOString() }, // 7 hours, 3 days ago
      ];
      
      const average = averageSleepLastNDays(sleepLogs, 7);
      expect(average).toBeCloseTo(7); // Only the log from 3 days ago should be included
    });
  });
});