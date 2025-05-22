import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resetPosts, savePosts, posts } from './data';
import type { Post } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string): string | null => {
      return store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string): void => {
      store[key] = value;
    }),
    clear: vi.fn((): void => {
      store = {};
    }),
    removeItem: vi.fn((key: string): void => {
      delete store[key];
    }),
  };
})();

describe('Data Module', () => {
  // Setup and teardown
  beforeEach(() => {
    // Setup mock localStorage
    Object.defineProperty(global, 'localStorage', { value: localStorageMock });
    Object.defineProperty(global, 'window', { value: {} });
    
    // Clear localStorage mock before each test
    localStorageMock.clear();
    
    // Clear module cache to ensure getPosts runs again on import
    vi.resetModules();
  });
  
  afterEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
  });
  
  describe('posts', () => {
    it('should contain initial seed data', () => {
      expect(posts).toHaveLength(10);
      expect(posts[0].title).toBe('Welcome');
      expect(posts[9].title).toBe('Introduction to GraphQL');
    });
  });
  
  describe('savePosts', () => {
    it('should save posts to localStorage', () => {
      const updatedPosts: Post[] = [
        {
          id: 1,
          title: 'Updated Title',
          content: 'Updated content',
          date: '2025-05-20',
          tags: ['test'],
        },
      ];
      
      savePosts(updatedPosts);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'blog-posts',
        JSON.stringify(updatedPosts)
      );
    });
    
    it('should not save posts when window is undefined', () => {
      // Set window to undefined
      Object.defineProperty(global, 'window', { value: undefined });
      
      const updatedPosts: Post[] = [
        {
          id: 1,
          title: 'Updated Title',
          content: 'Updated content',
          date: '2025-05-20',
          tags: ['test'],
        },
      ];
      
      savePosts(updatedPosts);
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });
  
  describe('resetPosts', () => {
    it('should reset posts to initial state', () => {
      resetPosts();
      
      // Verify localStorage.setItem was called with initial posts
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'blog-posts',
        expect.any(String)
      );
      
      // Check that the saved string contains expected initial post titles
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(10);
      expect(savedData[0].title).toBe('Welcome');
      expect(savedData[9].title).toBe('Introduction to GraphQL');
    });
    
    it('should not reset posts when window is undefined', () => {
      // Set window to undefined
      Object.defineProperty(global, 'window', { value: undefined });
      
      resetPosts();
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });
  
  // Test the behavior of getPosts function indirectly
  describe('getPosts behavior', () => {
    it('should retrieve posts from localStorage if available', async () => {
      const customPosts: Post[] = [
        {
          id: 99,
          title: 'Custom Post',
          content: 'Custom content',
          date: '2025-05-22',
          tags: ['custom'],
        },
      ];
      
      // Set up localStorage to return custom posts
      localStorageMock.getItem.mockReturnValue(JSON.stringify(customPosts));
      
      // Re-import the module to trigger getPosts
      await import('./data');
      
      // Verify localStorage.getItem was called
      expect(localStorageMock.getItem).toHaveBeenCalledWith('blog-posts');
    });
    
    it('should initialize localStorage with seed data if no stored posts', async () => {
      // Ensure getItem returns null to simulate first visit
      localStorageMock.getItem.mockReturnValue(null);
      
      // Re-import the module to trigger getPosts
      await import('./data');
      
      // Verify localStorage was initialized with seed data
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'blog-posts',
        expect.any(String)
      );
    });
    
    it('should handle invalid JSON in localStorage and reset to seed data', async () => {
      // Mock localStorage to return invalid JSON
      localStorageMock.getItem.mockReturnValue('invalid-json-data');
      
      // Mock console.error to verify error handling
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Re-import the module to trigger getPosts
      await import('./data');
      
      // Verify console.error was called with error message
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error parsing posts from localStorage:',
        expect.any(Error)
      );
      
      // Verify localStorage was reset with initial seed data
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'blog-posts',
        expect.stringContaining('Welcome')
      );
      
      // Clean up
      consoleErrorSpy.mockRestore();
    });

    it('should explicitly set localStorage when initializing for the first time', async () => {
      // Ensure getItem returns null to simulate first visit
      localStorageMock.getItem.mockReturnValue(null);
      
      // Re-import the module to trigger getPosts
      const module = await import('./data');
      
      // Verify the returned posts match initial seed data
      expect(module.posts).toHaveLength(10);
      expect(module.posts[0].title).toBe('Welcome');
      
      // Verify localStorage was explicitly set with the initial data
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'blog-posts',
        expect.stringContaining('Welcome')
      );
      
      // Parse the saved data to verify it matches initial seed data
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(10);
      expect(savedData[0].title).toBe('Welcome');
    });

    it('should return initialPosts when window is undefined (SSR environment)', async () => {
    // Set window to undefined to simulate server-side rendering environment
    Object.defineProperty(global, 'window', { value: undefined });
    
    // Clear module cache to ensure getPosts runs again with our modified environment
    vi.resetModules();
    
    // Re-import the module to trigger getPosts in the SSR environment
    const { posts } = await import('./data');
    
    // Verify the posts array matches initialPosts without accessing localStorage
    expect(posts).toHaveLength(10);
    expect(posts[0].title).toBe('Welcome');
    expect(posts[9].title).toBe('Introduction to GraphQL');
    
    // Verify localStorage was never accessed
    expect(localStorageMock.getItem).not.toHaveBeenCalled();
  });
  });
});