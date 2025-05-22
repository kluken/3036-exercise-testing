import { test, expect } from '@playwright/test';

test.describe('Post Editing', () => {
  test.beforeEach(async ({ page }) => {
    // Reset posts and navigate to admin page
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      window.localStorage.clear();
      if (window.resetPosts) {
        window.resetPosts();
      }
    });
    
    await page.getByText('Admin Area').click();
  });

  test('should edit an existing post', async ({ page }) => {
    // Navigate to edit page for the first post    
    // Click edit button on the first post
    await page.getByRole('button', { name: 'Edit' }).first().click();
    
    // Verify edit form is loaded
    await expect(page.getByText('Edit Post')).toBeVisible();
    
    // Update post title and content
    const updatedTitle = 'Updated Post Title';
    const updatedContent = 'This content has been updated via E2E test';
    
    await page.getByTestId('post-title-input').fill(updatedTitle);
    await page.getByTestId('post-content-input').fill(updatedContent);
    
    // Add a new tag
    const currentTags = await page.getByTestId('post-tags-input').inputValue();
    await page.getByTestId('post-tags-input').fill(`${currentTags}, e2e-edited`);
    
    // Submit the form
    await page.getByTestId('post-submit-button').click();
    
    // Verify success message
    await expect(page.getByText('Post saved successfully')).toBeVisible();
    
    // Navigate back to home page
    await page.goto('http://localhost:3000');
    
    // Verify updated post is displayed
    await expect(page.getByText(updatedTitle)).toBeVisible();
    await expect(page.getByText(updatedContent)).toBeVisible();
    await expect(page.getByTestId('tag-e2e-edited')).toBeVisible();
  });
});