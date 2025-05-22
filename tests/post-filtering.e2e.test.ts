import { test, expect } from '@playwright/test';
import { posts } from '../src/lib/data';

/**
 * End-to-End (E2E) Tests for Blog Post Filtering Functionality
 * 
 * These tests verify that the post filtering UI works correctly from a user perspective.
 * E2E tests run in an actual browser and simulate real user interactions.
 */
test.describe('Post filtering E2E tests', () => {
  // Setup: Before each test, navigate to the home page
  // This ensures each test starts from the same clean state
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('http://localhost:3000');
    
    // Verify posts are loaded before starting tests
    await page.waitForSelector('article');
  });

  /**
   * Test Case 1: Filtering posts by tag
   * 
   * This test verifies that when a user selects a tag from the dropdown,
   * only posts with that tag are displayed.
   */
  test('should filter posts by tag', async ({ page }) => {
    // Get a tag from the first post to use for filtering
    const targetTag = posts[0].tags[0]; 
    
    // Locate the tag select dropdown by its accessible label and select the option
    const tagSelect = page.getByLabel('By Tag');
    await tagSelect.selectOption(targetTag);
    
    // Add a small delay to allow for filtering to complete
    await page.waitForTimeout(500);
    
    // Count how many post elements are displayed after filtering
    const filteredPostsCount = await page.locator('article').count();
    
    // Calculate how many posts should be displayed based on our data
    const expectedPostsCount = posts.filter(post => 
      post.tags.some(tag => tag.toLowerCase() === targetTag.toLowerCase())
    ).length;
    
    // Verify the correct number of posts are shown
    expect(filteredPostsCount).toBe(expectedPostsCount);
    
    // For each post in our data, verify visibility based on whether it has the target tag
    for (const post of posts) {
      const postElement = page.getByText(post.title);
      
      if (post.tags.some(tag => tag.toLowerCase() === targetTag.toLowerCase())) {
        await expect(postElement).toBeVisible();
      } else {
        // If the post shouldn't be visible, either it's not in the DOM or it's hidden
        const isVisible = await postElement.isVisible().catch(() => false);
        expect(isVisible).toBeFalsy();
      }
    }
  });

  /**
   * Test Case 2: Filtering posts by date
   * 
   * This test verifies that when a user selects a date from the dropdown,
   * only posts with that exact date are displayed.
   */
  test('should filter posts by date', async ({ page }) => {
    // Use a date from our test data
    const targetDate = posts[0].date;
    
    // Locate the date select dropdown by its accessible label and select the option
    const dateSelect = page.getByLabel('By Date');
    await dateSelect.selectOption(targetDate);
    
    // Allow time for the filtering operation to complete
    await page.waitForTimeout(500);
    
    // Calculate the expected number of posts with the target date
    const expectedPostsCount = posts.filter(post => post.date === targetDate).length;
    
    // Count the actual number of post elements displayed after filtering
    const filteredPostsCount = await page.locator('article').count();
    
    // Verify the count matches our expectation
    expect(filteredPostsCount).toBe(expectedPostsCount);
    
    // Verify each post's visibility based on whether its date matches the filter
    for (const post of posts) {
      const postElement = page.getByText(post.title);
      
      if (post.date === targetDate) {
        await expect(postElement).toBeVisible();
      } else {
        // If the post shouldn't be visible, either it's not in the DOM or it's hidden
        const isVisible = await postElement.isVisible().catch(() => false);
        expect(isVisible).toBeFalsy();
      }
    }
  });

  /**
   * Test Case 3: Clearing filters restores all posts
   * 
   * This test verifies that when a user resets the filter dropdowns,
   * all posts become visible again.
   */
  test('should show all posts when filters are cleared', async ({ page }) => {
    // First apply a filter to ensure we're starting with filtered results
    const tagSelect = page.getByLabel('By Tag');
    await tagSelect.selectOption(posts[0].tags[0]);
    
    // Allow filtering to apply
    await page.waitForTimeout(500);
    
    // Count filtered posts to ensure filtering worked
    const filteredCount = await page.locator('article').count();
    
    // Verify that filtering has reduced the number of visible posts
    expect(filteredCount).toBeLessThan(posts.length);
    
    // Clear the filter by selecting the "All Tags" option (empty value)
    await tagSelect.selectOption('');
    
    // Allow time for the UI to update after clearing the filter
    await page.waitForTimeout(500);
    
    // Verify that all posts are now visible by checking the count
    const allPostsCount = await page.locator('article').count();
    expect(allPostsCount).toBe(posts.length);
    
    // Double-check by verifying each individual post is visible
    for (const post of posts) {
      await expect(page.getByText(post.title)).toBeVisible();
    }
  });
});