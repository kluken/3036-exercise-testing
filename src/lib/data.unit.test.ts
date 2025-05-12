import { describe, it, expect } from 'vitest';
import { posts } from './data';
import type { Post } from '../types';

describe('posts data', () => {
  it('should export an array of posts', () => {
    expect(Array.isArray(posts)).toBe(true);
  });

  it('should contain at least one post', () => {
    expect(posts.length).toBeGreaterThan(0);
  });

  it('should have valid post structure for each item', () => {
    posts.forEach(post => {
      // Type validation
      expect(typeof post.id).toBe('number');
      expect(typeof post.title).toBe('string');
      expect(typeof post.content).toBe('string');
      expect(typeof post.date).toBe('string');
      expect(Array.isArray(post.tags)).toBe(true);
      
      // Additional validation
      expect(post.title.length).toBeGreaterThan(0);
      expect(/^\d{4}-\d{2}-\d{2}$/.test(post.date)).toBe(true);
    });
  });

  it('should have unique IDs for each post', () => {
    const ids = posts.map(post => post.id);
    const uniqueIds = [...new Set(ids)];
    expect(uniqueIds.length).toBe(ids.length);
  });
});