import { describe, it, expect } from 'vitest';
import { getStoryContentForPath, getPathDuration, getPathDescription } from './storyContent';

describe('storyContent', () => {
  describe('getStoryContentForPath', () => {
    it('returns location path content with emotional mood', () => {
      const content = getStoryContentForPath('kgm-001', 'location', 'emotional');
      
      expect(content.segments).toHaveLength(3);
      expect(content.duration).toBe('3 min');
      expect(content.segments[0].title).toBe('The Gisozi District');
      expect(content.segments[0].content).toContain('Take a moment to reflect');
    });

    it('returns testimony path content', () => {
      const content = getStoryContentForPath('kgm-001', 'testimony', 'emotional');
      
      expect(content.segments).toHaveLength(4);
      expect(content.duration).toBe('8 min');
      expect(content.segments[0].title).toBe("Marie's Story");
    });

    it('returns historical path content', () => {
      const content = getStoryContentForPath('kgm-001', 'historical', 'educational');
      
      expect(content.segments).toHaveLength(4);
      expect(content.duration).toBe('5 min');
      expect(content.segments[0].title).toBe('Colonial Legacy');
      expect(content.segments[0].content).toContain('Historical context:');
    });

    it('returns kids path content', () => {
      const content = getStoryContentForPath('kgm-001', 'kids', 'emotional');
      
      expect(content.segments).toHaveLength(4);
      expect(content.duration).toBe('4 min');
      expect(content.segments[0].title).toBe('A Special Garden');
    });

    it('returns summary path content', () => {
      const content = getStoryContentForPath('kgm-001', 'summary', 'fast');
      
      expect(content.segments).toHaveLength(1);
      expect(content.duration).toBe('1 min');
      expect(content.segments[0].title).toBe('Quick Overview');
    });

    it('applies fast mood modifier to truncate content', () => {
      const content = getStoryContentForPath('kgm-001', 'location', 'fast');
      const emotionalContent = getStoryContentForPath('kgm-001', 'location', 'emotional');
      
      // Fast mode should truncate to first 2 sentences
      expect(content.segments[0].content.length).toBeLessThan(emotionalContent.segments[0].content.length);
      // Content should be shorter (only first 2 sentences)
      const sentenceCount = content.segments[0].content.split('.').filter(s => s.trim()).length;
      expect(sentenceCount).toBeLessThanOrEqual(2);
    });

    it('applies educational mood modifier', () => {
      const content = getStoryContentForPath('kgm-001', 'testimony', 'educational');
      
      expect(content.segments[0].content).toContain('Historical context:');
    });
  });

  describe('getPathDuration', () => {
    it('returns correct duration for each path', () => {
      expect(getPathDuration('location')).toBe('3 min');
      expect(getPathDuration('testimony')).toBe('8 min');
      expect(getPathDuration('historical')).toBe('5 min');
      expect(getPathDuration('kids')).toBe('4 min');
      expect(getPathDuration('summary')).toBe('1 min');
    });
  });

  describe('getPathDescription', () => {
    it('returns correct description for each path', () => {
      expect(getPathDescription('location')).toContain('geography');
      expect(getPathDescription('testimony')).toContain('survivor');
      expect(getPathDescription('historical')).toContain('historical');
      expect(getPathDescription('kids')).toContain('age-appropriate');
      expect(getPathDescription('summary')).toContain('quick overview');
    });
  });
});
