import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { savePost, deletePost } from './posts';
import { posts, savePosts, resetPosts } from '../lib/data';
import type { Post } from "../types";

// Mock the data module
vi.mock('../lib/data', () => {
  // Create a copy of initial posts for testing
  const testPosts: Post[] = [
    {
      id: 1,
      title: "Test Post 1",
      content: "Test content 1",
      date: "2025-04-13",
      tags: ["test"],
    },
    {
      id: 2,
      title: "Test Post 2",
      content: "Test content 2",
      date: "2025-04-14",
      tags: ["test", "another"],
    }
  ];
  
  return {
    posts: testPosts,
    savePosts: vi.fn((updatedPosts) => {
      // Mock implementation for testing
    }),
    resetPosts: vi.fn(() => {
      // Mock implementation for testing
    })
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

// Mock Date for consistent testing
const fixedDate = new Date('2025-05-15');
const dateSpy = vi.spyOn(global, 'Date').mockImplementation(() => fixedDate);

describe('Post Actions', () => {
  beforeEach(() => {
    // Reset the posts before each test
    posts.length = 0;
    posts.push(
      {
        id: 1,
        title: "Test Post 1",
        content: "Test content 1",
        date: "2025-04-13",
        tags: ["test"],
      },
      {
        id: 2,
        title: "Test Post 2",
        content: "Test content 2",
        date: "2025-04-14",
        tags: ["test", "another"],
      }
    );
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Define window.localStorage if needed
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });
  
  afterEach(() => {
    // Restore Date
    dateSpy.mockRestore();
  });
  
  describe('savePost', () => {
    test('should create a new post with correct data', async () => {
      // Create form data for a new post
      const formData = new FormData();
      formData.append('title', 'New Test Post');
      formData.append('content', 'This is new content');
      formData.append('tags', 'new, test, post');
      
      // Call savePost function
      const result = await savePost(formData);
      
      // Check the result
      expect(result).toEqual({ success: true, id: 3 });
      
      // Verify post was added to the array
      expect(posts.length).toBe(3);
      expect(posts[2]).toEqual({
        id: 3,
        title: 'New Test Post',
        content: 'This is new content',
        date: '2025-05-15',
        tags: ['new', 'test', 'post'],
      });
      
      // Verify savePosts was called
      expect(savePosts).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: 3, title: 'New Test Post' })
      ]));
    });
    
    test('should handle empty tags correctly', async () => {
      const formData = new FormData();
      formData.append('title', 'Post Without Tags');
      formData.append('content', 'Content without tags');
      formData.append('tags', ''); // Empty tags
      
      const result = await savePost(formData);
      
      expect(result.success).toBe(true);
      expect(posts[2].tags).toEqual([]);
    });
    
    test('should update an existing post correctly', async () => {
      // Create form data for updating an existing post
      const formData = new FormData();
      formData.append('id', '1');
      formData.append('title', 'Updated Test Post');
      formData.append('content', 'This content has been updated');
      formData.append('tags', 'updated, test');
      
      // Call savePost function
      const result = await savePost(formData);
      
      // Check the result
      expect(result).toEqual({ success: true, id: 1 });
      
      // Verify post was updated in the array
      expect(posts.length).toBe(2); // Length unchanged
      expect(posts[0]).toEqual({
        id: 1,
        title: 'Updated Test Post',
        content: 'This content has been updated',
        date: '2025-04-13', // Date should remain unchanged for updates
        tags: ['updated', 'test'],
      });
      
      // Verify savePosts was called
      expect(savePosts).toHaveBeenCalled();
    });
    
    test('should return error when updating non-existent post', async () => {
      // Create form data with non-existent ID
      const formData = new FormData();
      formData.append('id', '999');
      formData.append('title', 'Non-existent Post');
      formData.append('content', 'This post does not exist');
      formData.append('tags', 'error, test');
      
      // Call savePost function
      const result = await savePost(formData);
      
      // Check the result
      expect(result).toEqual({ success: false, error: 'Post not found' });
      
      // Verify posts array remained unchanged
      expect(posts.length).toBe(2);
      
      // Verify savePosts was not called
      expect(savePosts).not.toHaveBeenCalled();
    });
    
    test('should handle tag processing correctly', async () => {
      // Create form data with messy tags
      const formData = new FormData();
      formData.append('title', 'Tag Test Post');
      formData.append('content', 'Testing tag processing');
      formData.append('tags', ' tag1,  tag2 , , tag3,  '); // Extra spaces, empty tags
      
      // Call savePost function
      await savePost(formData);
      
      // Verify tags were processed correctly
      expect(posts[2].tags).toEqual(['tag1', 'tag2', 'tag3']);
    });
  });
  
  describe('deletePost', () => {
    test('should delete an existing post successfully', async () => {
      // Delete the first post
      const result = await deletePost(1);
      
      // Check the result
      expect(result).toEqual({ success: true });
      
      // Verify post was removed
      expect(savePosts).toHaveBeenCalled();
      
      // Original posts array should still have both posts
      // because we're mocking savePosts and not actually updating the original array
      // In real code, posts would be updated from localStorage
    });
    
    test('should return error when deleting non-existent post', async () => {
      // Try to delete a post that doesn't exist
      const result = await deletePost(999);
      
      // Check the result
      expect(result).toEqual({ success: false, error: 'Post not found' });
      
      // Verify savePosts was not called
      expect(savePosts).not.toHaveBeenCalled();
    });
    
    test('should maintain other posts when deleting one post', async () => {
      // Add a third post
      const formData = new FormData();
      formData.append('title', 'Third Post');
      formData.append('content', 'Third post content');
      formData.append('tags', 'third');
      await savePost(formData);
      
      // Original length should be 3
      expect(posts.length).toBe(3);
      
      // Delete the second post
      await deletePost(2);
      
      // We're verifying the correct arguments to savePosts,
      // which should contain posts 1 and 3, but not 2
      expect(savePosts).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 3 })
        ])
      );
      
      // Also verify it does NOT contain id: 2
      const savePostsArgs = vi.mocked(savePosts).mock.calls[1][0];
      const containsId2 = savePostsArgs.some((post: Post) => post.id === 2);
      expect(containsId2).toBe(false);
    });
  });
});
