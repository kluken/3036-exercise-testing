import { test, expect } from '@playwright/test';

test.describe('Post Deletion', () => {
  test.beforeEach(async ({ page }) => {
    // Reset posts using the app's existing resetPosts function
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      window.localStorage.clear();
      // Make sure resetPosts is properly exposed on the window object
      if (typeof window.resetPosts === 'function') {
        window.resetPosts();
      } else {
        console.error('resetPosts function not available on window object');
      }
    });
    
    // Reload the page to ensure the posts are loaded from localStorage
    await page.reload();
  });

  test('should delete a post from the admin interface', async ({ page }) => {
    // First verify we have posts on the homepage
    await page.goto('http://localhost:3000');
    const homePosts = await page.getByRole('article').count();
    console.log(`Posts on homepage: ${homePosts}`);
    expect(homePosts, 'No posts found on homepage after reset').toBeGreaterThan(0);
    
    // Navigate to admin page
    await page.goto('http://localhost:3000/admin');
    
    // Get initial post count in admin
    const initialPosts = await page.getByRole('article').count();
    console.log(`Initial posts in admin: ${initialPosts}`);
    
    // Get the first post's text content since we can't rely on heading role
    const firstPost = page.getByRole('article').first();
    const postText = await firstPost.textContent();
    console.log(`First post content: ${postText?.substring(0, 50)}...`);
    
    // Delete the first post
    await page.getByRole('button', { name: 'Delete' }).first().click();
        
    // Verify success message
    await expect(page.getByText('Post deleted successfully')).toBeVisible();
    
    // Verify post count is reduced
    const remainingPosts = await page.getByRole('article').count();
    console.log(`Remaining posts: ${remainingPosts}`);
    expect(remainingPosts).toBe(homePosts - 1);
    
    // Navigate back to homepage and verify post count is also reduced there
    await page.goto('http://localhost:3000');
    const finalHomePosts = await page.getByRole('article').count();
    console.log(`Final posts on homepage: ${finalHomePosts}`);
    expect(finalHomePosts).toBe(homePosts - 1);
  });
});