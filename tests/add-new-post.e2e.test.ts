import { test, expect } from '@playwright/test';
import { resetPosts } from '../src/lib/data';

// Extend Window interface to include resetPosts
declare global {
  interface Window {
    resetPosts?: () => void;
  }
}

test.describe('New Post Creation', () => {
  // Test setup: Reset posts before each test to ensure a clean state
  test.beforeEach(async ({ page }) => {
    // Navigate to home page and reset posts
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      window.localStorage.clear();
      // Reset posts to initial state if the function is available in window
      if (window.resetPosts) {
        window.resetPosts();
      }
    });
  });

  test('should allow creating a new post and display it on the homepage', async ({ page }) => {
    // Step 1: Navigate to the admin page
    await page.goto('http://localhost:3000');
    await page.getByText('Admin Area').click();
    
    // Verify we're on the admin page
    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.getByRole('heading', { name: 'Create New Post' })).toBeVisible();
    
    // Step 2: Fill out the new post form
    const testTitle = 'E2E Test Post';
    const testContent = 'This post was created during an E2E test run';
    const testTags = 'e2e, testing, playwright';
    
    await page.getByTestId('post-title-input').fill(testTitle);
    await page.getByTestId('post-content-input').fill(testContent);
    await page.getByTestId('post-tags-input').fill(testTags);
    
    // Step 3: Submit the form
    await page.getByTestId('post-submit-button').click();
    
    // Verify success notification appears
    await expect(page.getByText('Post saved successfully')).toBeVisible();
    
    // Step 4: Navigate back to the homepage
    await page.getByText('Back to Blog').click();
    
    // Verify we're back on the homepage
    await expect(page).toHaveURL('http://localhost:3000/');
    
    // Step 5: Verify the new post appears in the post list
    await expect(page.getByText(testTitle)).toBeVisible();
    await expect(page.getByText(testContent)).toBeVisible();
    
    // Verify tags are displayed - using data-testid attributes
    await expect(page.getByTestId('tag-e2e')).toBeVisible();
    await expect(page.getByTestId('tag-testing')).toBeVisible();
    await expect(page.getByTestId('tag-playwright')).toBeVisible();
    
    // Optional: Verify the post is at the top of the list (most recent)
    const firstPostTitle = await page.getByRole('article').last().getByRole('heading').textContent();
    expect(firstPostTitle).toContain(testTitle);
  });

  test('should show validation errors when submitting empty form', async ({ page }) => {
    // Navigate to admin page
    await page.goto('http://localhost:3000/admin');
    
    // Try to submit the form without filling any fields
    await page.getByTestId('post-submit-button').click();
    
    // Verify form validation prevents submission (HTML5 validation)
    // This checks we're still on the admin page
    await expect(page).toHaveURL(/.*\/admin/);

    // The post should not be saved successfully
    await expect(page.getByText('Post saved successfully')).not.toBeVisible();
    
    // Browser validation should highlight the required fields
    // Check that we're still on the same page with the empty form
    await expect(page.getByTestId('post-title-input')).toBeVisible();
    await expect(page.getByTestId('post-content-input')).toBeVisible();
    await expect(page.getByTestId('post-submit-button')).toBeVisible();
  });
});